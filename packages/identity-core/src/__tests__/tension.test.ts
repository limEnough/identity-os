import { describe, expect, it } from 'vitest';
import {
  AXES,
  axisInsights,
  axisResult,
  buildProfile,
  buildTensions,
  currentAxisStep,
  emptyProfile,
  freshTension,
  identityAxis,
  PULLED,
  PULL_AXES,
  PULL_KEYS,
  probeAt,
  replayAxis,
  strongestTension,
  styleAxis,
  tasteAxis,
  TENSION,
  TENSION_SLOT,
  tensionProbe,
} from '../index';
import type { AxisDef, AxisResult, Profile, Pull } from '../index';

/** 당김만 다른 가짜 결과 — 탐지의 셈법을 그것 하나만 놓고 본다 */
function result(id: string, name: string, pull: Pull, tentative = false): AxisResult {
  return {
    id: id as AxisResult['id'],
    axisName: id,
    resultLabel: '결',
    name,
    tag: '',
    summary: '',
    clause: '',
    short: '',
    imprint: { vivid: 0, sharp: 0, modern: 0, outward: 0 },
    pull,
    tentative,
    done: true,
  };
}

const profileOf = (...results: AxisResult[]): Profile => buildProfile(results);

/** 축 하나를 완주시키는 발자국 */
const full = (a = 0, b = 0, c = 0, d = 0, e = 0) => [a, b, c, d, e, 0];

/** 앞선 축들을 차례로 완주시켜 만든 프로필 */
function profileUpTo(index: number, seq = full(1, 1, 1, 1, 1)): Profile {
  const results: AxisResult[] = [];
  for (const def of AXES.slice(0, index)) {
    const profile = buildProfile(results);
    const found = axisResult(def, replayAxis(def, seq, profile));
    if (found) results.push(found);
  }
  return buildProfile(results);
}

