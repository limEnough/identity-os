import { describe, expect, it } from 'vitest';
import {
  AXES,
  axisHref,
  buildProfile,
  axisResult,
  canWalk,
  footprintsFromQuery,
  guideHref,
  journeyQuery,
  journeyStep,
  replayAxis,
  resumeHref,
  SKIP,
  walkJourney,
} from '../index';
import type { AxisId, Footprints } from '../index';

const full = [0, 0, 0, 0, 0, 0];

/** 앞에서부터 n개의 축을 완주시킨 발자국들 */
function walked(n: number): Footprints {
  const footprints: Footprints = {};
  for (const def of AXES.slice(0, n)) footprints[def.id] = [...full];
  return footprints;
}

describe('여정의 순서', () => {
  it('아무것도 걷지 않으면 첫 축만 열려 있다', () => {
    const journey = walkJourney({});
    expect(journey.current?.id).toBe('identity');
    expect(journey.steps.map((s) => s.status)).toEqual([
      'current',
      'locked',
      'locked',
      'locked',
      'locked',
      'locked',
      'locked',
      'locked',
    ]);
  });

  it('축 하나를 완주하면 바로 다음 축만 열린다 — 건너뛰기는 없다', () => {
    for (let n = 1; n < AXES.length; n++) {
      const journey = walkJourney(walked(n));
      expect(journey.current?.id, `${n}개 완주`).toBe(AXES[n].id);
      expect(journey.steps.slice(0, n).every((s) => s.status === 'done')).toBe(true);
      expect(journey.steps[n].status).toBe('current');
      expect(journey.steps.slice(n + 1).every((s) => s.status === 'locked')).toBe(true);
    }
  });

  it('여덟 축을 다 걸으면 걸을 축이 남지 않는다', () => {
    const journey = walkJourney(walked(8));
    expect(journey.current).toBeNull();
    expect(journey.steps.every((s) => s.status === 'done')).toBe(true);
    expect(journey.profile.results).toHaveLength(8);
    expect(journey.walked).toBe(8 * full.length);
  });

  it('순서를 어긴 발자국은 읽지 않는다', () => {
    // Identity를 걷지 않은 채 Style 발자국만 들고 와도 Style은 열리지 않는다
    const journey = walkJourney({ style: [...full] });
    expect(journey.current?.id).toBe('identity');
    expect(journeyStep(journey, 'style').status).toBe('locked');
    expect(journeyStep(journey, 'style').seq).toEqual([]);
    expect(journey.profile.results).toHaveLength(0);
  });

  it('걷다 만 축이 있으면 그 뒤는 모두 잠긴다', () => {
    const journey = walkJourney({ ...walked(2), communication: [0, 0, SKIP] });
    expect(journey.current?.id).toBe('communication');
    expect(journeyStep(journey, 'communication').seq).toHaveLength(3);
    expect(journeyStep(journey, 'lifestyle').status).toBe('locked');
  });

  it('어긋난 발자국은 어긋나기 직전까지만 살린다', () => {
    const journey = walkJourney({ identity: [0, 0, 99, 1] });
    expect(journeyStep(journey, 'identity').seq).toEqual([0, 0]);
    expect(journey.current?.id).toBe('identity');
  });
});

describe('다시 걸을 수 있는 축', () => {
  it('가장 마지막에 확정한 축 하나만 다시 걸을 수 있다', () => {
    const journey = walkJourney(walked(3));
    const editable = journey.steps.filter((s) => s.editable).map((s) => s.def.id);
    expect(editable).toEqual([AXES[2].id]);
  });

  it('그 앞의 축들은 다시 걸을 수 없다 — 뒤 축이 그 위에 얹혀 있으므로', () => {
    const journey = walkJourney(walked(4));
    for (const id of ['identity', 'mindset', 'communication'] as AxisId[]) {
      expect(canWalk(journey, id), id).toBe(false);
    }
    expect(canWalk(journey, 'lifestyle')).toBe(true); // 마지막 확정
    expect(canWalk(journey, 'taste')).toBe(true); // 지금 걸을 축
    expect(canWalk(journey, 'style')).toBe(false); // 아직 잠김
  });

  it('여덟 축을 다 걸었으면 마지막 축만 다시 걸을 수 있다', () => {
    const journey = walkJourney(walked(8));
    expect(journey.steps.filter((s) => s.editable).map((s) => s.def.id)).toEqual(['career']);
    expect(canWalk(journey, 'career')).toBe(true);
    expect(canWalk(journey, 'health')).toBe(false);
  });
});

