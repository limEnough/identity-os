import { CANON_KEYS, ZERO } from '../axis/canon';
import type { Canon } from '../axis/canon';
import { codeCanon } from '../axis/code';
import type { Profile } from '../axis/types';
import { PASSAGES } from './passages';
import type { Passage } from './passages';
import { TRACKS } from './tracks';
import type { Track } from './tracks';

/**
 * 결 서재 — 방문할 때마다 한 꾸러미씩 쌓이는 자리.
 *
 * 끝에 한 번 주고 마는 선물은 삼십 초 만에 소비되고 끝난다. 그래서 서재로 만든다:
 * 올 때마다 「한 구절과 그것이 온 곳」 하나와 노래 하나가 꽂히고, 반년이면 스무 칸이
 * 된다 — 그 자체가 나를 설명하는 물건이 되도록.
 *
 * 고르는 방식은 축과 같다(가까운 결). 이미 가져간 것은 후보에서 빠지므로, 두 번째
 * 방문은 두 번째로 가까운 것을 데려온다. 서재가 바닥나면 처음으로 돌아간다 —
 * 문이 닫히지는 않게.
 */

/** 가져간 꾸러미 하나 — 앱이 이 브라우저에 기억한다 */
export interface ShelfItem {
  passageId: string;
  trackId: string;
  /** 가져간 날 (ISO) */
  at: string;
}

export interface Gift {
  passage: Passage;
  track: Track;
}

/**
 * 구절과 견줄 수 있는 모양으로 접은 결.
 *
 * 두 번 손을 본다. 먼저 네 글자와 같은 **한가운데 기준**으로 옮기고(그러지 않으면
 * 각인의 쏠림 때문에 모두가 같은 서가 앞에 선다), 그다음 축 하나 몫으로 나눈다 —
 * 구절의 결은 −1~1로 적혀 있으므로 여덟 축이 쌓인 값과 그대로 견줄 수 없다.
 */
export function shelfCanon(profile: Profile): Canon {
  const walked = profile.results.filter((r) => r.done).length;
  if (walked === 0) return { ...ZERO };
  const centered = codeCanon(profile);
  const fold = (n: number) => Math.min(1, Math.max(-1, n / walked));
  return {
    vivid: fold(centered.vivid),
    sharp: fold(centered.sharp),
    modern: fold(centered.modern),
    outward: fold(centered.outward),
  };
}

const distance = (a: Canon, b: Canon): number =>
  CANON_KEYS.reduce((sum, key) => sum + (a[key] - b[key]) ** 2, 0);

/**
 * 후보 중 결이 가장 가까운 하나. 이미 가져간 것은 빼고 고르되,
 * 다 가져갔으면 전체에서 다시 고른다.
 */
function nearest<T extends { id: string; canon: Canon }>(
  pool: T[],
  target: Canon,
  taken: Set<string>,
): T {
  const fresh = pool.filter((item) => !taken.has(item.id));
  const candidates = fresh.length > 0 ? fresh : pool;
  return candidates.reduce((best, item) =>
    distance(item.canon, target) < distance(best.canon, target) ? item : best,
  );
}

/** 그 날짜의 하루 (지역 시간) — 하루에 한 꾸러미를 세는 단위 */
const dayOf = (at: string | number): string =>
  new Date(at).toLocaleDateString('en-CA');

/**
 * 오늘 꾸러미를 받을 수 있는지 — 하루에 하나.
 *
 * 한 번에 다 꺼내 가면 서재가 아니라 목록이 된다. 하루 한 칸이라는 제한이
 * 다시 올 이유를 만들되, 감춰두고 조르는 방식은 아니다: 이미 받았으면
 * 받았다고 적고 내일을 알린다.
 */
export const giftReady = (taken: ShelfItem[], now: number): boolean => {
  const last = taken[taken.length - 1];
  return !last || dayOf(last.at) !== dayOf(now);
};

/** 오늘 꽂힐 꾸러미 하나 — 구절 하나와 노래 하나 */
export function pickGift(profile: Profile, taken: ShelfItem[]): Gift | null {
  if (profile.results.filter((r) => r.done).length === 0) return null;
  const target = shelfCanon(profile);
  return {
    passage: nearest(PASSAGES, target, new Set(taken.map((t) => t.passageId))),
    track: nearest(TRACKS, target, new Set(taken.map((t) => t.trackId))),
  };
}

/** 기억해둔 꾸러미들을 실제 구절·노래로 되살린다 (최근 것이 앞) */
export function resolveShelf(taken: ShelfItem[]): Array<ShelfItem & Gift> {
  return taken
    .map((item) => {
      const passage = PASSAGES.find((p) => p.id === item.passageId);
      const track = TRACKS.find((t) => t.id === item.trackId);
      return passage && track ? { ...item, passage, track } : null;
    })
    .filter((item): item is ShelfItem & Gift => item !== null)
    .reverse();
}

/** 서재가 품을 수 있는 최대 칸 수 — 넓히는 일은 데이터 작업이다 */
export const SHELF_CAPACITY = Math.min(PASSAGES.length, TRACKS.length);
