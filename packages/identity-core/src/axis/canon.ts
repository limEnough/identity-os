/**
 * 축을 가로지르는 '결' 벡터 — 여덟 축이 공유하는 단 하나의 좌표계.
 *
 * 축마다 묻는 것은 다르지만(생각·관계·하루·끌림·몸·성장), 그 답들이 남기는 결은
 * 같은 네 갈래로 모인다. 축을 하나 지날 때마다 그 축의 결과가 이 벡터에 각인되고(imprint),
 * 다음 축은 이 벡터를 자기 세 축으로 투영해 좌표의 출발점을 기울인다.
 *
 * 그래서 뒤로 갈수록 답이 세밀해진다 — 여덟 번째 축은 일곱 축의 결을 이미 알고 묻는다.
 * 다만 기울기는 언제나 한 걸음의 절반 아래로 묶어둔다: 판정이 아니라 출발점이므로.
 */

/**
 * 네 갈래의 결. 각 값은 −1 ~ +1이고, 이름은 양(+)의 방향을 가리킨다.
 *
 * 이름은 **여덟 축이 실제로 이 갈래로 재고 있는 것**을 따른다. 한때 `vivid`·`sharp`
 * (고요함↔생동감 · 부드러움↔또렷함)였는데, 그건 이 좌표가 추구미의 미학 어휘에서
 * 왔기 때문이고 여덟 축으로 넓히면서 이름만 그대로 남은 것이었다. Taste·Style에는
 * 정확했지만 Career의 「쌓는 쪽↔뻗는 쪽」이나 Mindset의 「느낌으로↔따져서」를
 * '생동감'·'또렷함'이라 부르는 것은 사실과 달랐다.
 */
export interface Canon {
  /**
   * 머무름(−) ↔ 뻗어감(+)
   *
   * 여덟 축이 모두 첫 극으로 읽는 갈래다. 축마다 「머무름↔나아감」(Identity),
   * 「좁고 깊게↔넓고 가볍게」(Communication), 「담백함↔풍성함」(Taste),
   * 「쌓는 쪽↔뻗는 쪽」(Career)로 나타난다 — 움직임과 넓이가 한 갈래에 함께 있다.
   * 둘을 가르는 것은 이름이 아니라 차원을 늘리는 일이므로 여기서는 하지 않는다.
   */
  reach: number;
  /**
   * 흐름(−) ↔ 윤곽(+)
   *
   * 「느낌으로↔따져서」(Mindset), 「흐르는 대로↔짜인 대로」(Lifestyle),
   * 「손으로↔설계로」(Career) — 미리 세워두는가, 맡기는가.
   */
  form: number;
  /**
   * 오래된 것(−) ↔ 지금의 것(+)
   *
   * **여덟 축이 모두 쓰지만 읽는 것은 Taste·Style 둘뿐이다.** 나머지 여섯 축은
   * 각인으로 값을 남기기만 하고 자기 막대로 되받지 않는다. 그래서 네 글자의
   * R/N 자리가 가장 늦게 또렷해진다 — 이건 이름의 문제가 아니라 배선의 문제이고,
   * 푸는 데는 projection 재배치와 각인 재배분이 함께 필요하다.
   */
  modern: number;
  /** 안으로(−) ↔ 밖으로(+) — 여섯 축이 셋째 극으로 읽는다 */
  outward: number;
}

export const CANON_KEYS: Array<keyof Canon> = [
  'reach',
  'form',
  'modern',
  'outward',
];

export const ZERO: Canon = { reach: 0, form: 0, modern: 0, outward: 0 };

/** 결을 짧게 적는다 — 데이터 파일이 숫자 벽이 되지 않도록 */
export const canon = (
  reach: number,
  form: number,
  modern: number,
  outward: number,
): Canon => ({ reach, form, modern, outward });

export function addCanon(a: Canon, b: Canon): Canon {
  return {
    reach: a.reach + b.reach,
    form: a.form + b.form,
    modern: a.modern + b.modern,
    outward: a.outward + b.outward,
  };
}

export function scaleCanon(a: Canon, k: number): Canon {
  return {
    reach: a.reach * k,
    form: a.form * k,
    modern: a.modern * k,
    outward: a.outward * k,
  };
}

export function sumCanon(list: Canon[]): Canon {
  return list.reduce(addCanon, ZERO);
}

/**
 * 축 하나의 세 극(pole)이 공통 결의 어느 갈래에서 기울기를 받아오는지.
 *
 * `sign: -1`로 뒤집어 받을 수 있게 열어두었지만 **여덟 축 모두 아직 +1만 쓴다.**
 * 게다가 여섯 축이 `reach·form·outward`를, 두 축이 `reach·form·modern`을 같은
 * 순서로 읽는다 — 축마다 다른 세 극이라고 적혀 있어도 실제로는 **같은 3차원의
 * 재명명**인 셈이다. 네 갈래가 서로 상관되어 열여섯 자리 중 대각선 모서리에
 * 무게가 몰리는 것(§code의 '알려진 한계')이 여기서 온다.
 */
export interface PoleProjection {
  from: keyof Canon;
  /** +1이면 같은 방향, −1이면 뒤집어 받는다 */
  sign: 1 | -1;
}

/**
 * 누적된 결을 축 하나의 세 극으로 투영한 기울기.
 *
 * 크기는 **걸어온 축이 많을수록 커진다**(acc가 두꺼워지므로) — 여덟 번째 축은
 * 일곱 축의 결을 이미 알고 묻는다. 다만 한 걸음(delta 최대 1)을 넘지 않게 묶어둔다:
 * 그 축에서 고르는 다섯 걸음의 합(최대 5)이 언제든 이 기울기를 뒤집을 수 있어야
 * 판정이 아니라 출발점이다.
 *
 * @param weight 기울기의 상한 — 한 걸음의 크기보다 작게
 * @param soften 몇 축쯤 쌓였을 때 상한에 닿을지 (2.5 ≈ 서너 축)
 */
export function project(
  acc: Canon,
  projection: [PoleProjection, PoleProjection, PoleProjection],
  weight = 0.9,
  soften = 2.5,
): [number, number, number] {
  const clamp = (n: number) => Math.min(1, Math.max(-1, n));
  return projection.map(
    (p) => clamp((acc[p.from] * p.sign) / soften) * weight,
  ) as [number, number, number];
}
