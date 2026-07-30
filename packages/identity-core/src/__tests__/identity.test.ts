import { describe, expect, it } from 'vitest';
import {
  buildStatement,
  currentIdentityStep,
  DIRECTION,
  ENVY,
  identityInsights,
  IDENTITY_STEPS,
  replayIdentity,
  SKIP,
} from '../index';

describe('Identity Why 체인 리플레이', () => {
  it('6단계를 모두 지나면 완주된다', () => {
    const outcome = replayIdentity([0, 1, 0, 0, 0, 0]);
    expect(outcome.done).toBe(true);
    expect(outcome.valid).toBe(true);
    expect(outcome.state.value).toBe('평온');
    expect(outcome.state.practice).not.toBeNull();
  });

  it('같은 시퀀스는 언제나 같은 문장을 만든다 (결정론)', () => {
    const a = replayIdentity([2, 0, 1, 2, 1, 1]);
    const b = replayIdentity([2, 0, 1, 2, 1, 1]);
    expect(buildStatement(a.state, '모던 시크')).toEqual(buildStatement(b.state, '모던 시크'));
  });

  it('이유·근원은 넘어갈 수 있고, 문장에서 근원 줄이 빠진다', () => {
    const outcome = replayIdentity([1, 2, SKIP, SKIP, 0, 2]);
    expect(outcome.done).toBe(true);
    expect(outcome.state.whySkipped).toBe(true);
    expect(outcome.state.originSkipped).toBe(true);
    const statement = buildStatement(outcome.state);
    expect(statement.join('')).not.toContain('닿아 있다');
  });

  it('명명 1번(대안)을 고르면 alt 가치가 확정된다', () => {
    const outcome = replayIdentity([0, 0, 0, 0, 1, 0]);
    expect(outcome.state.value).toBe(ENVY[0].aspects[0].alt);
  });

  it('잘못된 선택지는 invalid로 표시된다', () => {
    const outcome = replayIdentity([0, 7]);
    expect(outcome.valid).toBe(false);
    expect(outcome.applied).toBe(1);
  });

  it('모든 가치 후보는 실천 방향(DIRECTION)을 가진다', () => {
    for (const envy of ENVY) {
      for (const aspect of envy.aspects) {
        expect(DIRECTION[aspect.value], `${aspect.value}의 방향 없음`).toBeTruthy();
        expect(DIRECTION[aspect.alt], `${aspect.alt}의 방향 없음`).toBeTruthy();
      }
    }
  });

  it('단계 기술자는 진행 중엔 존재하고 완주 후엔 null이다', () => {
    let outcome = replayIdentity([]);
    for (let i = 0; i < IDENTITY_STEPS; i++) {
      const step = currentIdentityStep(outcome.state);
      expect(step).not.toBeNull();
      outcome = replayIdentity([...Array(i + 1).fill(0)].map((_, j) => (j === 0 ? 0 : 0)));
    }
    const full = replayIdentity([0, 0, 0, 0, 0, 0]);
    expect(currentIdentityStep(full.state)).toBeNull();
  });

  it('발견 조각은 진행에 따라 축적된다', () => {
    const mid = replayIdentity([0, 1, 0]);
    expect(identityInsights(mid.state)).toHaveLength(3);
    const full = replayIdentity([0, 1, 0, 1, 0, 0]);
    expect(identityInsights(full.state)).toHaveLength(5);
  });
});
