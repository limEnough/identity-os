/**
 * Identity 축 Why 체인 데이터 (ver1 — 구조화 트리, LLM 코치는 ver2).
 * 롤모델을 분석하지 않는다 — 부러움을 거울 삼아 사용자의 가치를 찾는다.
 */

export interface EnvyAspect {
  title: string;
  /** 코치가 제안하는 가치의 이름 */
  value: string;
  /** "비슷하지만 조금 달라요" 대안 이름 */
  alt: string;
}

export interface EnvyType {
  title: string;
  sub: string;
  /** 문장에 들어가는 축약 표현 */
  short: string;
  aspects: EnvyAspect[];
}

export const ENVY: EnvyType[] = [
  {
    title: '흔들림 없이 자기 일을 하는 사람',
    sub: '주변이 소란해도 고요하게 몰입하는',
    short: '흔들림 없는 고요함',
    aspects: [
      { title: '누구의 시선에도 흔들리지 않아서', value: '단단함', alt: '자유' },
      { title: '자기 리듬을 지킬 줄 알아서', value: '평온', alt: '절제' },
      { title: '깊이 몰입하는 모습이 아름다워서', value: '몰입', alt: '성실' },
    ],
  },
  {
    title: '어디서든 사람을 편안하게 하는 사람',
    sub: '그 사람 곁에선 다들 말이 많아지는',
    short: '사람을 편안하게 하는 온기',
    aspects: [
      { title: '따뜻함이 자연스러워 보여서', value: '다정함', alt: '환대' },
      { title: '누구와도 벽이 없어 보여서', value: '열림', alt: '용기' },
      { title: '말보다 잘 들어주는 사람이라서', value: '경청', alt: '존중' },
    ],
  },
  {
    title: '자기 세계가 뚜렷한 사람',
    sub: '취향과 기준이 분명해서 흉내 낼 수 없는',
    short: '뚜렷한 자기 세계',
    aspects: [
      { title: '기준이 분명해서 결정이 쉬워 보여서', value: '주관', alt: '명료함' },
      { title: '취향이 삶 전체에 배어 있어서', value: '일관성', alt: '심미안' },
      { title: '남과 비교하지 않는 것 같아서', value: '자기확신', alt: '독립' },
    ],
  },
  {
    title: '무너져도 다시 일어서는 사람',
    sub: '실패를 이야기할 때조차 담담한',
    short: '다시 일어서는 힘',
    aspects: [
      { title: '실패를 부끄러워하지 않아서', value: '용기', alt: '솔직함' },
      { title: '감정을 잘 다루는 것처럼 보여서', value: '회복력', alt: '평정' },
      { title: '그럼에도 계속 가는 꾸준함 때문에', value: '끈기', alt: '희망' },
    ],
  },
];

export interface WhyOption {
  title: string;
  /** 발견 조각 라벨 */
  label: string;
}

export const WHY: WhyOption[] = [
  { title: '그게 없어서 힘들었던 적이 있어서', label: '결핍의 기억' },
  { title: '그렇게 살고 싶다고 늘 생각해와서', label: '오래된 지향' },
  { title: '지금의 나와 가장 멀게 느껴져서', label: '지금과의 거리' },
];

export interface OriginOption {
  title: string;
  /** 문장에 들어가는 표현 */
  phrase: string;
}

export const ORIGIN: OriginOption[] = [
  { title: '어린 시절의 기억이 떠올라요', phrase: '어린 시절의 기억' },
  { title: '학창 시절 즈음부터였던 것 같아요', phrase: '학창 시절의 경험' },
  { title: '최근의 어떤 일 이후로요', phrase: '최근의 경험' },
];

/** 가치 → 실천 방향 문장 ("그래서 나는, ___") */
export const DIRECTION: Record<string, string> = {
  단단함: '흔들리는 날에도 나의 속도를 지킨다',
  자유: '남의 기준에서 조금씩 걸어 나온다',
  평온: '하루에 고요한 시간을 마련한다',
  절제: '덜어내며 또렷해진다',
  몰입: '한 번에 한 가지에 깊이 머문다',
  성실: '작은 반복을 존중한다',
  다정함: '가까운 사람에게 먼저 따뜻해진다',
  환대: '낯선 것을 반기는 연습을 한다',
  열림: '벽을 하나씩 낮춘다',
  용기: '부끄러움보다 솔직함을 고른다',
  경청: '말하기 전에 한 번 더 듣는다',
  존중: '다름을 고치려 하지 않는다',
  주관: '작은 결정부터 내 기준으로 한다',
  명료함: '말과 삶을 단순하게 한다',
  일관성: '취향을 삶의 구석까지 데려간다',
  심미안: '아름답다고 느낀 이유를 적어둔다',
  자기확신: '비교 대신 어제의 나를 본다',
  독립: '혼자의 시간을 두려워하지 않는다',
  회복력: '무너진 날의 나를 미워하지 않는다',
  평정: '감정에 이름을 붙여준다',
  끈기: '멈춰도 끝내지는 않는다',
  희망: '다시 시작하는 나를 믿는다',
  솔직함: '실패를 실패라고 말할 수 있다',
};

export interface PracticeOption {
  action: string;
  caption: string;
}

import { iga } from './josa';

/** 가치 하나를 이번 주의 작은 행동 세 가지로 번역한다 */
export function buildPractices(value: string): PracticeOption[] {
  return [
    { action: `${DIRECTION[value] ?? '나의 문장대로 하루를 산다'} — 이번 주 한 번`, caption: '아주 작게, 그러나 분명하게' },
    { action: `「${value}」${iga(value)} 무너졌던 순간을 하루 끝에 한 줄로 적기`, caption: '판단 없이, 기록만' },
    { action: '부러웠던 그 사람이 할 법한 일을 딱 하나 해보기', caption: '동경을 흉내가 아닌 실험으로' },
  ];
}
