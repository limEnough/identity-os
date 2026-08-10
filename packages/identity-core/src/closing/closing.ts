import { CANON_KEYS, ZERO } from '../axis/canon';
import type { Canon } from '../axis/canon';
import { AXIS_COUNT, buildCode, codeCanon } from '../axis/code';
import type { Code } from '../axis/code';
import { eul } from '../josa';
import type { Profile } from '../axis/types';
import { buildTensions } from '../axis/tension';
import type { Tension } from '../axis/tension';
import { PASSAGES } from './passages';
import type { Passage } from './passages';
import { TRACKS } from './tracks';
import type { Track } from './tracks';

/**
 * 맺음 — 여덟 축을 다 걸었을 때 딱 한 번 놓이는 자리.
 *
 * 한때 여기에 **결 서재**가 있었다. 방문할 때마다 구절 하나와 노래 하나가 꽂혀
 * 반년이면 스무 칸이 되는 자리. 쌓이는 것 자체가 목적이었는데, 축마다의 쪽지와
 * 네 글자와 연표 위에 그것까지 얹히자 가이드북이 서랍이 됐다 — 무엇을 보러 왔는지
 * 잊게 하는 종류의 풍요.
 *
 * 그래서 하나로 접었다. 맺음은 셋뿐이고, 여정이 끝나야만 열린다.
 *   1. 여정 전체를 접은 **한 문장** — 여덟 축이 남긴 결이 네 갈래로 접히고,
 *      그 네 갈래가 다시 한 문장이 된다. 축의 이름을 여덟 개 나열하지 않는다.
 *   2. **한 구절, 그리고 그것이 온 책**
 *   3. **노래 하나**
 *
 * 여전히 추천이 아니라 선물이고, 여전히 판정하지 않는다(불변식 #3). 다만 이제
 * 하루에 하나씩 조르지 않는다 — 걸어서 끝냈으면 한 번에 다 받는다.
 */

export interface Closing {
  /** 여정 전체를 접은 한 문장 */
  line: string;
  /**
   * 여덟 축이 서로 당기고 있는 자리 — 없을 수도 있다.
   *
   * 한 문장이 여정을 하나로 접는다면, 이쪽은 **접히지 않은 것**을 남긴다.
   * 둘이 함께 있어야 맺음이 거울이 된다: 요약만 있으면 사람이 실제보다
   * 매끈해지고, 매끈한 요약은 자기 얘기로 읽히지 않는다.
   */
  tensions: Tension[];
  /** 한 구절, 그리고 그것이 온 곳 */
  passage: Passage;
  /** 그 곁에 놓이는 노래 하나 */
  track: Track;
}

/**
 * 맺음에 놓이는 긴장의 최대 수.
 *
 * 둘까지다. 셋을 넘기면 "당신은 이런 모순이 있고, 저런 모순도 있고…"가 되어
 * 목록으로 읽히고, 목록이 되는 순간 하나하나의 무게가 사라진다.
 */
export const CLOSING_TENSIONS = 2;

/**
 * 구절과 견줄 수 있는 모양으로 접은 결.
 *
 * 두 번 손을 본다. 먼저 네 글자와 같은 **한가운데 기준**으로 옮기고(그러지 않으면
 * 각인의 쏠림 때문에 모두가 같은 서가 앞에 선다), 그다음 축 하나 몫으로 나눈다 —
 * 구절의 결은 −1~1로 적혀 있으므로 여덟 축이 쌓인 값과 그대로 견줄 수 없다.
 */
export function closingCanon(profile: Profile): Canon {
  const walked = profile.results.filter((r) => r.done).length;
  if (walked === 0) return { ...ZERO };
  const centered = codeCanon(profile);
  const fold = (n: number) => Math.min(1, Math.max(-1, n / walked));
  return {
    reach: fold(centered.reach),
    form: fold(centered.form),
    modern: fold(centered.modern),
    outward: fold(centered.outward),
  };
}

const distance = (a: Canon, b: Canon): number =>
  CANON_KEYS.reduce((sum, key) => sum + (a[key] - b[key]) ** 2, 0);

/** 후보 중 결이 가장 가까운 하나 */
function nearest<T extends { canon: Canon }>(pool: T[], target: Canon): T {
  return pool.reduce((best, item) =>
    distance(item.canon, target) < distance(best.canon, target) ? item : best,
  );
}

/**
 * 여정 전체를 접은 한 문장.
 *
 * 재료는 둘뿐이다: 여정이 시작된 자리(동경했던 것)와 여덟 축이 남긴 결을 접은
 * 네 글자. 축의 이름 여덟 개를 이어 붙이지 않는 이유는 '나의 문장'과 같다 —
 * 대괄호 이름을 여덟 개 늘어놓으면 문장이 아니라 암호가 된다. 네 글자의 풀이말
 * (`reads`)은 전부 관형형이라 그대로 이어 붙여도 한 문장으로 읽힌다.
 */
export function closingLine(profile: Profile, code: Code): string {
  const reads = code.letters.map((letter) => letter.reads).join(', ');
  const root = profile.results.find((r) => r.id === 'identity');
  const opening = root
    ? `${root.short}${eul(root.short)} 동경하는 마음에서 시작해 `
    : '';
  return `${opening}여덟 축을 걸은 나는, ${reads} 사람으로 「${code.name}」에 닿아 있다.`;
}

/**
 * 여정의 맺음 — 여덟 축을 **모두** 걸었을 때만 열린다.
 *
 * 중간에 미리 보여주지 않는 것이 이 자리의 값이다. 축마다 조금씩 나눠 주면
 * 맺음이 아니라 적립이 된다.
 */
export function buildClosing(profile: Profile): Closing | null {
  const walked = profile.results.filter((r) => r.done).length;
  if (walked < AXIS_COUNT) return null;
  const target = closingCanon(profile);
  return {
    line: closingLine(profile, buildCode(profile)),
    tensions: buildTensions(profile).slice(0, CLOSING_TENSIONS),
    passage: nearest(PASSAGES, target),
    track: nearest(TRACKS, target),
  };
}
