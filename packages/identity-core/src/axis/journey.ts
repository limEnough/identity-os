import { AXES } from './axes';
import { buildProfile, replayAxis, axisResult, AXIS_STEPS } from './engine';
import type { AxisReplay } from './engine';
import { decodeSeq, encodeSeq } from '../seq';
import type { AxisDef, AxisId, AxisResult, Profile } from './types';

/**
 * 여정의 순서 — 1에서 8까지, 순서가 곧 의존이다.
 *
 *   1 Identity → 2 Mindset → 3 Communication → 4 Lifestyle
 *   → 5 Taste → 6 Style → 7 Health → 8 Career
 *
 * 규칙은 셋뿐이다.
 *   1. 축 N은 그 앞의 축들이 모두 완주됐을 때만 열린다. 건너뛰기는 없다.
 *   2. 다시 걸을 수 있는 것은 **바로 앞의 축 하나**다 — 가장 마지막에 확정한 것.
 *      뒤 축이 그 위에 얹혀 있으므로, 더 앞으로 되돌아가면 얹힌 것들이 무너진다.
 *   3. 축을 지날 때마다 결과가 프로필에 각인되고, 다음 축은 그 위에서 출발한다.
 *      그래서 8번에 닿은 사람은 일곱 축의 결을 데리고 오고, 결과는 그만큼 세밀해진다.
 *
 * 이 규칙은 문서가 아니라 여기서 강제된다 — 앱 셸의 라우트 가드가 이 계산을 그대로 쓴다.
 */

export { AXES };

export const axisById = (id: string): AxisDef | undefined =>
  AXES.find((a) => a.id === id);

export const axisIndex = (id: AxisId): number =>
  AXES.findIndex((a) => a.id === id);

/** 축마다 발자국 하나 — 원본 상태는 이것뿐이다 */
export type Footprints = Partial<Record<AxisId, number[]>>;

export type AxisStatus = 'done' | 'current' | 'locked';

export interface JourneyStep {
  def: AxisDef;
  /** 어긋난 부분을 덜어낸 발자국 */
  seq: number[];
  replay: AxisReplay;
  /** 이 축을 걸을 때 앞에 있던 것들 */
  profile: Profile;
  status: AxisStatus;
  /** 다시 걸을 수 있는지 — 가장 마지막에 확정한 축 하나만 */
  editable: boolean;
}

export interface Journey {
  steps: JourneyStep[];
  /** 지금 걸어야 할 축 — 여덟 축을 다 걸었으면 null */
  current: AxisDef | null;
  /** 확정된 축들의 결과와 누적 결 */
  profile: Profile;
  /** 축을 통틀어 걸어온 걸음 수 */
  walked: number;
}

/**
 * 발자국들을 순서대로 되짚어 여정 전체를 복원한다.
 *
 * 앞 축이 끝나지 않았으면 뒤 축의 발자국은 **읽지 않는다** — 순서를 어긴 기억은
 * 기억이 아니라 오류이므로. 어긋난 발자국은 어긋나기 직전까지만 살린다.
 */
export function walkJourney(footprints: Footprints): Journey {
  const steps: JourneyStep[] = [];
  const results: AxisResult[] = [];
  let open = true;
  let walked = 0;

  for (const def of AXES) {
    const profile = buildProfile(results);

    if (!open) {
      steps.push({
        def,
        seq: [],
        replay: replayAxis(def, [], profile),
        profile,
        status: 'locked',
        editable: false,
      });
      continue;
    }

    const raw = footprints[def.id] ?? [];
    const probe = replayAxis(def, raw, profile);
    const seq = raw.slice(0, probe.applied);
    const replay = replayAxis(def, seq, profile);
    walked += seq.length;

    if (replay.done) {
      const result = axisResult(def, replay);
      if (result) results.push(result);
      steps.push({ def, seq, replay, profile, status: 'done', editable: false });
      continue;
    }

    // 여기가 여정의 앞머리 — 이 축을 걷는 중이고, 뒤 축은 모두 잠긴다
    steps.push({ def, seq, replay, profile, status: 'current', editable: false });
    open = false;
  }

  // 다시 걸을 수 있는 것은 마지막으로 확정한 축 하나뿐
  const lastDone = [...steps].reverse().find((s) => s.status === 'done');
  if (lastDone) lastDone.editable = true;

  const current = steps.find((s) => s.status === 'current')?.def ?? null;
  return { steps, current, profile: buildProfile(results), walked };
}

export const journeyStep = (journey: Journey, id: AxisId): JourneyStep =>
  journey.steps[axisIndex(id)];

/** 이 축을 지금 걸어도 되는지 — 라우트 가드가 묻는 단 하나의 질문 */
export function canWalk(journey: Journey, id: AxisId): boolean {
  const step = journeyStep(journey, id);
  return step.status === 'current' || (step.status === 'done' && step.editable);
}

/** 여정을 통틀어 필요한 걸음 수 */
export const JOURNEY_STEPS = AXES.length * AXIS_STEPS;

/* ── 주소 ── */

/** 발자국 전부를 주소 조각으로 — 걸어온 축은 언제나 함께 실려 다닌다 */
export function journeyQuery(footprints: Footprints): string {
  return AXES.filter((def) => (footprints[def.id] ?? []).length > 0)
    .map((def) => `${def.param}=${encodeSeq(footprints[def.id] ?? [])}`)
    .join('&');
}

/** 주소에서 발자국들을 읽는다 */
export function footprintsFromQuery(
  get: (param: string) => string | null | undefined,
): Footprints {
  const footprints: Footprints = {};
  for (const def of AXES) {
    const seq = decodeSeq(get(def.param));
    if (seq.length > 0) footprints[def.id] = seq;
  }
  return footprints;
}

/** 적어둔 주소 조각에서 발자국을 되짚는다 — 연표에 남은 지난 판을 읽을 때 */
export const footprintsFromSearch = (search: string): Footprints => {
  const params = new URLSearchParams(search);
  return footprintsFromQuery((p) => params.get(p));
};

/**
 * 그 발자국이 **여덟 축을 다 걸은 것**인지.
 *
 * 연표에는 봉인된 판만 들어가지만(§sealRun), 읽는 쪽에서 한 번 더 묻는다.
 * 저장은 브라우저에 있고 판의 모양은 축 데이터가 바뀌면 함께 바뀐다 —
 * 예전 형식이나 손상된 값이 '완주'로 놓이면 사용자가 걷지 않은 판을 걸었다고
 * 읽게 되므로, 완주라고 부르기 전에 실제로 걸어본다.
 */
export const isSealedQuery = (search: string): boolean =>
  walkJourney(footprintsFromSearch(search)).current === null;

/** 축 하나의 주소 — 걸어온 발자국을 모두 데리고 간다 */
export function axisHref(def: AxisDef, footprints: Footprints): string {
  const query = journeyQuery(footprints);
  return `/${def.id}${query ? `?${query}` : ''}`;
}

export function guideHref(footprints: Footprints): string {
  const query = journeyQuery(footprints);
  return `/guide${query ? `?${query}` : ''}`;
}

/** 이어 걸을 자리 — 앞머리 축이 있으면 그곳, 다 걸었으면 가이드북 */
export function resumeHref(footprints: Footprints): string {
  const journey = walkJourney(footprints);
  const front = journey.steps.find((s) => s.status === 'current');
  // 걷다 만 축이 있으면 그 자리로, 방금 한 축을 끝냈으면 가이드북으로
  if (front && front.seq.length > 0) return axisHref(front.def, footprints);
  return guideHref(footprints);
}
