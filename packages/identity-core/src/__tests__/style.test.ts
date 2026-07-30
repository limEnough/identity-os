import { describe, expect, it } from "vitest";
import {
  buildStatement,
  buildStyleNote,
  COLOR,
  currentStyleStep,
  DIRECTION,
  DISTANCE,
  LIGHT,
  MOODS,
  neighborMood,
  replayIdentity,
  replayStyle,
  resolveMood,
  SCENE,
  SKIP,
  styleAxes,
  styleInsights,
  STYLE_STEPS,
  VALUE_LEAN,
} from "../index";

/** 이 축은 언제나 뿌리 위에서 걷는다 — 테스트도 가치를 들고 다닌다 */
const VALUE = "단단함";

describe("Style 무드 체인 리플레이", () => {
  it("일곱 단계를 모두 지나면 완주된다", () => {
    const outcome = replayStyle([0, 1, 0, 0, 0, 0, 0], VALUE);
    expect(outcome.done).toBe(true);
    expect(outcome.valid).toBe(true);
    expect(outcome.state.mood).not.toBeNull();
    expect(outcome.state.moodName).toBeTruthy();
    expect(outcome.state.color).not.toBeNull();
    expect(outcome.state.expression).not.toBeNull();
  });

  it("같은 시퀀스는 같은 가치 위에서 같은 무드를 만든다 (결정론)", () => {
    const a = replayStyle([3, 0, 2, 3, 2, 0, 1], VALUE);
    const b = replayStyle([3, 0, 2, 3, 2, 0, 1], VALUE);
    expect(a.state.moodName).toBe(b.state.moodName);
    expect(styleAxes(a.state, VALUE)).toEqual(styleAxes(b.state, VALUE));
  });

  it("빛·색·거리는 넘어갈 수 있고, 넘어간 걸음은 좌표를 움직이지 않는다", () => {
    const skipped = replayStyle([0, 0, SKIP, SKIP, SKIP, 0, 0], VALUE);
    expect(skipped.done).toBe(true);
    expect(skipped.state.lightSkipped).toBe(true);
    expect(skipped.state.colorSkipped).toBe(true);
    expect(skipped.state.distanceSkipped).toBe(true);
    expect(skipped.state.light).toBeNull();
    expect(skipped.state.color).toBeNull();
    expect(skipped.state.distance).toBeNull();

    // 넘어간 세 걸음은 0을 더한다 — 좌표는 앞선 걸음들이 세운 자리에 그대로 남는다
    expect(styleAxes(skipped.state, VALUE)).toEqual(
      styleAxes(replayStyle([0, 0], VALUE).state, VALUE),
    );

    // 그리고 답했다면 움직였을 자리다 (넘어가기가 무의미한 선택지가 아님)
    const answered = replayStyle([0, 0, 2, 4, 1, 0, 0], VALUE);
    expect(styleAxes(answered.state, VALUE)[1].pos).not.toBe(
      styleAxes(skipped.state, VALUE)[1].pos,
    );
  });

  it("명명은 제안·다른 결·이웃 무드·유보를 고를 수 있다", () => {
    const before = replayStyle([0, 0, 0, 0, 0], VALUE).state;
    const proposed = resolveMood(before, VALUE);
    const neighbor = neighborMood(before, VALUE);

    const asIs = replayStyle([0, 0, 0, 0, 0, 0], VALUE).state;
    expect(asIs.mood).toBe(proposed);
    expect(asIs.moodName).toBe(proposed.name);

    const other = replayStyle([0, 0, 0, 0, 0, 1], VALUE).state;
    expect(other.mood).toBe(proposed);
    expect(other.moodName).toBe(proposed.alt);

    // 이웃을 고르면 이름만이 아니라 무드 자체가 경계 너머로 옮겨간다
    const across = replayStyle([0, 0, 0, 0, 0, 2], VALUE).state;
    expect(across.mood).toBe(neighbor);
    expect(across.moodName).toBe(neighbor.name);
    expect(neighbor).not.toBe(proposed);

    const tentative = replayStyle([0, 0, 0, 0, 0, 3], VALUE).state;
    expect(tentative.tentative).toBe(true);
    expect(tentative.moodName).toBe(proposed.name);
  });

  it("잘못된 선택지는 invalid로 표시된다", () => {
    expect(replayStyle([6], VALUE).valid).toBe(false);
    const outcome = replayStyle([0, 7], VALUE);
    expect(outcome.valid).toBe(false);
    expect(outcome.applied).toBe(1);
  });

  it("단계 기술자는 진행 중엔 존재하고 완주 후엔 null이다", () => {
    for (let i = 0; i < STYLE_STEPS; i++) {
      const partial = replayStyle(Array(i).fill(0), VALUE);
      expect(currentStyleStep(partial.state, VALUE), `${i}걸음째`).not.toBeNull();
    }
    const full = replayStyle(Array(STYLE_STEPS).fill(0), VALUE);
    expect(currentStyleStep(full.state, VALUE)).toBeNull();
  });

  it("발견 조각은 뿌리에서 시작해 진행에 따라 쌓인다", () => {
    // 첫 조각은 이 축의 것이 아니라 Identity에서 온 가치다
    expect(styleInsights(replayStyle([], VALUE).state, VALUE)).toEqual([
      `뿌리 — 「${VALUE}」`,
    ]);
    expect(styleInsights(replayStyle([0, 1], VALUE).state, VALUE)).toHaveLength(
      3,
    );
    expect(
      styleInsights(replayStyle([0, 1, 0, 1, 1], VALUE).state, VALUE),
    ).toHaveLength(6);
    // 넘어간 걸음은 조각을 남기지 않는다
    expect(
      styleInsights(replayStyle([0, 1, SKIP, SKIP, SKIP], VALUE).state, VALUE),
    ).toHaveLength(3);
  });
});

