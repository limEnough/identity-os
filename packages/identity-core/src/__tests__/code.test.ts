import { describe, expect, it } from 'vitest';
import {
  AXES,
  axisResult,
  buildCode,
  buildProfile,
  CENTER,
  CODE_AXES,
  CODE_KEYS,
  CODE_NAMES,
  codeCoords,
  codeName,
  codeSigns,
  emptyProfile,
  FAINT,
  flipCode,
  isCodeKey,
  probeAt,
  replayAxis,
  SKIP,
} from '../index';
import type { AxisDef, AxisResult, Profile } from '../index';

/**
 * 그 축에서 실제로 고를 수 있는 값만 고른다 — 넘어가기 포함.
 * 선택지는 엔진에게 묻는다: 마지막 깊은 물음은 앞 축들이 서로 당기고 있으면
 * 통째로 갈리므로(§engine `tensionProbe`) 축 데이터만 읽으면 없는 값을 고르게 된다.
 */
function pick(
  def: AxisDef,
  rnd: (n: number) => number,
  profile: Profile,
): number[] {
  const o = rnd(def.openings.length);
  const opening = def.openings[o];
  const probes = [0, 1, 2].map((i) => {
    const probe = probeAt(def, i, profile);
    const n =
      probe.options === 'scoped'
        ? (opening.scoped ?? []).length
        : probe.options.length;
    const roll = rnd(n + 1);
    return roll === n ? SKIP : roll;
  });
  return [o, rnd(opening.children.length), ...probes, 0];
}

/** 씨앗이 정해진 난수 — 분포 관문이 판마다 흔들리지 않도록 */
function seeded(seed: number) {
  let state = seed;
  return (n: number) => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return Math.floor((state / 2147483648) * n);
  };
}

/** 앞에서부터 n개의 축을 걸은 프로필 */
function walk(n: number, rnd = seeded(11)): Profile {
  const results: AxisResult[] = [];
  for (const def of AXES.slice(0, n)) {
    const profile = buildProfile(results);
    const replay = replayAxis(def, pick(def, rnd, profile), profile);
    const result = axisResult(def, replay);
    if (result) results.push(result);
  }
  return buildProfile(results);
}

