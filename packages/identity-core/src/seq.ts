/** 발자국(응답 시퀀스) 직렬화 — URL·브라우저 기억 공용 포맷 (예: "2.0.9.1") */
export function encodeSeq(seq: number[]): string {
  return seq.join('.');
}

export function decodeSeq(raw: string | null | undefined): number[] {
  if (!raw) return [];
  return raw
    .split('.')
    .filter((x) => x !== '')
    .map((x) => Number.parseInt(x, 10))
    .filter((n) => Number.isInteger(n) && n >= 0);
}
