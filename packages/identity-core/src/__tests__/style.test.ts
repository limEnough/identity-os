import { describe, expect, it } from "vitest";
import {
  buildStatement,
  buildStyleNote,
  currentStyleStep,
  DISTANCE,
  LIGHT,
  MOODS,
  replayIdentity,
  replayStyle,
  resolveMood,
  SCENE,
  SKIP,
  styleAxes,
  styleInsights,
  STYLE_STEPS,
} from "../index";

describe("Style 무드 체인 리플레이", () => {
  it("6단계를 모두 지나면 완주된다", () => {
    const outcome = replayStyle([0, 1, 0, 0, 0, 0]);
    expect(outcome.done).toBe(true);
    expect(outcome.valid).toBe(true);
    expect(outcome.state.mood).not.toBeNull();
    expect(outcome.state.moodName).toBeTruthy();
    expect(outcome.state.expression).not.toBeNull();
  });

  it("같은 시퀀스는 언제나 같은 무드를 만든다 (결정론)", () => {
    const a = replayStyle([3, 0, 2, 2, 0, 1]);
    const b = replayStyle([3, 0, 2, 2, 0, 1]);
    expect(a.state.moodName).toBe(b.state.moodName);
    expect(styleAxes(a.state)).toEqual(styleAxes(b.state));
  });

  it("빛·거리는 넘어갈 수 있고, 넘어간 걸음은 좌표를 움직이지 않는다", () => {
    const skipped = replayStyle([0, 0, SKIP, SKIP, 0, 0]);
    expect(skipped.done).toBe(true);
    expect(skipped.state.lightSkipped).toBe(true);
    expect(skipped.state.distanceSkipped).toBe(true);
    expect(skipped.state.light).toBeNull();
    expect(skipped.state.distance).toBeNull();

    // 넘어간 두 걸음은 0을 더한다 — 좌표는 앞선 두 걸음이 세운 자리에 그대로 남는다
    expect(styleAxes(skipped.state)).toEqual(
      styleAxes(replayStyle([0, 0]).state),
    );

    // 그리고 답했다면 움직였을 자리다 (넘어가기가 무의미한 선택지가 아님)
    const answered = replayStyle([0, 0, 2, 1, 0, 0]);
    expect(styleAxes(answered.state)[1].pos).not.toBe(
      styleAxes(skipped.state)[1].pos,
    );
  });

  it("명명 1번(대안)을 고르면 alt 이름이 확정된다", () => {
    const outcome = replayStyle([0, 0, 0, 0, 1, 0]);
    const proposed = resolveMood(replayStyle([0, 0, 0, 0]).state);
    expect(outcome.state.moodName).toBe(proposed.alt);
    expect(outcome.state.mood).toBe(proposed);
  });

  it("명명 2번은 임시 확정으로 표시되되 이름은 제안대로 둔다", () => {
    const outcome = replayStyle([1, 1, 1, 1, 2, 0]);
    expect(outcome.state.tentative).toBe(true);
    expect(outcome.state.moodName).toBe(outcome.state.mood?.name);
  });

  it("잘못된 선택지는 invalid로 표시된다", () => {
    expect(replayStyle([4]).valid).toBe(false);
    const outcome = replayStyle([0, 7]);
    expect(outcome.valid).toBe(false);
    expect(outcome.applied).toBe(1);
  });

  it("단계 기술자는 진행 중엔 존재하고 완주 후엔 null이다", () => {
    for (let i = 0; i < STYLE_STEPS; i++) {
      const partial = replayStyle(Array(i).fill(0));
      expect(
        currentStyleStep(partial.state, "단단함"),
        `${i}걸음째`,
      ).not.toBeNull();
    }
    const full = replayStyle(Array(STYLE_STEPS).fill(0));
    expect(currentStyleStep(full.state, "단단함")).toBeNull();
  });

  it("발견 조각은 진행에 따라 축적된다", () => {
    expect(styleInsights(replayStyle([0, 1]).state)).toHaveLength(2);
    expect(styleInsights(replayStyle([0, 1, 0, 1]).state)).toHaveLength(4);
    expect(styleInsights(replayStyle([0, 1, 0, 1, 0]).state)).toHaveLength(5);
    // 넘어간 걸음은 조각을 남기지 않는다
    expect(styleInsights(replayStyle([0, 1, SKIP, SKIP]).state)).toHaveLength(
      2,
    );
  });
});

describe("무드 좌표", () => {
  const combos: number[][] = [];
  SCENE.forEach((scene, s) => {
    scene.textures.forEach((_, t) => {
      [...LIGHT.map((_, i) => i), SKIP].forEach((l) => {
        [...DISTANCE.map((_, i) => i), SKIP].forEach((d) =>
          combos.push([s, t, l, d]),
        );
      });
    });
  });

  it("도달 가능한 모든 조합이 유효한 무드로 수렴한다", () => {
    for (const combo of combos) {
      const outcome = replayStyle(combo);
      expect(outcome.valid, combo.join(".")).toBe(true);
      expect(MOODS).toContain(resolveMood(outcome.state));
    }
  });

  it("축은 언제나 0~1 안에 머문다", () => {
    for (const combo of combos) {
      for (const axis of styleAxes(replayStyle(combo).state)) {
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
      combos.map((c) => resolveMood(replayStyle(c).state).name),
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
        ).toBeGreaterThan(0);
      }
      expect(mood.anchor, mood.name).toBeTruthy();
      expect(mood.alt).not.toBe(mood.name);
    }
  });
});

describe("Identity → Style 다리", () => {
  it("무드가 정해지면 가치를 부르던 줄을 무드 줄이 대신한다", () => {
    const identity = replayIdentity([0, 1, 0, 0, 0, 0]);
    const style = replayStyle([0, 1, 0, 0, 0, 0]);
    const moodName = style.state.moodName ?? "";
    const value = identity.state.value ?? "";

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

  it("가이드북 한 줄은 명명 전에는 비어 있다", () => {
    expect(buildStyleNote(replayStyle([0, 1, 0, 0]).state)).toBe("");
    expect(buildStyleNote(replayStyle([0, 1, 0, 0, 0]).state)).toContain("「");
  });

  it("명명 단계의 코치 발화는 단정하지 않고 되묻는다", () => {
    const step = currentStyleStep(replayStyle([0, 1, 0, 0]).state, "단단함");
    expect(step?.kind).toBe("naming");
    expect(step?.coachLines?.join(" ")).toContain("맞나요?");
    expect(step?.coachLines?.join(" ")).toContain("단단함");
  });

  it("깊은 질문(빛·거리)에는 넘어가기가 열려 있다", () => {
    expect(currentStyleStep(replayStyle([0, 0]).state)?.skippable).toBe(true);
    expect(currentStyleStep(replayStyle([0, 0, 0]).state)?.skippable).toBe(
      true,
    );
    // 첫 두 걸음은 감각을 고르는 입구라 넘어갈 수 없다
    expect(currentStyleStep(replayStyle([]).state)?.skippable).toBe(false);
    expect(currentStyleStep(replayStyle([0]).state)?.skippable).toBe(false);
  });
});
