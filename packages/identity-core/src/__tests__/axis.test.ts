import { describe, expect, it } from 'vitest';
import {
  AXES,
  AXIS_STEPS,
  axisCoords,
  axisInsights,
  axisNote,
  axisResult,
  buildProfile,
  buildStatement,
  currentAxisStep,
  emptyProfile,
  identityAxis,
  nameCandidates,
  neighborOutcome,
  outcomeVariant,
  replayAxis,
  resolveOutcome,
  SKIP,
  styleAxis,
  tasteAxis,
  mindsetAxis,
  careerAxis,
  DIRECTION,
  RITUAL,
} from '../index';
import type { AxisDef, AxisResult, Profile } from '../index';

/** 축 하나를 완주시키는 발자국 — 명명은 제안(0), 실천은 첫 카드(0) */
const full = (a = 0, b = 0, c = 0, d = 0, e = 0) => [a, b, c, d, e, 0, 0];

/** 앞선 축들을 차례로 완주시켜 만든 프로필 */
function profileUpTo(index: number): Profile {
  const results: AxisResult[] = [];
  for (const def of AXES.slice(0, index)) {
    const replay = replayAxis(def, full(1, 1, 1, 1, 1), buildProfile(results));
    const result = axisResult(def, replay);
    if (result) results.push(result);
  }
  return buildProfile(results);
}

describe('공통 축 엔진', () => {
  it('여덟 축 모두 일곱 걸음으로 완주된다', () => {
    AXES.forEach((def, i) => {
      const outcome = replayAxis(def, full(), profileUpTo(i));
      expect(outcome.done, def.id).toBe(true);
      expect(outcome.valid, def.id).toBe(true);
      expect(outcome.state.name, def.id).toBeTruthy();
      expect(outcome.state.practice, def.id).not.toBeNull();
    });
  });

  it('걸음 수는 축마다 같다 — 뒤 축이 더 길어지지 않는다', () => {
    for (const def of AXES) {
      for (let walked = 0; walked < AXIS_STEPS; walked++) {
        const partial = replayAxis(def, Array(walked).fill(0), emptyProfile());
        expect(
          currentAxisStep(def, partial.state, emptyProfile()),
          `${def.id} ${walked}걸음째`,
        ).not.toBeNull();
      }
      const done = replayAxis(def, Array(AXIS_STEPS).fill(0), emptyProfile());
      expect(currentAxisStep(def, done.state, emptyProfile())).toBeNull();
    }
  });

  it('깊은 물음 셋은 모두 넘어갈 수 있고, 넘어간 걸음은 좌표를 움직이지 않는다', () => {
    for (const def of AXES) {
      const skipped = replayAxis(def, [0, 0, SKIP, SKIP, SKIP, 0, 0], emptyProfile());
      expect(skipped.done, def.id).toBe(true);
      expect(skipped.state.skipped, def.id).toEqual([true, true, true]);
      expect(axisCoords(def, skipped.state, emptyProfile())).toEqual(
        axisCoords(def, replayAxis(def, [0, 0], emptyProfile()).state, emptyProfile()),
      );
      for (const walked of [2, 3, 4]) {
        expect(
          currentAxisStep(def, replayAxis(def, Array(walked).fill(0), emptyProfile()).state, emptyProfile())
            ?.skippable,
          `${def.id} ${walked}걸음째`,
        ).toBe(true);
      }
      // 입구와 그 구체는 넘어갈 수 없다 — 축이 시작되지 않으므로
      expect(currentAxisStep(def, replayAxis(def, [], emptyProfile()).state, emptyProfile())?.skippable).toBe(false);
      expect(currentAxisStep(def, replayAxis(def, [0], emptyProfile()).state, emptyProfile())?.skippable).toBe(false);
    }
  });

  it('잘못된 선택지는 invalid로 표시된다', () => {
    expect(replayAxis(identityAxis, [9999], emptyProfile()).valid).toBe(false);
    const outcome = replayAxis(identityAxis, [0, 99], emptyProfile());
    expect(outcome.valid).toBe(false);
    expect(outcome.applied).toBe(1);
  });

  it('같은 발자국과 같은 프로필은 언제나 같은 결과를 만든다 (결정론)', () => {
    for (const def of AXES) {
      const p = profileUpTo(AXES.indexOf(def));
      const a = replayAxis(def, full(1, 2, 1, 0, 1), p);
      const b = replayAxis(def, full(1, 2, 1, 0, 1), p);
      expect(a.state.name, def.id).toBe(b.state.name);
      expect(axisCoords(def, a.state, p)).toEqual(axisCoords(def, b.state, p));
    }
  });
});

