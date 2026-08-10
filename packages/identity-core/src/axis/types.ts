import type { Canon, PoleProjection } from './canon';

/**
 * 여덟 축이 공유하는 한 걸음의 모양 — 축마다 다른 것은 '무엇을 묻는지'뿐이다.
 *
 * 축 하나는 언제나 여섯 걸음이다:
 *   0 입구(넓게) · 1 입구에 매인 구체 · 2~4 깊은 물음 셋(넘어갈 수 있다)
 *   5 명명(제안 + 다른 결 + 이웃 + 유보)
 * 넓게 물어 좁게 닫는다. 뒤 축으로 갈수록 걸음 수가 아니라 결과가 세밀해진다.
 *
 * 축은 **이름에서 끝난다.** 한때 일곱째 걸음으로 '이번 주의 한 가지'를 골라두었는데,
 * 축마다 실천이 하나씩 쌓여 여덟 개의 할 일 목록이 됐다 — 거울을 보러 온 사람에게
 * 숙제를 얹는 꼴이다. 실천은 처방 금지(불변식 #3)의 가장 미끄러운 자리이기도 하다.
 * 그래서 축은 분석까지만 하고, 여정 전체가 끝나는 자리에서 맺음 하나만 건넨다.
 */

/** 축 번호 순서 — 여정의 순서이자 의존의 순서다 */
export type AxisId =
  | 'identity'
  | 'mindset'
  | 'communication'
  | 'lifestyle'
  | 'taste'
  | 'style'
  | 'health'
  | 'career';

/** 한 걸음의 delta — 그 축의 세 극에 더한다 */
export type Triple = [number, number, number];

export interface AxisOption {
  emoji?: string;
  /** 화면에 보이는 선택지 */
  title: string;
  /** 발견 조각에 남는 라벨 */
  label: string;
  shift: Triple;
  /**
   * 문장·실천 카드에 그대로 실리는 축약 표현.
   * 입구에 매인 물음(scoped)의 답은 언제나 이걸 갖는다 — 그 사람의 하루에 붙는 말이므로.
   */
  phrase?: string;
}

/** 명명이 좌표가 아니라 고른 갈래에서 나오는 축(Identity)의 이름 후보 */
export type NameTriple = [string, string, string];

export interface AxisChild extends AxisOption {
  /** 이 갈래가 내미는 이름 셋 — 제안 하나와 결이 다른 둘 */
  names?: NameTriple;
}

/** 입구에 매인 갈래 — "그 마음은 언제 찾아오나요" 같은, 입구마다 다른 물음의 답 */
export interface AxisScoped extends AxisOption {
  phrase: string;
}

export interface AxisOpening extends AxisOption {
  sub: string;
  /** 문장에 들어가는 축약 표현 */
  short: string;
  children: AxisChild[];
  /** scoped 물음을 쓰는 축만 채운다 */
  scoped?: AxisScoped[];
}

export interface AxisProbe {
  /** 줄바꿈(\n)으로 두 줄까지 */
  title: string;
  sub: string;
  skipLabel: string;
  /** 'scoped' = 입구에 매인 갈래를 쓴다. 배열이면 이 축 공용 목록. */
  options: AxisOption[] | 'scoped';
}

export interface AxisFacet {
  /** design-system의 CATEGORY_ICONS 키 */
  icon: string;
  name: string;
  chips: string[];
}

/** 좌표가 가리키는 결과 — 축마다 여덟 개(세 극의 8분면) */
export interface AxisOutcome {
  name: string;
  /** 같은 결의 다른 이름 */
  alt: string;
  /** 이름 옆에 붙는 한 줄 */
  tag: string;
  /**
   * 이름을 쉬운 말로 풀어 쓴 한 줄 — 이름은 절대 혼자 놓이지 않는다.
   * 이름이 은유면 뜻은 여기서 전달돼야 한다. 없으면 tag로 물러난다.
   */
  summary?: string;
  /** 나의 문장에 들어가는 절 — 대괄호 없이, 보통 문장으로 */
  clause?: string;
  /** 이 방식이 잘 통하는 자리 */
  fits?: string[];
  /** 이 방식이 나를 힘들게 하는 자리 — 가이드북을 펼쳐본 사람에게만 보인다 */
  strains?: string[];
  /** 이 결과가 뒤 축에 남기는 각인 */
  imprint: Canon;
  /** 네 갈래의 표현 언어 */
  facets: AxisFacet[];
  /**
   * 결과 변주 — 앞선 축이 쌓일수록 더 많이 열린다.
   * 같은 8분면에 닿아도 걸어온 길이 다르면 다른 변주를 받는다.
   */
  variants: string[];
}

