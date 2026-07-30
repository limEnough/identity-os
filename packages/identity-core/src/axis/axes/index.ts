import { identityAxis } from './identity';
import { mindsetAxis } from './mindset';
import { communicationAxis } from './communication';
import { lifestyleAxis } from './lifestyle';
import { tasteAxis } from './taste';
import { styleAxis } from './style';
import { healthAxis } from './health';
import { careerAxis } from './career';
import type { AxisDef } from '../types';

/**
 * 여덟 축 — **배열 순서가 곧 여정의 순서이자 의존의 순서다.**
 *
 *   뿌리(내면)  1 Identity · 2 Mindset
 *   줄기(삶)    3 Communication · 4 Lifestyle
 *   잎(표현)    5 Taste · 6 Style
 *   줄기(몸·일) 7 Health · 8 Career
 *
 * 앞 축이 완주되지 않으면 뒤 축은 열리지 않는다. 순서를 바꾸면 결과가 바뀐다 —
 * 각 축의 좌표가 앞선 축들의 각인 위에서 출발하기 때문이다(journey.ts).
 */
export const AXES: AxisDef[] = [
  identityAxis,
  mindsetAxis,
  communicationAxis,
  lifestyleAxis,
  tasteAxis,
  styleAxis,
  healthAxis,
  careerAxis,
];

export {
  identityAxis,
  mindsetAxis,
  communicationAxis,
  lifestyleAxis,
  tasteAxis,
  styleAxis,
  healthAxis,
  careerAxis,
};
export { DIRECTION, RITUAL } from './identity';
