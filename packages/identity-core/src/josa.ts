/** 한국어 조사 헬퍼 — 받침 유무에 따라 을/를, 이/가, 이에요/예요를 고른다 */
export function hasBatchim(word: string): boolean {
  const code = word.charCodeAt(word.length - 1);
  return code >= 0xac00 && code <= 0xd7a3 ? (code - 0xac00) % 28 !== 0 : true;
}

export const eul = (w: string) => (hasBatchim(w) ? '을' : '를');
export const iga = (w: string) => (hasBatchim(w) ? '이' : '가');
export const ieyo = (w: string) => (hasBatchim(w) ? '이에요' : '예요');
