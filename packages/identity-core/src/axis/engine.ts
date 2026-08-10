import { project, scaleCanon, sumCanon, ZERO } from './canon';
import type { Canon } from './canon';
import { freshTension } from './tension';
import { gwa, ieyo } from '../josa';
import type {
  AxisDef,
  AxisOption,
  AxisOutcome,
  AxisProbe,
  AxisResult,
  AxisState,
  NamedOutcome,
  Profile,
  Triple,
} from './types';

/**
 * 여덟 축이 함께 쓰는 리플레이 엔진.
 *
 * 원본 상태는 응답 시퀀스(발자국) 하나뿐이고, 화면 상태는 전부 결정론적 리플레이로 파생된다.
 * 축이 다른 것은 데이터(AxisDef)뿐이다 — 걸음의 수와 모양, 좌표를 접는 방식,
 * 명명이 되묻는 방식은 여기 한 곳에만 적혀 있다.
 *
 * 그리고 이 엔진은 언제나 프로필을 함께 받는다. 앞선 축이 확정한 것이
 * 좌표의 출발점을 기울이고(project), 물음의 말끝과 결과의 변주에 그대로 실린다 —
 * 여정이 1에서 8로 흐르는 데는 이유가 있고, 잎은 뿌리 없이 자라지 않는다.
 */

/** 넘어간 걸음의 기록값 — 건너뜀도 존중되는 데이터다 */
export const SKIP = 9;

/** 축 하나는 언제나 여섯 걸음 (0 입구 · 1 구체 · 2~4 깊은 물음 · 5 명명) */
export const AXIS_STEPS = 6;

/** 좌표를 0~1로 접는 폭 — 다섯 걸음의 delta에 앞 축의 기울기가 하나 더 얹힌다 */
const SPREAD = 4;

export const emptyProfile = (): Profile => ({ results: [], acc: ZERO });

export function initialAxisState(): AxisState {
  return {
    stepIndex: 0,
    opening: null,
    child: null,
    probes: [null, null, null],
    skipped: [false, false, false],
    outcome: null,
    name: null,
    tentative: false,
  };
}

/* ── 좌표 ── */

export interface AxisCoord {
  left: string;
  right: string;
  /** 0(완전히 왼쪽) ~ 1(완전히 오른쪽) */
  pos: number;
}

/** 앞선 축들이 이 축의 세 극에 주는 기울기 — 한 걸음의 절반 아래 */
function leanOf(def: AxisDef, profile: Profile): Triple {
  return project(profile.acc, def.projection);
}

/**
 * 지금까지의 선택이 만든 좌표 — 화면의 축 막대이자 결과 판정의 입력.
 * 넘어간 걸음은 0을 더한다(중앙에 남는다).
 */
export function axisCoords(
  def: AxisDef,
  state: AxisState,
  profile: Profile,
): AxisCoord[] {
  const shifts: Triple[] = [
    leanOf(def, profile),
    state.opening?.shift,
    state.child?.shift,
    ...state.probes.map((p) => p?.shift),
  ].filter((s): s is Triple => Boolean(s));

  return def.poles.map((pole, i) => {
    const sum = shifts.reduce((acc, s) => acc + s[i], 0);
    const pos = (sum / SPREAD + 1) / 2;
    return { ...pole, pos: Math.min(1, Math.max(0, pos)) };
  });
}

/** 축마다 절반으로 갈라 얻은 8분면 — 비트 순서가 outcomes의 배열 순서와 같다 */
const octantOf = (coords: AxisCoord[]): number =>
  coords.reduce((acc, c) => acc * 2 + (c.pos < 0.5 ? 0 : 1), 0);

export function resolveOutcome(
  def: AxisDef,
  state: AxisState,
  profile: Profile,
): AxisOutcome {
  return def.outcomes[octantOf(axisCoords(def, state, profile))];
}

/**
 * 가장 아슬아슬했던 축 하나를 뒤집은 이웃 결과.
 * 8분면은 경계에서 갈린다 — 0.49와 0.51은 다른 이름을 받지만 거의 같은 사람이다.
 */
export function neighborOutcome(
  def: AxisDef,
  state: AxisState,
  profile: Profile,
): AxisOutcome {
  const coords = axisCoords(def, state, profile);
  const bits: number[] = coords.map((c) => (c.pos < 0.5 ? 0 : 1));
  const nearest = coords.reduce(
    (best, c, i) =>
      Math.abs(c.pos - 0.5) < Math.abs(coords[best].pos - 0.5) ? i : best,
    0,
  );
  bits[nearest] = bits[nearest] === 1 ? 0 : 1;
  return def.outcomes[bits.reduce((acc, bit) => acc * 2 + bit, 0)];
}

