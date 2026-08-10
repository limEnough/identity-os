import { describe, expect, it } from 'vitest';
import {
  AXES,
  appendEntry,
  axisResult,
  buildClosing,
  buildCode,
  buildProfile,
  closingCanon,
  codeShifts,
  daysToSeason,
  emptyProfile,
  livingShift,
  overlayCodes,
  PASSAGES,
  replayAxis,
  sealRun,
  seasonReady,
  SEASON_DAYS,
  shiftNote,
  TRACKS,
} from '../index';
import type { AxisResult, Profile } from '../index';

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 0, 15, 3, 0, 0);

/** 앞에서부터 n개의 축을 정해진 선택으로 걸은 프로필 */
function walk(n: number, seq: number[] = [0, 0, 0, 0, 0]): Profile {
  const results: AxisResult[] = [];
  for (const def of AXES.slice(0, n)) {
    const result = axisResult(
      def,
      replayAxis(def, [...seq, 0], buildProfile(results)),
    );
    if (result) results.push(result);
  }
  return buildProfile(results);
}

describe('맺음', () => {
  it('여덟 축을 다 걸어야 열린다 — 중간에 미리 나눠 주지 않는다', () => {
    for (let n = 0; n < AXES.length; n++) {
      expect(buildClosing(walk(n)), `${n}축`).toBeNull();
    }
    expect(buildClosing(walk(AXES.length))).not.toBeNull();
    expect(closingCanon(emptyProfile())).toEqual({
      vivid: 0,
      sharp: 0,
      modern: 0,
      outward: 0,
    });
  });

  it('맺음은 셋뿐이다 — 문장 하나, 구절 하나, 노래 하나', () => {
    const closing = buildClosing(walk(AXES.length))!;
    expect(Object.keys(closing).sort()).toEqual(['line', 'passage', 'track']);
    expect(PASSAGES).toContain(closing.passage);
    expect(TRACKS).toContain(closing.track);
  });

  it('한 문장은 정말 한 문장이다 — 여덟 축이 한 줄로 접힌다', () => {
    const profile = walk(AXES.length);
    const closing = buildClosing(profile)!;
    // 마침표는 끝에 하나뿐이고, 줄바꿈도 없다
    expect(closing.line.endsWith('.')).toBe(true);
    expect(closing.line.split('.').filter(Boolean)).toHaveLength(1);
    expect(closing.line).not.toContain('\n');
    // 시작한 자리(동경)와 닿은 자리(네 글자)가 한 문장 안에 함께 있다
    expect(closing.line).toContain(buildCode(profile).name);
    expect(closing.line).toContain('동경하는');
  });

  it('결이 다르면 다른 맺음에 닿는다', () => {
    // 다른 갈래를 고른 두 사람이 같은 구절·같은 문장을 받으면 고르는 일이 무의미하다
    const lines = new Set<string>();
    const picked = new Set<string>();
    for (const seq of [
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
      [2, 0, 2, 2, 2],
      [3, 1, 3, 3, 3],
      [4, 0, 4, 4, 4],
      [5, 1, 1, 0, 2],
    ]) {
      const closing = buildClosing(walk(AXES.length, seq));
      if (closing) {
        lines.add(closing.line);
        picked.add(closing.passage.id);
      }
    }
    expect(picked.size).toBeGreaterThan(1);
    expect(lines.size).toBeGreaterThan(1);
  });

  it('같은 발자국은 언제나 같은 맺음에 닿는다 — 기억해둘 것이 없도록', () => {
    const a = buildClosing(walk(AXES.length))!;
    const b = buildClosing(walk(AXES.length))!;
    expect(a).toEqual(b);
  });

  it('구절과 노래의 id는 겹치지 않는다 — 고르는 단위이므로', () => {
    expect(new Set(PASSAGES.map((p) => p.id)).size).toBe(PASSAGES.length);
    expect(new Set(TRACKS.map((t) => t.id)).size).toBe(TRACKS.length);
    // 구절에는 언제나 출처가 붙는다 — 선물의 형태가 「한 구절, 그리고 그것이 온 곳」이므로
    for (const p of PASSAGES) {
      expect(p.source, p.id).toBeTruthy();
      expect(p.author, p.id).toBeTruthy();
    }
    // 노래는 가사를 싣지 않는다 — 왜 이 결에 놓였는지 우리가 적은 한 줄만
    for (const t of TRACKS) {
      expect(t.title, t.id).toBeTruthy();
      expect(t.artist, t.id).toBeTruthy();
      expect(t.note, t.id).toBeTruthy();
    }
  });
});

