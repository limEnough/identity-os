import { ZERO } from './canon';
import { PULL_AXES, pullAt, scalePull } from './pull';
import type { PullAxis } from './pull';
import type { AxisResult, Profile } from './types';

/**
 * 긴장 — 걸어온 축 둘이 **서로 반대쪽으로 당기고 있는** 자리.
 *
 * 여정의 결과들은 지금까지 한 번도 서로를 마주 본 적이 없었다. 축을 지날 때마다
 * 각인이 하나의 벡터로 더해졌고(§canon), 더하기는 반대를 지운다 — 자유를 동경하며
 * 안정된 하루를 지은 사람이 '가운데쯤'으로 접혔다. 가장 할 말이 많은 사람이
 * 가장 할 말이 없는 사람으로 나오는 셈법이었다.
 *
 * 여기서는 더하지 않고 **마주 세운다.** 같은 갈래에서 한쪽 끝과 다른 쪽 끝을
 * 각각 잡고 있는 결과가 있으면, 그 벌어짐 자체를 꺼내 보여준다.
 *
 * 지키는 것 셋:
 *  1. **판정하지 않는다.** "당신은 모순적이다"가 아니라 "이 둘이 함께 있다"이다.
 *     모순은 고칠 것이 아니라 그 사람이 지고 있는 것이고, 대개 그게 그 사람이다.
 *  2. **양쪽 모두의 값을 적는다.** 어느 쪽으로 가라고 말하지 않는다 — 트레이드오프를
 *     트레이드오프라고 말해주는 데까지가 거울의 일이다(불변식 #3).
 *  3. **아무 데서나 나오지 않는다.** 양쪽 다 또렷하게(`PULLED`) 당기고, 벌어짐이
 *     충분히(`TENSION`) 클 때만. 흔하면 뜻이 없어진다.
 */

/** 한쪽으로 또렷하게 당긴다고 볼 최소 크기 */
export const PULLED = 0.4;

/**
 * 두 결과가 서로를 당긴다고 볼 최소 벌어짐.
 *
 * 1.2는 한쪽이 또렷하고(0.4) 다른 쪽이 세게(0.8) 당길 때 겨우 넘는 값이다.
 * 1.0으로 두었더니 0.4끼리 맞물린 쌍까지 올라와, 살짝 기운 결과가 "가능성을
 * 열어두는 쪽"이라고 단정되어 읽혔다 — 긴장이라고 부를 만한 것만 부른다.
 */
export const TENSION = 1.2;

export interface Tension {
  /** 어느 갈래에서 벌어졌는지 */
  axis: PullAxis;
  /** 음(−) 쪽 끝을 잡고 있는 결과 */
  minus: AxisResult;
  /** 양(+) 쪽 끝을 잡고 있는 결과 */
  plus: AxisResult;
  /** 벌어진 크기 (`TENSION` ~ 2) */
  gap: number;
  /** 두 축을 나란히 놓은 관찰 한 줄 */
  line: string;
}

/** 임시 확정은 절반만 당긴다 — 각인(buildProfile)과 같은 셈법 */
const pullOf = (result: AxisResult) =>
  result.tentative ? scalePull(result.pull, 0.5) : result.pull;

/** 두 축을 나란히 놓기만 한다 — 판단은 읽는 사람의 몫이다 */
function tensionLine(axis: PullAxis, minus: AxisResult, plus: AxisResult): string {
  return [
    `${minus.axisName}에서는 「${minus.name}」 — ${axis.minus.reads}.`,
    `${plus.axisName}에서는 「${plus.name}」 — ${axis.plus.reads}.`,
  ].join(' ');
}

/**
 * 걸어온 축들 사이에서 벌어진 긴장들 — 크게 벌어진 순서로.
 *
 * 갈래 하나에서는 **가장 멀리 벌어진 한 쌍만** 꺼낸다. 같은 갈래의 셋을
 * 늘어놓으면 목록이 되고, 목록은 아무도 읽지 않는다.
 */
export function buildTensions(profile: Profile): Tension[] {
  const done = profile.results.filter((r) => r.done);
  const found: Tension[] = [];

  for (const axis of PULL_AXES) {
    let minus: AxisResult | null = null;
    let plus: AxisResult | null = null;
    let low = 0;
    let high = 0;

    for (const result of done) {
      const value = pullAt(pullOf(result), axis.key);
      if (value <= -PULLED && value < low) {
        low = value;
        minus = result;
      }
      if (value >= PULLED && value > high) {
        high = value;
        plus = result;
      }
    }

    if (!minus || !plus || high - low < TENSION) continue;
    found.push({
      axis,
      minus,
      plus,
      gap: high - low,
      line: tensionLine(axis, minus, plus),
    });
  }

  return found.sort((a, b) => b.gap - a.gap);
}

/** 가장 크게 벌어진 긴장 하나 — 없으면 null. 맺음이 읽는 것 */
export const strongestTension = (profile: Profile): Tension | null =>
  buildTensions(profile)[0] ?? null;

/**
 * **방금 벌어진** 긴장 하나 — 바로 앞 축이 확정되면서 새로 열린 갈래.
 *
 * 걷는 중에 물음을 바꾸는 것은(§engine) 언제나 이것이지 `strongestTension`이 아니다.
 * 처음엔 가장 큰 긴장을 계속 물었는데, 한 번 열린 긴장은 여정이 끝날 때까지
 * 남아 있으므로 그 뒤 여섯 축이 전부 같은 두 이름을 다시 꺼냈다 — 앞 축이 뒤 축을
 * 바꾸는 게 아니라 앞 축 하나가 남은 여정을 점령하는 꼴이었다.
 *
 * 그래서 **새로 열릴 때만** 묻는다. 갈래는 넷뿐이라 한 여정에서 많아야 네 번이고,
 * 대개 한두 번이다. 인과도 이쪽이 맞다: 방금 고른 것 때문에 벌어진 자리를
 * 바로 다음 걸음에서 묻는 것이므로.
 */
export function freshTension(profile: Profile): Tension | null {
  const now = buildTensions(profile);
  if (now.length === 0) return null;
  // 누적 결(acc)은 보지 않는다 — 긴장은 더해지지 않고 결과들 사이에서만 읽힌다
  const earlier: Profile = { results: profile.results.slice(0, -1), acc: ZERO };
  const before = new Set(buildTensions(earlier).map((t) => t.axis.key));
  return now.find((t) => !before.has(t.axis.key)) ?? null;
}