/** 가장 크게 기운 극의 이름 — 같은 결과 안에서도 어느 쪽으로 쏠렸는지 */
export function dominantTilt(coords: AxisCoord[]): string {
  const c = coords.reduce((a, b) =>
    Math.abs(b.pos - 0.5) > Math.abs(a.pos - 0.5) ? b : a,
  );
  return c.pos >= 0.5 ? c.right : c.left;
}

/* ── 결과 변주 ── */

/** 발자국에서 뽑는 결정론적 수 — 같은 길은 언제나 같은 변주에 닿는다 */
function walkHash(state: AxisState): number {
  const parts = [
    state.opening?.label.length ?? 0,
    state.child?.label.length ?? 0,
    ...state.probes.map((p) => p?.label.length ?? 1),
  ];
  return parts.reduce((acc, n, i) => acc + n * (i + 3), 0);
}

/**
 * 결과의 변주 하나 — 앞선 축이 쌓일수록 열리는 폭이 넓어진다.
 * 여덟 번째 축에 닿은 사람은 일곱 축의 결을 데리고 오므로, 같은 8분면 안에서도
 * 훨씬 세밀한 자리에 선다. 판정의 가지수가 아니라 거울의 해상도다.
 */
export function outcomeVariant(
  outcome: AxisOutcome,
  state: AxisState,
  profile: Profile,
): string {
  if (outcome.variants.length === 0) return '';
  const open = Math.min(outcome.variants.length, 1 + profile.results.length);
  return outcome.variants[walkHash(state) % open];
}

/* ── 명명 ── */

interface Candidate {
  outcome: AxisOutcome;
  name: string;
}

/**
 * 명명 단계가 내미는 이름들.
 * octant 축은 좌표에서(제안 · 같은 결의 다른 이름 · 경계 너머의 이웃),
 * child 축은 고른 갈래가 데려온 이름 셋에서 나온다.
 */
export function nameCandidates(
  def: AxisDef,
  state: AxisState,
  profile: Profile,
): Candidate[] {
  if (def.naming === 'child') {
    const names = state.child?.names;
    if (!names) return [];
    // child 축은 이름마다 결과가 따로 없다 — 좌표가 결(tag·닻·각인)을 정하고 이름만 갈린다
    const base = resolveOutcome(def, state, profile);
    return names.map((name) => ({ outcome: base, name }));
  }
  const proposed = resolveOutcome(def, state, profile);
  const neighbor = neighborOutcome(def, state, profile);
  return [
    { outcome: proposed, name: proposed.name },
    { outcome: proposed, name: proposed.alt },
    { outcome: neighbor, name: neighbor.name },
  ];
}

function namedOutcome(
  def: AxisDef,
  candidate: Candidate,
  state: AxisState,
  profile: Profile,
): NamedOutcome {
  const { outcome, name } = candidate;
  // 이름마다 결이 따로 적힌 축(Identity)은 그 결을 쓰고, 좌표는 변주만 고른다
  const own = def.namedOutcomes?.[name];
  return {
    name,
    tag: own?.tag ?? outcome.tag,
    // 이름이 은유일 수 있으므로 뜻은 언제나 쉬운 한 줄로 함께 간다
    summary: own?.tag ?? outcome.summary ?? outcome.tag,
    clause: own?.tag ?? outcome.clause ?? outcome.summary ?? outcome.tag,
    fits: outcome.fits ?? [],
    strains: outcome.strains ?? [],
    imprint: own?.imprint ?? outcome.imprint,
    pull: own?.pull ?? outcome.pull ?? {},
    facets: outcome.facets,
    variants: outcome.variants,
    variant: outcomeVariant(outcome, state, profile),
  };
}

/* ── 긴장의 물음 ── */

/**
 * 긴장의 물음이 놓이는 자리 — **마지막 깊은 물음**.
 *
 * 앞의 둘은 비워둔다. 첫째는 입구에 매인 물음(scoped)이라 이 축에서 가장 구체적인
 * 자리이고, 둘째는 이 축의 결을 가르는 물음이라 좌표가 여기서 선다. 셋째에 오면
 * 사용자는 이미 이 축에 대해 할 말을 대부분 했고, 그때 앞선 축들이 끼어든다.
 */
export const TENSION_SLOT = 2;

