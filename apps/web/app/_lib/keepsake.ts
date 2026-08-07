import type { ChronicleEntry, ShelfItem } from "@identity-os/identity-core";

/**
 * 간직되는 것들 — 서재와 연표.
 *
 * 발자국(progress.ts)과 다른 점이 하나 있다. 발자국은 '지금 걷는 판'의 것이라
 * 다시 걸으면 지워지지만, **여기 쌓인 것은 판이 바뀌어도 지워지지 않는다.** 지난
 * 계절의 네 글자와 그때 꽂아둔 구절은 새 판을 시작해도 남아 있어야, "나는 계속
 * 수정된다"가 화면의 물건이 된다.
 *
 * 저장 방식을 아는 것은 여전히 앱 셸뿐이다 — identity-core는 순수 함수만 갖고,
 * 피처는 props로 받는다(MFE 경계).
 */

const SHELF_KEY = "identity-os:shelf:v1";
const CHRONICLE_KEY = "identity-os:chronicle:v1";

function read<T>(key: string): T[] {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    // 못 읽는 환경(시크릿 모드·깨진 값)은 빈 것으로 — 여정은 계속된다
    return [];
  }
}

function write<T>(key: string, list: T[]) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(list));
  } catch {
    /* 저장 불가 환경은 조용히 무시 */
  }
}

export const loadShelf = (): ShelfItem[] => read<ShelfItem>(SHELF_KEY);
export const saveShelf = (items: ShelfItem[]) => write(SHELF_KEY, items);

export const loadChronicle = (): ChronicleEntry[] =>
  read<ChronicleEntry>(CHRONICLE_KEY);
export const saveChronicle = (entries: ChronicleEntry[]) =>
  write(CHRONICLE_KEY, entries);

/** 지난 판의 네 글자 — 겹쳐보기가 상대 없이도 나를 알아보는 통로 */
export function lastSealedCode(): string | null {
  const entries = loadChronicle();
  return entries[entries.length - 1]?.code ?? null;
}