describe("무드 좌표", () => {
  const combos: number[][] = [];
  SCENE.forEach((scene, s) => {
    scene.textures.forEach((_, t) => {
      [...LIGHT.map((_, i) => i), SKIP].forEach((l) => {
        [...COLOR.map((_, i) => i), SKIP].forEach((c) => {
          [...DISTANCE.map((_, i) => i), SKIP].forEach((d) =>
            combos.push([s, t, l, c, d]),
          );
        });
      });
    });
  });

  it("도달 가능한 모든 조합이 유효한 무드로 수렴한다", () => {
    for (const combo of combos) {
      const outcome = replayStyle(combo, VALUE);
      expect(outcome.valid, combo.join(".")).toBe(true);
      expect(MOODS).toContain(resolveMood(outcome.state, VALUE));
      // 이웃은 언제나 제안과 다른 무드다 — 같은 이름을 두 번 내밀지 않는다
      expect(neighborMood(outcome.state, VALUE)).not.toBe(
        resolveMood(outcome.state, VALUE),
      );
    }
  });

  it("축은 언제나 0~1 안에 머문다", () => {
    for (const combo of combos) {
      for (const axis of styleAxes(replayStyle(combo, VALUE).state, VALUE)) {
        expect(
          axis.pos,
          `${combo.join(".")} · ${axis.left}`,
        ).toBeGreaterThanOrEqual(0);
        expect(axis.pos).toBeLessThanOrEqual(1);
      }
    }
  });

  it("무드 8종 모두 도달할 수 있다 — 아무도 닿지 못하는 무드는 없다", () => {
    const reached = new Set(
      combos.map((c) => resolveMood(replayStyle(c, VALUE).state, VALUE).name),
    );
    expect([...reached].sort()).toEqual(MOODS.map((m) => m.name).sort());
  });

  it("모든 무드는 네 갈래의 표현 언어를 가진다", () => {
    for (const mood of MOODS) {
      expect(mood.categories, mood.name).toHaveLength(4);
      for (const category of mood.categories) {
        expect(
          category.chips.length,
          `${mood.name}/${category.name}`,
        ).toBeGreaterThanOrEqual(4);
      }
      expect(mood.anchor, mood.name).toBeTruthy();
      expect(mood.alt).not.toBe(mood.name);
    }
  });
});