describe('나의 네 글자', () => {
  it('아무것도 걷지 않았으면 네 자리가 모두 비어 있다', () => {
    const code = buildCode(emptyProfile());
    expect(code.mark).toBe(FAINT.repeat(4));
    expect(code.settledCount).toBe(0);
    expect(code.sealed).toBe(false);
    expect(code.walked).toBe(0);
  });

  it('걸을수록 또렷해진다 — 한 축으로는 반 자리, 여덟 축이면 세 자리쯤', () => {
    // 판 하나만 보면 계단이 매 축마다 오르지는 않는다(갈래가 뒤집히기도 하므로).
    // 또렷해짐은 경향이므로 여러 판의 평균으로 잰다.
    const rnd = seeded(3);
    const mean = (n: number) =>
      Array.from({ length: 60 }, () => buildCode(walk(n, rnd)).settledCount).reduce(
        (a, b) => a + b,
        0,
      ) / 60;

    const one = mean(1);
    const eight = mean(8);
    expect(one).toBeLessThan(1); // 한 축으로는 대개 아직 비어 있다
    expect(eight).toBeGreaterThan(2.5); // 여덟 축이면 대부분 자리를 잡는다
    expect(eight).toBeGreaterThan(one + 1.5);
    // 중간도 사이에 있다 — 한 번에 채워지는 게 아니라 채워져 가는 것이므로
    expect(mean(4)).toBeGreaterThan(one);
    expect(mean(4)).toBeLessThan(eight);
  });

  it('봉인 전에는 흐릿한 자리가 표식으로 남고, 봉인되면 네 자리가 모두 글자다', () => {
    const half = buildCode(walk(3));
    expect(half.sealed).toBe(false);
    expect(half.mark.split('').filter((c) => c === FAINT).length).toBe(
      4 - half.settledCount,
    );

    const full = buildCode(walk(8));
    expect(full.sealed).toBe(true);
    expect(full.mark).toBe(full.key);
    expect(full.mark).not.toContain(FAINT);
  });

  it('봉인돼도 아슬아슬했던 갈래는 아슬아슬했다고 남는다 — 판정하지 않기 위해', () => {
    // 여러 판을 걸어보면, 끝까지 반반이었던 갈래가 있는 판이 반드시 나온다
    const rnd = seeded(29);
    const wobbles = Array.from({ length: 40 }, () =>
      buildCode(walk(8, rnd)).wobbly.length,
    );
    expect(Math.max(...wobbles)).toBeGreaterThan(0);
  });

  it('열쇠는 언제나 네 글자이고, 흐릿한 자리도 지금 기운 쪽으로 채운다', () => {
    for (const n of [0, 1, 4, 8]) {
      const code = buildCode(walk(n));
      expect(isCodeKey(code.key), `${n}축`).toBe(true);
      expect(CODE_NAMES[code.key], `${n}축`).toBeTruthy();
      expect(code.name).toBe(codeName(code.key).name);
    }
  });

  it('축 막대는 0~1 안에 머문다', () => {
    for (const n of [0, 2, 5, 8]) {
      for (const coord of codeCoords(buildCode(walk(n)))) {
        expect(coord.pos).toBeGreaterThanOrEqual(0);
        expect(coord.pos).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('열여섯 자리', () => {
  it('열쇠도 이름도 열여섯이고, 겹치는 것이 없다', () => {
    expect(CODE_KEYS).toHaveLength(16);
    expect(new Set(CODE_KEYS).size).toBe(16);
    expect(Object.keys(CODE_NAMES).sort()).toEqual([...CODE_KEYS].sort());
    const names = CODE_KEYS.map((k) => CODE_NAMES[k].name);
    expect(new Set(names).size).toBe(16);
    // 이름은 혼자 놓이지 않는다 — 뜻을 풀어 쓴 한 줄이 언제나 함께 온다
    for (const key of CODE_KEYS) {
      expect(CODE_NAMES[key].summary, key).toBeTruthy();
      expect(CODE_NAMES[key].summary, key).not.toBe(CODE_NAMES[key].name);
    }
  });

  it('네 갈래의 글자는 서로 겹치지 않는다 — 순서를 몰라도 읽히도록', () => {
    const letters = CODE_AXES.flatMap((a) => [a.minus.letter, a.plus.letter]);
    expect(new Set(letters).size).toBe(8);
  });

  it('한 갈래를 뒤집으면 옆칸이 되고, 두 번 뒤집으면 제자리로 돌아온다', () => {
    for (const key of CODE_KEYS) {
      CODE_AXES.forEach((_, i) => {
        const flipped = flipCode(key, i);
        expect(flipped).not.toBe(key);
        expect(isCodeKey(flipped)).toBe(true);
        expect(flipCode(flipped, i)).toBe(key);
      });
    }
  });

  it('열쇠가 아닌 것은 열쇠로 읽지 않는다', () => {
    for (const bad of ['', 'QSR', 'QSRIX', 'ABCD', 'qsri', null, undefined]) {
      expect(isCodeKey(bad), String(bad)).toBe(false);
    }
    expect(codeSigns('QSRI')).toEqual([-1, -1, -1, -1]);
    expect(codeSigns('VKNO')).toEqual([1, 1, 1, 1]);
  });
});

describe('한가운데와 분포', () => {
  /**
   * 네 글자는 **한가운데(CENTER)를 어디에 두느냐가 전부**다. 각인이 한쪽으로 치우쳐
   * 있어서, 기준이 어긋나면 열여섯 중 하나가 절반을 먹는다.
   *
   * CENTER는 표를 평균한 값이 아니라 걸어서 닿는 값들의 측정값이므로, 축 데이터를
   * 손보면 조용히 어긋난다. 이 테스트가 그 관문이다 — 여기가 깨지면 CENTER를 다시 잰다.
   */
  const RUNS = 1200;
  const rnd = seeded(7);
  const hits = new Map<string, number>();
  for (let t = 0; t < RUNS; t++) {
    const key = buildCode(walk(AXES.length, rnd)).key;
    hits.set(key, (hits.get(key) ?? 0) + 1);
  }

  it('갈래마다 양쪽이 고르게 갈린다 — 한 극으로 쏠리지 않게', () => {
    CODE_AXES.forEach((axis, i) => {
      let plus = 0;
      for (const [key, n] of hits) if (key[i] === axis.plus.letter) plus += n;
      const rate = plus / RUNS;
      expect(rate, `${axis.title} → ${axis.plus.letter}`).toBeGreaterThan(0.38);
      expect(rate, `${axis.title} → ${axis.plus.letter}`).toBeLessThan(0.62);
    });
  });

  it('열여섯 자리에 모두 닿을 수 있다 — 이름만 있고 아무도 못 가는 칸은 없다', () => {
    for (const key of CODE_KEYS) {
      expect(hits.get(key) ?? 0, `${key} 「${codeName(key).name}」`).toBeGreaterThan(0);
    }
  });

  it('한 자리가 판을 독차지하지 않는다', () => {
    const [top, n] = [...hits].reduce((a, b) => (b[1] > a[1] ? b : a));
    expect(n / RUNS, `${top}이 너무 많다`).toBeLessThan(0.3);
  });

  it('한가운데는 0이 아니다 — 그게 이 계산의 요점이다', () => {
    for (const key of ['vivid', 'sharp', 'modern', 'outward'] as const) {
      expect(CENTER[key], key).toBeGreaterThan(0);
    }
  });
});