describe('앞 축의 결과가 뒤 축의 출발점이 된다', () => {
  it('같은 발자국이라도 앞 축이 다르면 다른 결과에 닿을 수 있다', () => {
    // 뿌리의 기울기는 한 걸음의 절반 아래다. 그래서 같은 발자국이 늘 다른 이름에
    // 닿는 건 아니지만(그러면 판정이다), 경계에 선 발자국은 뿌리에 따라 갈린다.
    const seqs = [
      [0, 2, 2, 2, 2, 0],
      [1, 1, 3, 3, 2, 0],
      [3, 2, 1, 2, 3, 0],
      [4, 0, 4, 4, 4, 0],
      [5, 1, 2, 1, 1, 0],
    ];
    const split = seqs.filter((mindset) => {
      const names = new Set(
        identityWalks().map(
          (identity) =>
            journeyStep(walkJourney({ identity, mindset }), 'mindset').replay.state.name,
        ),
      );
      return names.size > 1;
    });
    expect(split.length).toBeGreaterThan(0);

    function identityWalks(): number[][] {
      return [
        [0, 0, 0, 0, 0, 0], // 「단단함」 — 윤곽을 세우는 쪽
        [1, 0, 0, 0, 0, 0], // 「다정함」 — 모서리를 둥글리는 쪽
        [5, 3, 0, 0, 0, 0], // 「호기심」 — 움직이는 쪽
        [3, 1, 0, 0, 0, 0], // 「회복력」 — 오래 쌓이는 쪽
      ];
    }
  });

  it('프로필은 걸어온 축의 결과만 담는다', () => {
    const journey = walkJourney(walked(5));
    expect(journey.profile.results.map((r) => r.id)).toEqual([
      'identity',
      'mindset',
      'communication',
      'lifestyle',
      'taste',
    ]);
    // 각 축은 자기 앞의 것만 본다
    expect(journeyStep(journey, 'taste').profile.results).toHaveLength(4);
    expect(journeyStep(journey, 'identity').profile.results).toHaveLength(0);
  });

  it('임시 확정(유보)은 절반만 각인된다', () => {
    const decided = replayAxis(AXES[0], [0, 0, 0, 0, 0, 0]);
    const tentative = replayAxis(AXES[0], [0, 0, 0, 0, 0, 3]);
    const a = buildProfile([axisResult(AXES[0], decided)!]);
    const b = buildProfile([axisResult(AXES[0], tentative)!]);
    expect(b.results[0].tentative).toBe(true);
    expect(Math.abs(b.acc.vivid)).toBeLessThanOrEqual(Math.abs(a.acc.vivid));
  });
});

describe('주소', () => {
  it('걸어온 발자국을 모두 실어 보낸다', () => {
    const query = journeyQuery(walked(3));
    expect(query).toBe('i=0.0.0.0.0.0&m=0.0.0.0.0.0&c=0.0.0.0.0.0');
    expect(axisHref(AXES[3], walked(3))).toBe(`/lifestyle?${query}`);
    expect(guideHref(walked(3))).toBe(`/guide?${query}`);
  });

  it('주소에서 읽은 발자국은 원래대로 복원된다', () => {
    const footprints = { ...walked(2), communication: [1, 2] };
    const query = new URLSearchParams(journeyQuery(footprints));
    expect(footprintsFromQuery((p) => query.get(p))).toEqual(footprints);
  });

  it('이어 걸을 자리는 걷다 만 축, 없으면 가이드북', () => {
    expect(resumeHref({ identity: [0, 0] })).toBe('/identity?i=0.0');
    expect(resumeHref(walked(2))).toBe(`/guide?${journeyQuery(walked(2))}`);
    expect(resumeHref({})).toBe('/guide');
  });
});
