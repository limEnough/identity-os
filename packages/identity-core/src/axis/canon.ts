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

/** 네 갈래의 결. 각 값은 −1 ~ +1이고, 이름은 양(+)의 방향을 가리킨다. */
export interface Canon {
  /** 고요함(−) ↔ 생동감(+) */
  vivid: number;
  /** 부드러움(−) ↔ 또렷함(+) */
  sharp: number;
  /** 오래된 것(−) ↔ 지금의 것(+) */
  modern: number;
  /** 안으로(−) ↔ 밖으로(+) */
  outward: number;
}

export const CANON_KEYS: Array<keyof Canon> = [
  'vivid',
  'sharp',
  'modern',
  'outward',
];

export const ZERO: Canon = { vivid: 0, sharp: 0, modern: 0, outward: 0 };

/** 결을 짧게 적는다 — 데이터 파일이 숫자 벽이 되지 않도록 */
export const canon = (
  vivid: number,
  sharp: number,
  modern: number,
  outward: number,
): Canon => ({ vivid, sharp, modern, outward });

export function addCanon(a: Canon, b: Canon): Canon {
  return {
    vivid: a.vivid + b.vivid,
    sharp: a.sharp + b.sharp,
    modern: a.modern + b.modern,
    outward: a.outward + b.outward,
  };
}

export function scaleCanon(a: Canon, k: number): Canon {
  return {
    vivid: a.vivid * k,
    sharp: a.sharp * k,
    modern: a.modern * k,
    outward: a.outward * k,
  };
}

export function sumCanon(list: Canon[]): Canon {
  return list.reduce(addCanon, ZERO);
}

/**
 * 축 하나의 세 극(pole)이 공통 결의 어느 갈래에서 기울기를 받아오는지.
 * 부호는 뒤집을 수 있다 — 어떤 축의 '또렷함'은 다른 축의 '느슨함'이기도 하므로.
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