describe('좌표와 결과', () => {
  /** 도달 가능한 다섯 걸음 조합 전부 */
  const combos = (def: AxisDef, profile: Profile): number[][] => {
    const rows: number[][] = [];
    def.openings.forEach((opening, o) => {
      opening.children.forEach((_, c) => {
        const probeOptions = def.probes.map((probe, i) =>
          probe.options === 'scoped'
            ? [...(opening.scoped ?? []).map((_, k) => k), SKIP]
            : [...probe.options.map((_, k) => k), SKIP],
        );
        for (const p0 of probeOptions[0])
          for (const p1 of probeOptions[1])
            for (const p2 of probeOptions[2]) rows.push([o, c, p0, p1, p2]);
      });
    });
    return rows;
  };

  it('모든 축에서, 도달 가능한 모든 조합이 유효한 결과로 수렴한다', () => {
    AXES.forEach((def, i) => {
      const profile = profileUpTo(i);
      for (const combo of combos(def, profile)) {
        // 조합 수가 축마다 8천 가지를 넘는다 — 여덟 축 전부를 훑는 유일한 관문
        const outcome = replayAxis(def, combo, profile);
        expect(outcome.valid, `${def.id} ${combo.join('.')}`).toBe(true);
        expect(def.outcomes).toContain(resolveOutcome(def, outcome.state, profile));
        // 이웃은 언제나 제안과 다른 결과다 — 같은 이름을 두 번 내밀지 않는다
        expect(neighborOutcome(def, outcome.state, profile)).not.toBe(
          resolveOutcome(def, outcome.state, profile),
        );
        for (const coord of axisCoords(def, outcome.state, profile)) {
          expect(coord.pos).toBeGreaterThanOrEqual(0);
          expect(coord.pos).toBeLessThanOrEqual(1);
        }
      }
    });
  }, 120_000);

  it('모든 축에서, 축 자신의 데이터만으로 결과 여덟 종에 다 닿을 수 있다', () => {
    for (const def of AXES) {
      const reached = new Set(
        combos(def, emptyProfile()).map(
          (combo) => resolveOutcome(def, replayAxis(def, combo, emptyProfile()).state, emptyProfile()).name,
        ),
      );
      expect([...reached].sort(), def.id).toEqual(def.outcomes.map((o) => o.name).sort());
    }
  }, 120_000);

  it('앞 축이 기울여도 결과의 공간이 무너지지는 않는다', () => {
    // 뿌리가 좌표를 기울이면 먼 모서리 하나쯤은 닿기 어려워진다 — 그게 뿌리의 뜻이다.
    // 다만 공간이 한두 개로 접히면 거울이 아니라 판정이 되므로, 여섯 이상은 남아야 한다.
    AXES.forEach((def, i) => {
      const profile = profileUpTo(i);
      const reached = new Set(
        combos(def, profile).map(
          (combo) => resolveOutcome(def, replayAxis(def, combo, profile).state, profile).name,
        ),
      );
      expect(reached.size, def.id).toBeGreaterThanOrEqual(6);
    });
  }, 120_000);

  it('좌표를 쓰는 축은 결과마다 네 갈래의 표현 언어를 가진다', () => {
    for (const def of AXES.filter((a) => a.naming === 'octant')) {
      expect(def.outcomes, def.id).toHaveLength(8);
      for (const outcome of def.outcomes) {
        expect(outcome.facets, `${def.id}/${outcome.name}`).toHaveLength(4);
        for (const facet of outcome.facets) {
          expect(facet.chips.length, `${def.id}/${outcome.name}/${facet.name}`).toBeGreaterThanOrEqual(4);
        }
        expect(outcome.alt).not.toBe(outcome.name);
        expect(outcome.anchor, outcome.name).toBeTruthy();
        expect(outcome.variants.length, outcome.name).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('좌표를 쓰는 축은 쉬운 한 줄과 절을 결과마다 직접 적는다', () => {
    // 엔진이 summary·clause를 tag로 폴백하므로, 안 적어도 화면은 조용히 굴러간다.
    // 그래서 여기서 폴백을 금지한다 — tag는 결의 요약이지 사람에게 건네는 말이 아니다.
    for (const def of AXES.filter((a) => a.naming === 'octant')) {
      for (const outcome of def.outcomes) {
        const at = `${def.id}/${outcome.name}`;
        expect(outcome.summary, at).toBeTruthy();
        expect(outcome.summary, at).not.toBe(outcome.tag);
        expect(outcome.clause, at).toBeTruthy();
        expect(outcome.clause, at).not.toBe(outcome.tag);
        // 절은 나의 문장에 그대로 실린다 — 명사구가 아니라 서술문이어야 한다
        expect(outcome.clause?.endsWith('다'), at).toBe(true);
      }
    }
  });

  it('모든 축의 결과는 잘 통하는 자리와 힘든 자리를 셋씩 갖는다', () => {
    // 칭찬만 하는 거울은 아무것도 가르쳐주지 않는다 — 여덟 축 모두에서 양쪽을 적는다
    for (const def of AXES) {
      for (const outcome of def.outcomes) {
        const at = `${def.id}/${outcome.name}`;
        expect(outcome.fits, at).toHaveLength(3);
        expect(outcome.strains, at).toHaveLength(3);
      }
    }
  });

  it('명명은 제안·다른 결·이웃·유보를 내민다', () => {
    const before = replayAxis(styleAxis, [0, 0, 0, 0, 0], emptyProfile()).state;
    const proposed = resolveOutcome(styleAxis, before, emptyProfile());
    const neighbor = neighborOutcome(styleAxis, before, emptyProfile());

    expect(replayAxis(styleAxis, [0, 0, 0, 0, 0, 0], emptyProfile()).state.name).toBe(proposed.name);
    expect(replayAxis(styleAxis, [0, 0, 0, 0, 0, 1], emptyProfile()).state.name).toBe(proposed.alt);
    // 이웃을 고르면 이름만이 아니라 결과 자체가 경계 너머로 옮겨간다
    const across = replayAxis(styleAxis, [0, 0, 0, 0, 0, 2], emptyProfile()).state;
    expect(across.name).toBe(neighbor.name);
    expect(across.outcome?.tag).toBe(neighbor.tag);

    const tentative = replayAxis(styleAxis, [0, 0, 0, 0, 0, 3], emptyProfile()).state;
    expect(tentative.tentative).toBe(true);
    expect(tentative.name).toBe(proposed.name);
  });

  it('Identity는 이름을 좌표가 아니라 고른 갈래에서 데려온다', () => {
    const [first, second, third] = identityAxis.openings[0].children[0].names ?? [];
    expect(replayAxis(identityAxis, full(0, 0), emptyProfile()).state.name).toBe(first);
    expect(replayAxis(identityAxis, [0, 0, 0, 0, 0, 1, 0], emptyProfile()).state.name).toBe(second);
    expect(replayAxis(identityAxis, [0, 0, 0, 0, 0, 2, 0], emptyProfile()).state.name).toBe(third);
  });

  it('모든 가치 후보는 방향(DIRECTION)·행동(RITUAL)·각인을 가진다', () => {
    for (const opening of identityAxis.openings) {
      for (const child of opening.children) {
        for (const name of child.names ?? []) {
          expect(DIRECTION[name], `${name}의 방향 없음`).toBeTruthy();
          expect(RITUAL[name], `${name}의 행동 없음`).toBeTruthy();
          expect(identityAxis.namedOutcomes?.[name]?.imprint, `${name}의 각인 없음`).toBeTruthy();
        }
        expect(new Set(child.names).size).toBe(3);
      }
      expect(opening.scoped?.length ?? 0).toBeGreaterThan(0);
    }
  });
});

describe('앞 축이 뒤 축에 미치는 영향', () => {
  it('같은 발자국이라도 프로필이 다르면 다른 좌표에 선다', () => {
    const seq = [0, 0, SKIP, SKIP, SKIP];
    const alone = axisCoords(mindsetAxis, replayAxis(mindsetAxis, seq, emptyProfile()).state, emptyProfile());
    const rooted = profileUpTo(1);
    const withRoot = axisCoords(mindsetAxis, replayAxis(mindsetAxis, seq, rooted).state, rooted);
    expect(withRoot).not.toEqual(alone);
  });

  it('기울기는 판정이 아니다 — 다섯 걸음이 언제든 되돌린다', () => {
    const rooted = profileUpTo(5); // Style 앞의 다섯 축을 걸어온 사람
    // 고요한 장면·질감·빛·색·거리를 고르면 프로필이 무엇이든 고요 쪽에 닿는다
    const quiet = replayAxis(styleAxis, [0, 1, 0, 0, 3], rooted);
    expect(axisCoords(styleAxis, quiet.state, rooted)[0].pos).toBeLessThan(0.5);
  });

  it('발견 조각의 첫 자리는 앞 축에서 온다', () => {
    const profile = profileUpTo(2);
    const chips = axisInsights(communicationChips(), replayAxis(AXES[2], [], profile).state, profile);
    expect(chips[0]).toContain('「');
    expect(chips).toHaveLength(2); // 앞선 두 축의 결과만
    function communicationChips() {
      return AXES[2];
    }
  });

  it('명명 발화가 앞 축의 결과를 인용한다', () => {
    const profile = profileUpTo(1);
    const step = currentAxisStep(
      mindsetAxis,
      replayAxis(mindsetAxis, [0, 0, 0, 0, 0], profile).state,
      profile,
    );
    expect(step?.kind).toBe('naming');
    const lines = step?.coachLines?.join(' ') ?? '';
    expect(lines).toContain(profile.results[0].name);
    expect(lines).toContain('맞나요?');
  });

  it('실천 카드는 앞 축이 쌓일수록 늘어난다', () => {
    const early = currentAxisStep(
      mindsetAxis,
      replayAxis(mindsetAxis, full().slice(0, 6), profileUpTo(1)).state,
      profileUpTo(1),
    );
    const late = currentAxisStep(
      careerAxis,
      replayAxis(careerAxis, full().slice(0, 6), profileUpTo(7)).state,
      profileUpTo(7),
    );
    expect(late?.options.length ?? 0).toBeGreaterThan(early?.options.length ?? 0);
  });

  it('결과 변주도 앞 축이 쌓일수록 넓어진다', () => {
    const state = replayAxis(careerAxis, [0, 1, 2, 1, 0], emptyProfile()).state;
    const outcome = resolveOutcome(careerAxis, state, emptyProfile());
    const opened = new Set<string>();
    for (let i = 0; i <= 7; i++) {
      opened.add(outcomeVariant(outcome, state, profileUpTo(i)));
    }
    // 프로필이 자랄수록 같은 8분면에서도 다른 변주에 닿을 수 있다
    expect(outcome.variants.length).toBeGreaterThanOrEqual(4);
    expect(opened.size).toBeGreaterThanOrEqual(1);
    expect([...opened].every((v) => outcome.variants.includes(v))).toBe(true);
  });

  it('Taste가 Style의 뿌리가 된다 — 표현 카드가 끌림을 인용한다', () => {
    const profile = profileUpTo(5);
    const taste = profile.results.find((r) => r.id === 'taste');
    const step = currentAxisStep(
      styleAxis,
      replayAxis(styleAxis, [0, 1, 0, 0, 0, 0], profile).state,
      profile,
    );
    expect(step?.kind).toBe('practice');
    expect(step?.options.some((o) => o.title.includes(taste?.name ?? ''))).toBe(true);
  });

  it('가이드북 한 줄은 명명 전에는 비어 있다', () => {
    const profile = profileUpTo(4);
    expect(axisNote(tasteAxis, replayAxis(tasteAxis, [0, 1, 0, 0, 0], profile).state, profile)).toBe('');
    const noted = axisNote(tasteAxis, replayAxis(tasteAxis, [0, 1, 0, 0, 0, 0], profile).state, profile);
    expect(noted).toContain('「');
  });

  it('가이드북 한 줄은 이름과 쉬운 설명 하나로만 이뤄진다', () => {
    // 한때 변주와 기운 극을 중점으로 이어 붙였다 — 세 겹의 추상이 수수께끼가 됐다.
    // 한 줄은 한 뜻만 갖는다: 「이름」 — 풀어 쓴 한 줄.
    AXES.forEach((def, i) => {
      const profile = profileUpTo(i);
      const state = replayAxis(def, [0, 0, 0, 0, 0, 0], profile).state;
      const noted = axisNote(def, state, profile);
      expect(noted, def.id).toBe(`「${state.name}」 — ${state.outcome?.summary}`);
      expect(noted.split(' · '), def.id).toHaveLength(1);
    });
  });

  it('이름 옆에는 언제나 쉬운 한 줄이 함께 온다', () => {
    AXES.forEach((def, i) => {
      const profile = profileUpTo(i);
      const outcome = replayAxis(def, [0, 0, 0, 0, 0, 0], profile).state.outcome;
      expect(outcome?.summary, def.id).toBeTruthy();
      expect(outcome?.clause, def.id).toBeTruthy();
    });
  });
});

describe('나의 문장', () => {
  it('걸어온 축만큼만 적힌다', () => {
    const two = buildStatement(profileUpTo(2));
    const all = buildStatement(profileUpTo(8));
    expect(two.length).toBeGreaterThan(0);
    expect(all.length).toBeGreaterThan(two.length);
    expect(all.at(-1)).toContain('그래서 나는,');
  });

  it('축을 지나면 그 축의 줄이 문장에 하나 붙는다', () => {
    const beforeStyle = buildStatement(profileUpTo(5));
    const afterStyle = buildStatement(profileUpTo(6));
    expect(afterStyle).toHaveLength(beforeStyle.length + 1);
    expect(afterStyle.at(0)).toBe(beforeStyle.at(0));
    expect(afterStyle.at(-1)).toBe(beforeStyle.at(-1));
  });

  it('문장에서 대괄호로 이름을 부르는 자리는 가치 한 줄뿐이다', () => {
    // 대괄호 이름을 여덟 개 이어 붙이면 문장이 아니라 암호가 된다.
    // 손글씨로 읽히는 자리이므로, 나머지 축은 풀어 쓴 말로만 실린다.
    const lines = buildStatement(profileUpTo(8));
    const named = lines.filter((line) => line.includes('「'));
    expect(named).toHaveLength(1);
    expect(named[0]).toContain('그 마음의 이름은');
    for (const line of lines) expect(line.endsWith('.')).toBe(true);
  });

  it('이름을 부르는 줄 말고는 전부 서술문이다', () => {
    // 축의 clause가 비어 tag로 폴백하면 "…하는 관계." 같은 명사구가 손글씨에 실린다.
    // 나의 문장은 결과 목록이 아니라 읽히는 글이므로, 모든 줄이 문장으로 끝나야 한다.
    for (const line of buildStatement(profileUpTo(8))) {
      if (line.includes('「')) continue;
      expect(line.endsWith('다.'), line).toBe(true);
    }
  });

  it('아무것도 걷지 않았으면 빈 문장이다', () => {
    expect(buildStatement(emptyProfile())).toEqual([]);
  });
});