/**
 * 걸어온 축들이 서로 당기고 있으면, 이 축의 마지막 깊은 물음이 **통째로 갈린다**.
 *
 * 여기가 앞 축과 뒤 축이 실제로 만나는 유일한 자리다. 그전까지 앞 축이 뒤 축에
 * 미치는 영향은 좌표를 조금 기울이는 것뿐이었는데(§canon `project`), 그 기울기는
 * 상한이 한 걸음의 절반 아래라 일곱 축을 걸어온 사람에게도 클릭 한 번만큼도
 * 되지 않았다. 걸어온 것이 **묻는 말 자체를 바꿀 때**에야 여정이 하나가 된다.
 *
 * 물음은 판정하지 않는다. 어느 쪽이 옳은지 묻지 않고 "여기서는 어느 쪽이 이기는지"만
 * 묻는다 — 같은 사람이 자리마다 다른 쪽을 고르는 것은 모순이 아니라 사실이므로.
 *
 * 선택지의 delta는 새로 적지 않는다. 양쪽 결과가 이미 갖고 있는 각인을 이 축의
 * 세 극으로 투영해서 쓴다 — 「깊어지는 장인」 쪽을 고르면 그 결과가 이 축에
 * 남겼을 기울기를 그대로 받는다.
 */
export function tensionProbe(def: AxisDef, profile: Profile): AxisProbe | null {
  // 바로 앞 축이 **새로 연** 긴장만 묻는다 — 같은 둘을 남은 여정 내내 다시 꺼내지 않도록
  const found = freshTension(profile);
  if (!found) return null;
  const { axis, minus, plus } = found;
  // 각인은 −1~1로 적혀 있으므로 축 하나 몫(soften 1)으로 받아 한 걸음보다 작게 묶는다
  const lean = (result: AxisResult): Triple =>
    project(result.imprint, def.projection, 0.7, 1);

  return {
    title: `「${minus.name}」${gwa(minus.name)} 「${plus.name}」,\n여기서는 어느 쪽이 이기나요?`,
    sub: `${found.line} ${axis.note}`,
    skipLabel: '여기서는 그 둘이 부딪히지 않아요 — 넘어갈래요',
    options: [
      {
        title: `「${minus.name}」 쪽이 이겨요`,
        label: `${axis.minus.pole} 쪽`,
        phrase: axis.minus.reads,
        shift: lean(minus),
      },
      {
        title: `「${plus.name}」 쪽이 이겨요`,
        label: `${axis.plus.pole} 쪽`,
        phrase: axis.plus.reads,
        shift: lean(plus),
      },
      {
        title: '둘 다 놓지 못해서 늘 저울질해요',
        label: '둘 사이에서 저울질',
        phrase: '두 마음 사이에서 저울질하던 자리',
        shift: [0, 0, 0],
      },
      {
        title: '때에 따라 다르게 골라요',
        label: '때에 따라 다름',
        phrase: '그때그때 다른 쪽을 고르던 자리',
        shift: [0, 0, 0],
      },
    ],
  };
}

/**
 * 이 걸음에서 실제로 던져지는 물음 — 대개는 축 데이터의 것, 긴장이 있으면 그것.
 * 프로필은 발자국에서 결정론적으로 복원되므로, 리플레이는 언제나 같은 물음에 닿는다.
 */
export function probeAt(
  def: AxisDef,
  probeIndex: number,
  profile: Profile,
): AxisProbe {
  if (probeIndex === TENSION_SLOT) {
    const asked = tensionProbe(def, profile);
    if (asked) return asked;
  }
  return def.probes[probeIndex];
}

/* ── 리플레이 ── */

function optionsOf(
  def: AxisDef,
  state: AxisState,
  probeIndex: number,
  profile: Profile,
): AxisOption[] {
  const probe = probeAt(def, probeIndex, profile);
  if (probe.options === 'scoped') return state.opening?.scoped ?? [];
  return probe.options;
}