describe('결 연표', () => {
  it('여덟 축을 다 걸어야 한 판이 봉인된다', () => {
    for (let n = 0; n < AXES.length; n++) {
      expect(sealRun(walk(n), `q${n}`, T0), `${n}축`).toBeNull();
    }
    const entry = sealRun(walk(AXES.length), 'i=0.0', T0);
    expect(entry).not.toBeNull();
    expect(entry!.code).toBe(buildCode(walk(AXES.length)).key);
    expect(entry!.names).toHaveLength(AXES.length);
    expect(entry!.value).toBe(walk(AXES.length).results[0].name);
  });

  it('같은 발자국은 두 번 봉인되지 않는다', () => {
    const entry = sealRun(walk(AXES.length), 'i=0.0', T0)!;
    const once = appendEntry([], entry);
    expect(once).toHaveLength(1);
    expect(appendEntry(once, entry)).toBe(once);
    // 발자국이 다르면 새 판이다
    expect(appendEntry(once, { ...entry, query: 'i=1.0' })).toHaveLength(2);
  });

  it('다음 판은 계절 하나가 지나야 권한다', () => {
    const entries = [sealRun(walk(AXES.length), 'i=0.0', T0)!];
    expect(seasonReady([], T0)).toBe(false);
    expect(seasonReady(entries, T0 + 10 * DAY)).toBe(false);
    expect(daysToSeason(entries, T0 + 10 * DAY)).toBe(SEASON_DAYS - 10);
    expect(seasonReady(entries, T0 + SEASON_DAYS * DAY)).toBe(true);
    expect(daysToSeason(entries, T0 + SEASON_DAYS * DAY)).toBe(0);
  });

  it('두 판 사이에서 움직인 갈래를 짚는다 — 그대로인 것도 결과다', () => {
    expect(codeShifts('QSRI', 'QSRI')).toEqual([]);
    const moved = codeShifts('QSRI', 'QSNI');
    expect(moved).toHaveLength(1);
    expect(moved[0]).toEqual({
      title: '오래된 것 ↔ 지금의 것',
      from: '오래된 것',
      to: '지금의 것',
    });
    expect(codeShifts('QSRI', 'VKNO')).toHaveLength(4);
  });

  it('연표 한 줄에 붙는 말은 첫 판·그대로·움직임을 가른다', () => {
    const base = sealRun(walk(AXES.length), 'a', T0)!;
    const same = { ...base, query: 'b' };
    const moved = { ...base, code: 'QSNI', query: 'c' };
    const entries = [base, same, moved];
    expect(shiftNote(entries, 0).note).toContain('첫 판');
    expect(shiftNote(entries, 1).note).toContain('그대로');
    expect(shiftNote(entries, 2).shifts.length).toBeGreaterThan(0);
  });

  it('지금 걷는 판도 지난 판과 견줄 수 있다 — 봉인 전에도', () => {
    const code = buildCode(walk(AXES.length));
    expect(livingShift([], code)).toEqual([]);
    const past = { ...sealRun(walk(AXES.length), 'a', T0)!, code: 'QSRI' };
    expect(livingShift([past], code)).toEqual(codeShifts('QSRI', code.key));
  });
});

describe('겹쳐보기', () => {
  it('열쇠가 아니면 겹치지 않는다', () => {
    expect(overlayCodes('QSRI', null)).toBeNull();
    expect(overlayCodes(null, 'QSRI')).toBeNull();
    expect(overlayCodes('QSRI', 'ZZZZ')).toBeNull();
  });

  it('네 갈래가 모두 같으면 갈린 자리가 없고, 겹친 자리의 사각을 묻는다', () => {
    const overlay = overlayCodes('QSRI', 'QSRI')!;
    expect(overlay.shared).toHaveLength(4);
    expect(overlay.parted).toHaveLength(0);
    expect(overlay.headline).toBe('네 갈래가 모두 같아요');
    expect(overlay.question).toBe(overlay.shared[0].note);
  });

  it('갈린 갈래에는 서로에게 물어볼 말이 하나씩 놓인다', () => {
    const overlay = overlayCodes('QSRI', 'VKNO')!;
    expect(overlay.parted).toHaveLength(4);
    expect(overlay.shared).toHaveLength(0);
    for (const facet of overlay.parted) {
      expect(facet.question, facet.title).toBeTruthy();
      expect(facet.mine.pole).not.toBe(facet.yours.pole);
    }
    expect(overlay.question).toBe(overlay.parted[0].question);
  });

  it('겹치고 갈린 수를 그대로 적는다 — 등급은 매기지 않는다', () => {
    const overlay = overlayCodes('QSRI', 'QSNO')!;
    expect(overlay.shared).toHaveLength(2);
    expect(overlay.parted).toHaveLength(2);
    expect(overlay.headline).toBe('2개는 같고, 2개는 갈렸어요');
    // 점수·등급·궁합률 같은 것은 애초에 만들어지지 않는다
    expect(Object.keys(overlay).sort()).toEqual(
      [
        'headline',
        'mine',
        'mineName',
        'parted',
        'question',
        'shared',
        'yours',
        'yoursName',
      ].sort(),
    );
  });

  it('겹쳐보기는 대칭이다 — 누가 먼저 보내도 같은 자리를 짚는다', () => {
    const a = overlayCodes('QSRI', 'VKNO')!;
    const b = overlayCodes('VKNO', 'QSRI')!;
    expect(a.parted.map((f) => f.title)).toEqual(b.parted.map((f) => f.title));
    expect(a.question).toBe(b.question);
    expect(a.headline).toBe(b.headline);
  });
});