describe('당김 — 무엇을 얻으려 무엇을 내주는가', () => {
  it('네 갈래는 모두 트레이드오프다 — 양 끝과 값이 함께 적혀 있다', () => {
    expect(PULL_AXES).toHaveLength(4);
    expect(PULL_AXES.map((a) => a.key).sort()).toEqual([...PULL_KEYS].sort());
    for (const axis of PULL_AXES) {
      expect(axis.title, axis.key).toContain('↔');
      expect(axis.minus.reads.endsWith('쪽'), axis.key).toBe(true);
      expect(axis.plus.reads.endsWith('쪽'), axis.key).toBe(true);
      // 관찰은 양쪽 모두의 값을 적는다 — 어느 쪽으로 가라고 말하지 않기 위해
      expect(axis.note.length, axis.key).toBeGreaterThan(10);
      expect(axis.minus.pole).not.toBe(axis.plus.pole);
    }
  });

  it('결과가 적는 당김은 또렷한 하나둘뿐이다', () => {
    for (const def of AXES) {
      for (const outcome of def.outcomes) {
        const pull = outcome.pull ?? {};
        const at = `${def.id}/${outcome.name}`;
        // 넷을 다 채우면 모든 축이 모든 갈래에서 조금씩 당겨 긴장이 아무 뜻도 없어진다
        expect(Object.keys(pull).length, at).toBeLessThanOrEqual(3);
        for (const [key, value] of Object.entries(pull)) {
          expect(PULL_KEYS, `${at}/${key}`).toContain(key);
          expect(Math.abs(value), `${at}/${key}`).toBeGreaterThanOrEqual(PULLED);
          expect(Math.abs(value), `${at}/${key}`).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('표현의 두 축은 당김을 갖지 않는다 — 취향은 트레이드오프가 아니므로', () => {
    // Taste·Style이 재는 것은 어떤 인상인가이지 무엇을 내주는가가 아니다.
    // 여기에 억지로 당김을 매기면 없는 모순이 만들어진다.
    for (const def of [tasteAxis, styleAxis]) {
      for (const outcome of def.outcomes) {
        expect(outcome.pull ?? {}, `${def.id}/${outcome.name}`).toEqual({});
      }
    }
  });

  it('모든 가치는 당김을 갖는다 — 첫 축의 마음이 가장 오래 남으므로', () => {
    for (const opening of identityAxis.openings) {
      for (const child of opening.children) {
        for (const name of child.names ?? []) {
          const pull = identityAxis.namedOutcomes?.[name]?.pull;
          expect(pull, `${name}의 당김 없음`).toBeTruthy();
          expect(Object.keys(pull ?? {}).length, name).toBeGreaterThan(0);
        }
      }
    }
  });

  it('걸어서 확정한 결과는 당김을 그대로 들고 나온다', () => {
    AXES.forEach((def, i) => {
      const profile = profileUpTo(i);
      const found = axisResult(def, replayAxis(def, full(), profile));
      expect(found?.pull, def.id).toBeDefined();
    });
  });
});

describe('긴장 — 서로 반대쪽으로 당기는 두 자리', () => {
  it('한쪽만 당기면 긴장이 아니다 — 마주 서는 것이 있어야 한다', () => {
    const alone = profileOf(result('identity', '자유', { open: 0.9 }));
    expect(buildTensions(alone)).toHaveLength(0);

    const sameWay = profileOf(
      result('identity', '자유', { open: 0.9 }),
      result('lifestyle', '즉흥의 하루', { open: 0.9 }),
    );
    expect(buildTensions(sameWay)).toHaveLength(0);
  });

  it('반대쪽 끝을 각각 잡고 있으면 긴장이 열린다', () => {
    const torn = profileOf(
      result('identity', '자유', { open: 0.8 }),
      result('lifestyle', '단정한 루틴', { open: -0.9 }),
    );
    const [tension, ...rest] = buildTensions(torn);
    expect(rest).toHaveLength(0);
    expect(tension.axis.key).toBe('open');
    expect(tension.gap).toBeCloseTo(1.7);
    expect(tension.minus.name).toBe('단정한 루틴');
    expect(tension.plus.name).toBe('자유');
  });

  it('살짝 기운 것만으로는 열리지 않는다 — 흔하면 뜻이 없어지므로', () => {
    const faint = profileOf(
      result('identity', '자유', { open: PULLED - 0.01 }),
      result('lifestyle', '단정한 루틴', { open: -0.9 }),
    );
    expect(buildTensions(faint)).toHaveLength(0);

    const narrow = profileOf(
      result('identity', '자유', { open: PULLED }),
      result('lifestyle', '단정한 루틴', { open: -(TENSION - PULLED) + 0.01 }),
    );
    expect(buildTensions(narrow)).toHaveLength(0);
  });

  it('한 갈래에서는 가장 멀리 벌어진 한 쌍만 꺼낸다 — 목록은 아무도 읽지 않는다', () => {
    const many = profileOf(
      result('identity', '자유', { open: 0.8 }),
      result('mindset', '해보고 판단하는 사람', { open: 0.5 }),
      result('lifestyle', '단정한 루틴', { open: -0.9 }),
      result('career', '세우는 설계', { open: -0.6 }),
    );
    const tensions = buildTensions(many);
    expect(tensions).toHaveLength(1);
    expect(tensions[0].plus.name).toBe('자유');
    expect(tensions[0].minus.name).toBe('단정한 루틴');
  });

  it('여러 갈래에서 벌어졌으면 크게 벌어진 순서로 놓인다', () => {
    const tensions = buildTensions(
      profileOf(
        result('identity', '경청', { mine: -0.8, open: -0.5 }),
        result('career', '뻗어가는 자리', { mine: 0.6, open: 0.8 }),
      ),
    );
    expect(tensions.map((t) => t.axis.key)).toEqual(['mine', 'open']);
    expect(tensions[0].gap).toBeGreaterThan(tensions[1].gap);
  });

  it('임시 확정은 절반만 당긴다 — 각인과 같은 셈법', () => {
    const sure = profileOf(
      result('identity', '자유', { open: 0.8 }),
      result('lifestyle', '단정한 루틴', { open: -0.9 }),
    );
    const unsure = profileOf(
      result('identity', '자유', { open: 0.8 }, true),
      result('lifestyle', '단정한 루틴', { open: -0.9 }),
    );
    expect(buildTensions(sure)[0].gap).toBeCloseTo(1.7);
    expect(buildTensions(unsure)[0].gap).toBeCloseTo(1.3);
  });

  it('관찰은 두 자리를 나란히 놓기만 한다 — 판정하지 않는다', () => {
    const [tension] = buildTensions(
      profileOf(
        result('identity', '자유', { open: 0.8 }),
        result('lifestyle', '단정한 루틴', { open: -0.9 }),
      ),
    );
    // 두 축이 어디서 왔는지와 각각 무엇을 내주는지가 한 줄에 다 있다
    expect(tension.line).toContain('identity');
    expect(tension.line).toContain('lifestyle');
    expect(tension.line).toContain('자유');
    expect(tension.line).toContain('단정한 루틴');
    // 고치라고 말하는 낱말은 나오지 않는다
    for (const word of ['해야', '하세요', '노력', '고쳐', '문제']) {
      expect(tension.line + tension.axis.note, word).not.toContain(word);
    }
  });

  it('첫 축에는 긴장이 없다 — 마주 설 것이 아직 없으므로', () => {
    expect(buildTensions(emptyProfile())).toHaveLength(0);
    expect(strongestTension(emptyProfile())).toBeNull();
    expect(freshTension(emptyProfile())).toBeNull();
    expect(tensionProbe(identityAxis, emptyProfile())).toBeNull();
  });
});

describe('방금 벌어진 긴장 — 같은 둘을 다시 묻지 않기 위해', () => {
  const 자유 = result('identity', '자유', { open: 0.8 });
  const 루틴 = result('lifestyle', '단정한 루틴', { open: -0.9 });
  const 넓은마당 = result('communication', '넓은 마당', { wide: 0.9 });

  it('바로 앞 축이 연 긴장만 꺼낸다', () => {
    const opened = profileOf(자유, 루틴);
    expect(freshTension(opened)?.axis.key).toBe('open');
  });

  it('이미 열려 있던 긴장은 다시 꺼내지 않는다 — 남은 여정을 점령하지 않도록', () => {
    // 「자유」와 「단정한 루틴」의 다툼은 3번 축에서 이미 물었다. 4번에서 또 물으면
    // 앞 축이 뒤 축을 바꾸는 게 아니라 앞 축 하나가 남은 여정을 차지하는 꼴이 된다.
    const later = profileOf(자유, 루틴, result('taste', '바랜 여백', {}));
    expect(strongestTension(later)?.axis.key).toBe('open');
    expect(freshTension(later)).toBeNull();
  });

  it('다른 갈래가 새로 벌어지면 그때 다시 묻는다', () => {
    const 깊이 = result('career', '깊어지는 장인', { wide: -0.9 });
    const next = profileOf(자유, 루틴, 넓은마당, 깊이);
    expect(freshTension(next)?.axis.key).toBe('wide');
  });

  it('갈래는 넷뿐이므로 한 여정에서 많아야 네 번 갈린다', () => {
    // 축을 하나씩 늘려가며 물음이 갈린 횟수를 센다
    const results = [자유, 루틴, 넓은마당, result('career', '깊어지는 장인', { wide: -0.9 })];
    const asked = results
      .map((_, i) => freshTension(profileOf(...results.slice(0, i + 1))))
      .filter(Boolean);
    expect(asked.length).toBeLessThanOrEqual(PULL_AXES.length);
    expect(new Set(asked.map((t) => t!.axis.key)).size).toBe(asked.length);
  });
});

describe('긴장이 물음을 바꾼다', () => {
  /** 실제로 걸어서 물음이 갈리는 자리를 찾는다 */
  function torn(): { def: AxisDef; profile: Profile } {
    for (let i = 2; i < AXES.length; i++) {
      for (const seq of [
        full(0, 0, 0, 0, 0),
        full(1, 1, 1, 1, 1),
        full(2, 0, 1, 2, 0),
        full(5, 0, 0, 0, 0),
        full(3, 2, 1, 0, 2),
      ]) {
        const profile = profileUpTo(i, seq);
        if (freshTension(profile)) return { def: AXES[i], profile };
      }
    }
    throw new Error('걸어서 닿는 긴장이 하나도 없다');
  }

  it('걸어서 닿을 수 있다 — 억지로 만든 프로필에서만 열리는 게 아니다', () => {
    expect(() => torn()).not.toThrow();
  });

  it('긴장이 있으면 마지막 깊은 물음이 통째로 갈린다', () => {
    const { def, profile } = torn();
    const asked = probeAt(def, TENSION_SLOT, profile);
    const own = def.probes[TENSION_SLOT];
    expect(asked).not.toBe(own);
    expect(asked.title).not.toBe(own.title);
    // 앞의 두 물음은 그대로다 — 축이 자기 결을 가르는 자리이므로
    expect(probeAt(def, 0, profile)).toBe(def.probes[0]);
    expect(probeAt(def, 1, profile)).toBe(def.probes[1]);
  });

  it('갈린 물음은 두 결과의 이름을 그대로 불러온다', () => {
    const { def, profile } = torn();
    const tension = freshTension(profile)!;
    const asked = probeAt(def, TENSION_SLOT, profile)!;
    expect(asked.title).toContain(tension.minus.name);
    expect(asked.title).toContain(tension.plus.name);
    expect(asked.sub).toContain(tension.axis.note);
  });

  it('갈린 물음의 선택지는 넷이고, 양쪽은 좌표를 다른 데로 민다', () => {
    const { def, profile } = torn();
    const asked = probeAt(def, TENSION_SLOT, profile)!;
    const options = asked.options as Array<{ shift: number[] }>;
    expect(options).toHaveLength(4);
    expect(options[0].shift).not.toEqual(options[1].shift);
    // 저울질과 그때그때는 좌표를 움직이지 않는다 — 넘어감과 같은 뜻이 아니라, 답이 중앙이다
    expect(options[2].shift).toEqual([0, 0, 0]);
    expect(options[3].shift).toEqual([0, 0, 0]);
    // 한 걸음보다 크게 밀지 않는다 — 물음이 갈렸다고 판정이 되지는 않는다
    for (const option of options) {
      for (const delta of option.shift) expect(Math.abs(delta)).toBeLessThanOrEqual(0.7);
    }
  });

  it('화면도 갈린 물음을 그대로 받는다', () => {
    const { def, profile } = torn();
    const state = replayAxis(def, [0, 0, 0, 0], profile).state;
    const step = currentAxisStep(def, state, profile)!;
    expect(step.kind).toBe('choice');
    expect(step.title).toBe(probeAt(def, TENSION_SLOT, profile).title);
    expect(step.options).toHaveLength(4);
    expect(step.skippable).toBe(true);
  });

  it('갈린 물음에 답하면 발견 조각이 「당김」으로 적힌다', () => {
    const { def, profile } = torn();
    const walked = replayAxis(def, [0, 0, 0, 0, 0], profile).state;
    expect(axisInsights(def, walked, profile).some((c) => c.startsWith('당김 —'))).toBe(
      true,
    );
  });

  it('긴장이 없으면 축 데이터의 물음이 그대로 나온다', () => {
    for (const def of AXES) {
      const clean = emptyProfile();
      expect(probeAt(def, TENSION_SLOT, clean), def.id).toBe(
        def.probes[TENSION_SLOT],
      );
    }
  });

  it('같은 발자국과 같은 프로필은 언제나 같은 물음에 닿는다 (결정론)', () => {
    const { def, profile } = torn();
    const a = replayAxis(def, full(0, 0, 0, 0, 0), profile);
    const b = replayAxis(def, full(0, 0, 0, 0, 0), profile);
    expect(a.state.probes[TENSION_SLOT]).toEqual(b.state.probes[TENSION_SLOT]);
    expect(probeAt(def, TENSION_SLOT, profile).title).toBe(
      probeAt(def, TENSION_SLOT, profile).title,
    );
  });
});