function applyChoice(
  def: AxisDef,
  state: AxisState,
  choice: number,
  profile: Profile,
): AxisState | null {
  const next: AxisState = {
    ...state,
    probes: [...state.probes] as AxisState['probes'],
    skipped: [...state.skipped] as AxisState['skipped'],
  };

  switch (state.stepIndex) {
    case 0:
      if (!def.openings[choice]) return null;
      next.opening = def.openings[choice];
      break;
    case 1:
      if (!state.opening?.children[choice]) return null;
      next.child = state.opening.children[choice];
      break;
    case 2:
    case 3:
    case 4: {
      const i = state.stepIndex - 2;
      if (choice === SKIP) {
        next.skipped[i] = true;
        break;
      }
      const option = optionsOf(def, state, i, profile)[choice];
      if (!option) return null;
      next.probes[i] = option;
      break;
    }
    case 5: {
      if (!state.opening || !state.child) return null;
      const candidates = nameCandidates(def, state, profile);
      if (candidates.length === 0) return null;
      // 마지막 선택지는 "아직 잘 모르겠어요" — 이름은 제안대로 두되 임시로 표시한다
      const tentative = choice === candidates.length;
      const picked = tentative ? candidates[0] : candidates[choice];
      if (!picked) return null;
      next.outcome = namedOutcome(def, picked, state, profile);
      next.name = picked.name;
      next.tentative = tentative;
      break;
    }
    default:
      return null;
  }

  next.stepIndex = state.stepIndex + 1;
  return next;
}

export interface AxisReplay {
  state: AxisState;
  done: boolean;
  valid: boolean;
  applied: number;
}

/**
 * @param profile 앞선 축들이 확정한 것. 이 축의 좌표는 그 위에서 출발한다 —
 *                프로필이 다르면 같은 발자국도 다른 결과에 닿는다.
 */
export function replayAxis(
  def: AxisDef,
  seq: number[],
  profile: Profile = emptyProfile(),
): AxisReplay {
  let state = initialAxisState();
  let applied = 0;
  for (const choice of seq) {
    if (state.stepIndex >= AXIS_STEPS) break;
    const next = applyChoice(def, state, choice, profile);
    if (!next) return { state, done: false, valid: false, applied };
    state = next;
    applied += 1;
  }
  return {
    state,
    done: state.stepIndex >= AXIS_STEPS,
    valid: true,
    applied,
  };
}

/* ── UI가 소비하는 단계 기술자 ── */

export interface StepOption {
  emoji?: string;
  title: string;
  sub?: string;
  /** 시퀀스에 기록할 값 */
  choice: number;
}

export interface AxisStep {
  kind: 'choice' | 'naming';
  title: string;
  sub?: string;
  /** 명명 단계: 오브 코치의 발화 (단정이 아니라 제안) */
  coachLines?: string[];
  options: StepOption[];
  /** "넘어갈래요" 허용 여부 — 자기 탐색은 자발적일 때만 유효하다 */
  skippable: boolean;
  skipLabel?: string;
}

/** 앞 축을 물음의 말끝에 실어 보낸다 — 무엇 위에서 고르고 있는지 잊지 않도록 */
function rootCite(profile: Profile): AxisResult | undefined {
  const done = profile.results.filter((r) => r.done);
  return done[done.length - 1];
}

function defaultCoachLines(
  def: AxisDef,
  args: { proposed: string; tilt: string; profile: Profile },
): string[] {
  const root = rootCite(args.profile);
  return [
    root
      ? `앞서 고른 ${root.resultLabel} 「${root.name}」${gwa(root.name)} 함께 보면,`
      : '고른 것들을 모아보니,',
    `「${args.proposed}」에 가까운 것 같아요.`,
    `${args.tilt} 쪽에 조금 더 가까웠어요.`,
    '맞나요?',
  ];
}

export function currentAxisStep(
  def: AxisDef,
  state: AxisState,
  profile: Profile,
): AxisStep | null {
  const root = rootCite(profile);

  switch (state.stepIndex) {
    case 0:
      return {
        kind: 'choice',
        title: root
          ? def.openingProbe.title.replace('{root}', `「${root.name}」`)
          : def.openingProbe.title.replace(/^.*\{root\}[^\n]*\n?/, ''),
        sub: def.openingProbe.sub,
        options: def.openings.map((o, i) => ({
          emoji: o.emoji,
          title: o.title,
          sub: o.sub,
          choice: i,
        })),
        skippable: false,
      };
    case 1:
      return {
        kind: 'choice',
        title: def.childProbe.title,
        sub: def.childProbe.sub,
        options: (state.opening?.children ?? []).map((c, i) => ({
          title: c.title,
          choice: i,
        })),
        skippable: false,
      };
    case 2:
    case 3:
    case 4: {
      const i = state.stepIndex - 2;
      // 걸어온 축들이 서로 당기고 있으면 여기서 물음이 통째로 갈린다
      const probe = probeAt(def, i, profile);
      return {
        kind: 'choice',
        title: probe.title,
        sub: probe.sub,
        options: optionsOf(def, state, i, profile).map((o, idx) => ({
          emoji: o.emoji,
          title: o.title,
          choice: idx,
        })),
        skippable: true,
        skipLabel: probe.skipLabel,
      };
    }
    case 5: {
      const candidates = nameCandidates(def, state, profile);
      if (candidates.length === 0) return null;
      const tilt = dominantTilt(axisCoords(def, state, profile));
      const [proposed, other, neighbor] = candidates;
      const lines = def.coachLines
        ? def.coachLines({
            proposed: proposed.name,
            other: other.name,
            neighbor: neighbor?.name,
            tilt,
            profile,
            state,
          })
        : defaultCoachLines(def, { proposed: proposed.name, tilt, profile });

      const options: StepOption[] = [
        { title: `맞아요 — 「${proposed.name}」${ieyo(proposed.name)}`, choice: 0 },
        ...candidates.slice(1).map((c, idx) => ({
          title:
            def.naming === 'octant' && idx === 1
              ? `조금 다른 쪽이에요 — 「${c.name}」`
              : `비슷하지만, 「${c.name}」에 더 가까워요`,
          choice: idx + 1,
        })),
        {
          title: '아직 잘 모르겠어요 — 일단 이 이름으로 둘게요',
          choice: candidates.length,
        },
      ];

      return { kind: 'naming', title: '', coachLines: lines, options, skippable: false };
    }
    default:
      return null;
  }
}

