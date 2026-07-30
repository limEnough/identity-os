import { eul } from '../josa';
import type { Profile } from './types';

/**
 * 나의 문장 — 여정이 길어질수록 함께 자라는 한 편의 글.
 *
 * 축을 하나 지날 때마다 절이 하나 붙는다. 그래서 이 문장은 결과 리포트가 아니라
 * **걸어온 만큼만 적힌 글**이다: 두 축만 걸었으면 두 줄, 여덟 축을 걸었으면 여섯 줄.
 *
 * 손글씨로 쓰이는 유일한 자리이므로 길이를 재단한다 — 절은 두 개씩 한 줄에 묶는다.
 */

/** 축마다 자기 절을 어떻게 말하는지 (Identity는 첫 줄이 따로 있어 절을 갖지 않는다) */
const CLAUSE: Record<string, (name: string) => string> = {
  mindset: (n) => `「${n}」의 머리로 생각하고`,
  communication: (n) => `「${n}」의 거리에서 사람을 만나고`,
  lifestyle: (n) => `「${n}」의 하루를 살고`,
  taste: (n) => `「${n}」에 끌리고`,
  style: (n) => `「${n}」의 무드로 드러내고`,
  health: (n) => `「${n}」으로 몸을 돌보고`,
  career: (n) => `「${n}」으로 자란다`,
};

export function buildStatement(profile: Profile): string[] {
  const done = profile.results.filter((r) => r.done);
  const identity = done.find((r) => r.id === 'identity');
  if (!identity) return [];

  const lines: string[] = [
    `나는 ${identity.short}${eul(identity.short)} 동경하는 사람이다.`,
  ];

  const style = done.find((r) => r.id === 'style');
  // 무드가 정해지면 가치를 부르던 줄을 무드 줄이 이어받는다 — 문장은 길어지지 않는다
  lines.push(
    style
      ? `그래서 「${style.name}」의 무드에 끌렸는지도 모른다.`
      : `그 동경의 이름은 「${identity.name}」.`,
  );

  const clauses = done
    .filter((r) => r.id !== 'identity' && CLAUSE[r.id])
    .map((r) => CLAUSE[r.id](r.name));

  for (let i = 0; i < clauses.length; i += 2) {
    const pair = clauses.slice(i, i + 2).join(', ');
    const last = i + 2 >= clauses.length;
    lines.push(last ? `${pair}.` : `${pair},`);
  }

  // 마지막은 언제나 뿌리로 돌아간다 — 문장의 끝이 실천의 방향이 되도록
  lines.push(`그래서 나는, ${identity.tag}.`);
  return lines;
}