describe("Identity → Style 다리", () => {
  it("모든 가치 후보는 무드 좌표의 기울기를 가진다", () => {
    for (const value of Object.keys(DIRECTION)) {
      expect(VALUE_LEAN[value], `${value}의 기울기 없음`).toBeTruthy();
    }
  });

  it("같은 발자국이라도 뿌리가 다르면 다른 좌표에 선다", () => {
    const seq = [0, 0, SKIP, SKIP, SKIP];
    const quiet = replayStyle(seq, "평온");
    const bold = replayStyle(seq, "모험");
    expect(styleAxes(quiet.state, "평온")[0].pos).toBeLessThan(
      styleAxes(bold.state, "모험")[0].pos,
    );
  });

  it("기울기는 판정이 아니다 — 감각의 선택이 언제든 되돌린다", () => {
    // 「모험」(생동 쪽)으로 출발해도, 고요한 장면·질감·빛·색·거리를 고르면 고요에 닿는다
    const outcome = replayStyle([0, 1, 0, 0, 3], "모험");
    expect(styleAxes(outcome.state, "모험")[0].pos).toBeLessThan(0.5);
  });

  it("무드가 정해지면 가치를 부르던 줄을 무드 줄이 대신한다", () => {
    const identity = replayIdentity([0, 1, 0, 0, 0, 0, 0]);
    const value = identity.state.value ?? "";
    const style = replayStyle([0, 1, 0, 0, 0, 0, 0], value);
    const moodName = style.state.moodName ?? "";

    const withMood = buildStatement(identity.state, moodName);
    const without = buildStatement(identity.state);

    // 문장은 길어지지 않는다 — 무드는 덧붙는 게 아니라 자리를 이어받는다
    expect(withMood).toHaveLength(without.length);
    expect(withMood.join("")).toContain(moodName);
    expect(withMood.join("")).not.toContain("그 동경의 이름은");
    expect(without.join("")).toContain(`그 동경의 이름은 「${value}」`);

    // 첫 줄(동경)과 끝 줄(그래서 나는)은 무드와 무관하게 그대로다
    expect(withMood[0]).toBe(without[0]);
    expect(withMood.at(-1)).toBe(without.at(-1));
  });

  it("표현 카드의 마지막 장은 뿌리로 되돌아간다", () => {
    const step = currentStyleStep(
      replayStyle([0, 1, 0, 0, 0, 0], VALUE).state,
      VALUE,
    );
    expect(step?.kind).toBe("expression");
    expect(step?.options.at(-1)?.title).toContain(VALUE);
    // 가치가 없으면 그 장은 아예 나오지 않는다
    const rootless = currentStyleStep(replayStyle([0, 1, 0, 0, 0, 0]).state);
    expect(rootless?.options).toHaveLength(
      (step?.options.length ?? 0) - 1,
    );
  });

  it("가이드북 한 줄은 명명 전에는 비어 있다", () => {
    expect(buildStyleNote(replayStyle([0, 1, 0, 0, 0], VALUE).state, VALUE)).toBe(
      "",
    );
    expect(
      buildStyleNote(replayStyle([0, 1, 0, 0, 0, 0], VALUE).state, VALUE),
    ).toContain("「");
  });

  it("명명 단계의 코치 발화는 단정하지 않고 되묻는다", () => {
    const step = currentStyleStep(
      replayStyle([0, 1, 0, 0, 0], VALUE).state,
      VALUE,
    );
    expect(step?.kind).toBe("naming");
    const lines = step?.coachLines?.join(" ") ?? "";
    expect(lines).toContain("맞나요?");
    expect(lines).toContain(VALUE);
    expect(lines).toContain("쪽으로 기울어");
  });

  it("깊은 질문(빛·색·거리)에는 넘어가기가 열려 있다", () => {
    for (const walked of [2, 3, 4]) {
      expect(
        currentStyleStep(replayStyle(Array(walked).fill(0), VALUE).state, VALUE)
          ?.skippable,
        `${walked}걸음째`,
      ).toBe(true);
    }
    // 첫 두 걸음은 감각을 고르는 입구라 넘어갈 수 없다
    expect(currentStyleStep(replayStyle([], VALUE).state, VALUE)?.skippable).toBe(
      false,
    );
    expect(
      currentStyleStep(replayStyle([0], VALUE).state, VALUE)?.skippable,
    ).toBe(false);
  });
});
