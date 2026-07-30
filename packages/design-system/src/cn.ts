/** 클래스 이름 합치기 — 거짓값은 버리고 공백으로 잇는다 */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
