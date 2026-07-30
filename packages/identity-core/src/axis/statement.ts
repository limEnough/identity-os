import { eul } from '../josa';
import type { Profile } from './types';

/**
 * 나의 문장 — 여정이 길어질수록 함께 자라는 한 편의 글.
 *
 * 축을 하나 지날 때마다 한 줄이 붙는다. 그래서 이 글은 결과 리포트가 아니라
 * **걸어온 만큼만 적힌 글**이다: 두 축만 걸었으면 네 줄, 여덟 축을 걸었으면 열 줄.
 *
 * 여기서는 결과의 **이름을 부르지 않는다.** 대괄호 이름을 여덟 개 이어 붙이면
 * 문장이 아니라 암호가 되기 때문이다. 대신 이름을 풀어 쓴 말(clause)을 쓴다 —
 * 손글씨로 읽히는 유일한 자리이므로, 읽어서 바로 이해되는 것이 가장 중요하다.
 */
export function buildStatement(profile: Profile): string[] {
  const done = profile.results.filter((r) => r.done);
  const identity = done.find((r) => r.id === 'identity');
  if (!identity) return [];

  const lines: string[] = [
    `나는 ${identity.short}${eul(identity.short)} 동경하는 사람이다.`,
    `그 마음의 이름은 「${identity.name}」.`,
  ];

  // 나머지 축은 걸어온 순서대로 한 줄씩 — 이름이 아니라 풀어 쓴 말로
  for (const result of done) {
    if (result.id === 'identity') continue;
    const clause = result.clause.trim();
    if (!clause) continue;
    lines.push(clause.endsWith('.') ? clause : `${clause}.`);
  }

  // 마지막은 언제나 뿌리로 돌아간다 — 문장의 끝이 실천의 방향이 되도록
  lines.push(`그래서 나는, ${identity.tag}.`);
  return lines;
}