/**
 * 지금까지의 발견 조각. 첫 자리는 이 축의 것이 아니라 뿌리에서 가져온다 —
 * 무엇 위에서 고르고 있는지 잊지 않도록.
 */
export function axisInsights(
  def: AxisDef,
  state: AxisState,
  profile: Profile,
): string[] {
  const chips: string[] = [];
  for (const prior of profile.results.filter((r) => r.done).slice(-2)) {
    chips.push(`${prior.resultLabel} — 「${prior.name}」`);
  }
  if (state.opening) chips.push(`${def.chipLabels[0]} — ${state.opening.label}`);
  if (state.child) chips.push(`${def.chipLabels[1]} — ${state.child.label}`);
  state.probes.forEach((p, i) => {
    if (!p) return;
    // 긴장의 물음에 답했으면 그 축의 꼬리표가 아니라 '당김'으로 적힌다 — 물음이 달랐으므로
    const asked =
      i === TENSION_SLOT && tensionProbe(def, profile)
        ? '당김'
        : def.chipLabels[2 + i];
    chips.push(`${asked} — ${p.label}`);
  });
  if (state.name) chips.push(`${def.resultLabel} — 「${state.name}」`);
  return chips;
}

/**
 * 가이드북 한 줄 — 이름과, 그 이름을 풀어 쓴 한 줄.
 *
 * 한때 여기에 변주와 가장 크게 기운 극을 중점으로 이어 붙였는데,
 * 세 겹의 추상이 되어 읽는 사람에게 수수께끼가 됐다. 한 줄은 한 뜻만 갖는다.
 * 명명 전이면 빈 문자열이라, 호출부가 '열림' 상태를 그대로 쓴다.
 */
export function axisNote(
  def: AxisDef,
  state: AxisState,
  profile: Profile,
): string {
  if (!state.outcome || !state.name) return '';
  return `「${state.name}」 — ${state.outcome.summary}`;
}

/** 이 축이 뒤 축에 넘겨주는 것 — 확정된 이름과 각인 하나 */
export function axisResult(
  def: AxisDef,
  replay: AxisReplay,
): AxisResult | null {
  const { state } = replay;
  if (!state.outcome || !state.name || !state.opening) return null;
  return {
    id: def.id,
    axisName: def.name,
    resultLabel: def.resultLabel,
    name: state.name,
    tag: state.outcome.tag,
    summary: state.outcome.summary,
    clause: state.outcome.clause,
    short: state.opening.short,
    imprint: state.outcome.imprint,
    pull: state.outcome.pull,
    tentative: state.tentative,
    done: replay.done,
  };
}

/** 확정된 결과들을 누적 결로 접는다 — 임시 확정은 절반만 각인된다 */
export function buildProfile(results: AxisResult[]): Profile {
  const imprints: Canon[] = results.map((r) =>
    r.tentative ? scaleCanon(r.imprint, 0.5) : r.imprint,
  );
  // 배열을 복사해 둔다 — 여정을 순서대로 걸으며 뒤 축의 결과를 밀어 넣어도
  // 앞 축이 들고 있던 프로필이 뒤늦게 바뀌지 않도록 (각 축은 자기 앞만 본다)
  return { results: [...results], acc: sumCanon(imprints) };
}
