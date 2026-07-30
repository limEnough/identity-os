import { describe, expect, it } from 'vitest';
import {
  buildPractices,
  buildStatement,
  currentIdentityStep,
  DIRECTION,
  ENVY,
  identityInsights,
  IDENTITY_STEPS,
  replayIdentity,
  RITUAL,
  SKIP,
} from '../index';

describe('Identity Why 체인 리플레이', () => {
  it('일곱 단계를 모두 지나면 완주된다', () => {
    const outcome = replayIdentity([0, 1, 0, 0, 0, 0, 0]);
    expect(outcome.done).toBe(true);
    expect(outcome.valid).toBe(true);
    expect(outcome.state.value).toBe('평온');
    expect(outcome.state.moment).not.toBeNull();
    expect(outcome.state.practice).not.toBeNull();
  });

  it('같은 시퀀스는 언제나 같은 문장을 만든다 (결정론)', () => {
    const a = replayIdentity([2, 0, 1, 2, 1, 1, 1]);
    const b = replayIdentity([2, 0, 1, 2, 1, 1, 1]);
    expect(buildStatement(a.state, '모던 시크')).toEqual(buildStatement(b.state, '모던 시크'));
  });

  it('순간·이유·근원은 넘어갈 수 있고, 문장에서 근원 줄이 빠진다', () => {
    const outcome = replayIdentity([1, 2, SKIP, SKIP, SKIP, 0, 2]);
    expect(outcome.done).toBe(true);
    expect(outcome.state.momentSkipped).toBe(true);
    expect(outcome.state.whySkipped).toBe(true);
    expect(outcome.state.originSkipped).toBe(true);
    const statement = buildStatement(outcome.state);
    expect(statement.join('')).not.toContain('닿아 있다');
  });

  it('근원을 고르면 그 줄이 문장에 들어온다', () => {
    const outcome = replayIdentity([1, 2, 0, 0, 3, 0, 0]);
    const phrase = outcome.state.origin?.phrase ?? '';
    expect(buildStatement(outcome.state).join('')).toContain(`${phrase}에 닿아 있다`);
  });

  it('명명 단계는 제안 하나와 대안 둘, 그리고 유보를 고를 수 있다', () => {
    const [first, second] = ENVY[0].aspects[0].alts;
    expect(replayIdentity([0, 0, 0, 0, 0, 1, 0]).state.value).toBe(first);
    expect(replayIdentity([0, 0, 0, 0, 0, 2, 0]).state.value).toBe(second);

    // 유보는 이름을 비우지 않는다 — 코치의 제안을 임시로 들고 간다
    const tentative = replayIdentity([0, 0, 0, 0, 0, 3, 0]);
    expect(tentative.state.value).toBe(ENVY[0].aspects[0].value);
    expect(tentative.state.tentative).toBe(true);
  });

  it('잘못된 선택지는 invalid로 표시된다', () => {
    const outcome = replayIdentity([0, 7]);
    expect(outcome.valid).toBe(false);
    expect(outcome.applied).toBe(1);
  });

  it('모든 가치 후보는 실천 방향(DIRECTION)과 행동(RITUAL)을 가진다', () => {
    for (const envy of ENVY) {
      for (const aspect of envy.aspects) {
        for (const name of [aspect.value, ...aspect.alts]) {
          expect(DIRECTION[name], `${name}의 방향 없음`).toBeTruthy();
          expect(RITUAL[name], `${name}의 행동 없음`).toBeTruthy();
        }
        // 대안은 제안과, 그리고 서로 달라야 고르는 의미가 있다
        expect(new Set([aspect.value, ...aspect.alts]).size).toBe(3);
        expect(aspect.label, `${aspect.title}의 라벨 없음`).toBeTruthy();
      }
      expect(envy.moments.length).toBeGreaterThan(0);
    }
  });

  it('고른 순간은 실천 선택지 하나를 더 열어준다', () => {
    const withMoment = replayIdentity([0, 0, 0, 0, 0, 0]);
    const skipped = replayIdentity([0, 0, SKIP, 0, 0, 0]);
    const options = (state: typeof withMoment.state) =>
      currentIdentityStep(state)?.options ?? [];

    expect(options(withMoment.state)).toHaveLength(options(skipped.state).length + 1);
    expect(
      options(withMoment.state).some((o) =>
        o.title.includes(withMoment.state.moment?.phrase ?? ''),
      ),
    ).toBe(true);
  });

  it('실천 카드는 가치를 모르면 일반형 문장으로 물러난다', () => {
    const [fallback] = buildPractices('없는가치');
    expect(fallback.action).toContain('나의 문장대로');
  });

  it('단계 기술자는 진행 중엔 존재하고 완주 후엔 null이다', () => {
    for (let i = 0; i < IDENTITY_STEPS; i++) {
      const outcome = replayIdentity(Array(i).fill(0));
      expect(outcome.valid).toBe(true);
      expect(currentIdentityStep(outcome.state)).not.toBeNull();
    }
    const full = replayIdentity(Array(IDENTITY_STEPS).fill(0));
    expect(full.done).toBe(true);
    expect(currentIdentityStep(full.state)).toBeNull();
  });

  it('발견 조각은 진행에 따라 축적된다', () => {
    const mid = replayIdentity([0, 1, 0]);
    expect(identityInsights(mid.state)).toHaveLength(3);
    const full = replayIdentity([0, 1, 0, 1, 0, 0, 0]);
    expect(identityInsights(full.state)).toHaveLength(6);
  });
});
