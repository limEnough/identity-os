import { buildCode, CODE_AXES } from './axis/code';
import type { Code } from './axis/code';
import type { AxisId, Profile } from './axis/types';

/**
 * 결 연표 — 네 글자에 날짜를 붙이는 곳.
 *
 * 이 제품이 성격유형 서비스와 갈라지는 자리다. 유형이 고정이면 한 번 오고 끝나지만,
 * **유형에 날짜가 붙으면 다시 올 이유가 생긴다**: 지난 계절의 나와 지금의 나를
 * 나란히 놓는 일. 「나는 계속 수정된다」가 문서의 문장이 아니라 화면의 물건이 된다.
 *
 * 순서 불변식은 건드리지 않는다. 계절이 열어주는 것은 '중간 축 다시 걷기'가 아니라
 * **한 판을 새로 걷기**다 — 1에서 8로, 처음부터. 지난 판은 지워지지 않고 여기 남는다.
 */

/** 봉인된 한 판 */
export interface ChronicleEntry {
  /** 봉인한 날 (ISO) */
  at: string;
  /** 그때의 네 글자 */
  code: string;
  codeName: string;
  /** 그때의 가치 — Identity 축이 확정한 이름 */
  value: string;
  /** 그때 여덟 축이 받은 이름들 */
  names: Array<{ id: AxisId; label: string; name: string }>;
  /** 그때의 발자국 — 지난 판의 가이드북을 그대로 펼쳐볼 수 있게 */
  query: string;
}

/** 한 판과 다음 판 사이 — 계절 하나 */
export const SEASON_DAYS = 90;

const DAY = 24 * 60 * 60 * 1000;

export const daysBetween = (from: string, to: number): number =>
  Math.floor((to - new Date(from).getTime()) / DAY);

/**
 * 여덟 축을 모두 걸었을 때만 한 판이 봉인된다 — 반쯤 걸은 나는 연표에 남기지 않는다.
 * 같은 발자국(query)이 이미 봉인돼 있으면 다시 남기지 않는다.
 */
export function sealRun(
  profile: Profile,
  query: string,
  at: number,
): ChronicleEntry | null {
  const done = profile.results.filter((r) => r.done);
  const code = buildCode(profile);
  if (!code.sealed) return null;
  return {
    at: new Date(at).toISOString(),
    code: code.key,
    codeName: code.name,
    value: done[0]?.name ?? '',
    names: done.map((r) => ({
      id: r.id,
      label: r.resultLabel,
      name: r.name,
    })),
    query,
  };
}

/** 이미 남아 있는 판이면 그대로, 새 판이면 뒤에 붙인다 (오래된 것이 앞) */
export function appendEntry(
  entries: ChronicleEntry[],
  entry: ChronicleEntry,
): ChronicleEntry[] {
  if (entries.some((e) => e.query === entry.query)) return entries;
  return [...entries, entry];
}

/** 다음 판을 권해도 좋은 때인지 — 마지막 봉인으로부터 계절 하나 */
export function seasonReady(entries: ChronicleEntry[], now: number): boolean {
  const last = entries[entries.length - 1];
  return Boolean(last) && daysBetween(last.at, now) >= SEASON_DAYS;
}

/** 다음 계절까지 남은 날 — 아직 이르면 그만큼, 이미 열렸으면 0 */
export function daysToSeason(entries: ChronicleEntry[], now: number): number {
  const last = entries[entries.length - 1];
  if (!last) return 0;
  return Math.max(0, SEASON_DAYS - daysBetween(last.at, now));
}

/** 두 판 사이에서 움직인 갈래 */
export interface CodeShift {
  /** 갈래의 이름 — "머무름 ↔ 뻗어감" */
  title: string;
  from: string;
  to: string;
}

/**
 * 지난 판과 이번 판 사이에서 움직인 갈래들.
 * 아무것도 움직이지 않았으면 빈 배열 — 그대로인 것도 결과다.
 */
export function codeShifts(before: string, after: string): CodeShift[] {
  return CODE_AXES.flatMap((axis, i) => {
    if (before[i] === after[i]) return [];
    const poleOf = (letter: string) =>
      letter === axis.plus.letter ? axis.plus.pole : axis.minus.pole;
    return [{ title: axis.title, from: poleOf(before[i]), to: poleOf(after[i]) }];
  });
}

/** 연표 한 줄에 붙는 말 — 첫 판인지, 그대로인지, 움직였는지 */
export function shiftNote(
  entries: ChronicleEntry[],
  index: number,
): { shifts: CodeShift[]; note: string } {
  const previous = entries[index - 1];
  if (!previous) return { shifts: [], note: '첫 판이에요' };
  const shifts = codeShifts(previous.code, entries[index].code);
  if (shifts.length === 0) return { shifts, note: '네 갈래 모두 그대로였어요' };
  return {
    shifts,
    note: `${shifts.length}개의 갈래가 움직였어요`,
  };
}

/** 지금 걷고 있는 판이 지난 판과 견줘 어디쯤인지 — 봉인 전에도 볼 수 있다 */
export function livingShift(
  entries: ChronicleEntry[],
  code: Code,
): CodeShift[] {
  const last = entries[entries.length - 1];
  if (!last) return [];
  return codeShifts(last.code, code.key);
}