/** 이름이 확정된 결과 — 좌표에서 왔든(octant) 고른 갈래에서 왔든(child) 같은 모양이 된다 */
export interface NamedOutcome {
  name: string;
  tag: string;
  /** 이름을 쉬운 말로 풀어 쓴 한 줄 */
  summary: string;
  clause: string;
  fits: string[];
  strains: string[];
  imprint: Canon;
  facets: AxisFacet[];
  variants: string[];
  /** 걸어온 길과 앞 축의 수가 함께 고른 변주 하나 */
  variant: string;
}

export interface AxisPole {
  /** 음(−) 방향 — 막대의 왼쪽 끝 */
  left: string;
  /** 양(+) 방향 — 막대의 오른쪽 끝 */
  right: string;
}

/** 이 축이 확정한 것 — 뒤 축이 읽는 유일한 창구 */
export interface AxisResult {
  id: AxisId;
  /** 축 이름 (Identity·Mindset…) */
  axisName: string;
  /** 이 축의 결과를 부르는 한국어 이름 (가치·태도·무드…) */
  resultLabel: string;
  /** 확정된 이름 */
  name: string;
  tag: string;
  /** 이름을 쉬운 말로 풀어 쓴 한 줄 */
  summary: string;
  /** 나의 문장에 들어가는 절 */
  clause: string;
  /** 입구의 축약 표현 — 인용에 쓰인다 */
  short: string;
  imprint: Canon;
  /** '아직 잘 모르겠어요'로 임시 확정했는지 */
  tentative: boolean;
  /** 명명까지 끝냈는지 */
  done: boolean;
}

/**
 * 걸어온 축들이 남긴 것 — 다음 축의 출발점이자 인용의 재료.
 * 순서가 곧 의존이라, results는 언제나 축 번호 순이다.
 */
export interface Profile {
  results: AxisResult[];
  /** 누적된 결 */
  acc: Canon;
}

export interface AxisState {
  stepIndex: number;
  opening: AxisOpening | null;
  child: AxisChild | null;
  /** 깊은 물음 셋의 답 — null은 아직 또는 넘어감 */
  probes: [AxisOption | null, AxisOption | null, AxisOption | null];
  skipped: [boolean, boolean, boolean];
  outcome: NamedOutcome | null;
  name: string | null;
  tentative: boolean;
}

export interface AxisDef {
  id: AxisId;
  /** 가이드북의 번호 (01~08) */
  no: string;
  /** 가이드북·브랜드에 쓰이는 이름 */
  name: string;
  /** 한 줄 소개 — 잠긴 섹션에도 보인다 */
  blurb: string;
  /** 걷는 중 화면 위에 뜨는 말 */
  brand: string;
  /** 이 축의 결과를 부르는 한국어 이름 — 발견 조각과 인용에 쓰인다 (가치·태도·무드…) */
  resultLabel: string;
  /** 발견 조각의 앞머리 다섯 — 입구 · 구체 · 깊은 물음 셋 */
  chipLabels: [string, string, string, string, string];
  /** URL 파라미터 한 글자 */
  param: string;
  /** 브라우저 기억의 키 */
  storageKey: string;
  /** 세 극의 이름 */
  poles: [AxisPole, AxisPole, AxisPole];
  /** 누적된 결을 이 축의 세 극으로 받아오는 통로 */
  projection: [PoleProjection, PoleProjection, PoleProjection];
  openings: AxisOpening[];
  /** 첫 걸음의 물음 */
  openingProbe: { title: string; sub: string };
  /** 두 번째 걸음의 물음 */
  childProbe: { title: string; sub: string };
  /** 깊은 물음 셋 */
  probes: [AxisProbe, AxisProbe, AxisProbe];
  /** 좌표가 가리키는 여덟 결과 — 비트 순서가 배열 순서다 */
  outcomes: AxisOutcome[];
  /** 명명이 좌표에서 오는가(octant), 고른 갈래에서 오는가(child) */
  naming: 'octant' | 'child';
  /**
   * child 축의 이름별 결 — 좌표가 8분면으로 뭉뚱그리는 대신 이름마다 따로 적는다.
   * (Identity의 가치 59종처럼, 이름 자체가 이미 세밀할 때)
   */
  namedOutcomes?: Record<string, { tag: string; imprint: Canon }>;
  /** 명명 화면에서 오브가 말하는 방식 — 없으면 공통 발화를 쓴다 */
  coachLines?: (ctx: {
    proposed: string;
    other: string;
    neighbor?: string;
    tilt: string;
    profile: Profile;
    state: AxisState;
  }) => string[];
}
