/**
 * Style 축 무드 데이터 (ver1 — 구조화 트리, LLM 코치는 ver2).
 * Identity가 '왜'를 캐묻는다면 Style은 '감각'을 묻는다 — 잎은 뿌리를 설명하지 않는다.
 * 모든 선택은 세 축에 delta를 더하고, 그 좌표가 무드 하나로 수렴한다.
 */

/**
 * 무드 좌표의 이동량. 세 축 모두 −1 ~ +1.
 * 이름은 양(+)의 방향을 가리킨다 — vivid=생동감, sharp=또렷함, modern=지금의 것.
 */
export interface MoodShift {
  /** 고요함(−) ↔ 생동감(+) */
  vivid: number;
  /** 부드러움(−) ↔ 또렷함(+) */
  sharp: number;
  /** 오래된 것(−) ↔ 지금의 것(+) */
  modern: number;
}

export interface TextureOption {
  title: string;
  /** 발견 조각 라벨 */
  label: string;
  shift: MoodShift;
}

export interface SceneOption {
  emoji: string;
  title: string;
  sub: string;
  label: string;
  shift: MoodShift;
  /** 장면마다 다른 감각 — 같은 질감이라도 어느 장면에 놓이느냐로 뜻이 달라진다 */
  textures: TextureOption[];
}

export const SCENE: SceneOption[] = [
  {
    emoji: "🌫",
    title: "이른 아침, 아무도 없는 방",
    sub: "빛이 막 들어오기 시작한",
    label: "이른 아침의 빈 방",
    shift: { vivid: -0.9, sharp: -0.2, modern: 0.1 },
    textures: [
      {
        title: "맨발에 닿는 서늘한 바닥",
        label: "서늘한 바닥",
        shift: { vivid: -0.4, sharp: 0.3, modern: 0.2 },
      },
      {
        title: "밤새 식은 이불의 무게",
        label: "이불의 무게",
        shift: { vivid: -0.3, sharp: -0.6, modern: -0.3 },
      },
      {
        title: "차가운 유리컵의 물",
        label: "유리컵의 물",
        shift: { vivid: -0.1, sharp: 0.6, modern: 0.4 },
      },
    ],
  },
  {
    emoji: "🪵",
    title: "늦은 오후, 오래된 골목",
    sub: "해가 낮게 깔린",
    label: "늦은 오후의 골목",
    shift: { vivid: -0.3, sharp: -0.4, modern: -0.9 },
    textures: [
      {
        title: "손끝에 걸리는 낡은 벽",
        label: "낡은 벽",
        shift: { vivid: 0.1, sharp: 0.2, modern: -0.8 },
      },
      {
        title: "오래 입은 외투의 안감",
        label: "외투의 안감",
        shift: { vivid: -0.4, sharp: -0.5, modern: -0.6 },
      },
      {
        title: "발밑에서 부서지는 마른 잎",
        label: "마른 잎",
        shift: { vivid: 0.5, sharp: 0.3, modern: -0.4 },
      },
    ],
  },
  {
    emoji: "💡",
    title: "밤, 불 켜진 작업실",
    sub: "혼자 몰두하는 시간",
    label: "밤의 작업실",
    shift: { vivid: -0.2, sharp: 0.8, modern: 0.3 },
    textures: [
      {
        title: "종이 위를 지나가는 펜",
        label: "종이 위의 펜",
        shift: { vivid: -0.3, sharp: 0.5, modern: -0.2 },
      },
      {
        title: "따뜻해진 머그의 손잡이",
        label: "머그의 손잡이",
        shift: { vivid: -0.5, sharp: -0.4, modern: 0 },
      },
      {
        title: "책상 위 금속의 서늘함",
        label: "금속의 서늘함",
        shift: { vivid: 0, sharp: 0.8, modern: 0.5 },
      },
    ],
  },
  {
    emoji: "🌬",
    title: "바람 부는 바깥",
    sub: "움직이고 있는 한낮",
    label: "바람 부는 바깥",
    shift: { vivid: 0.9, sharp: 0.3, modern: 0.4 },
    textures: [
      {
        title: "얼굴을 스치는 찬 공기",
        label: "찬 공기",
        shift: { vivid: 0.4, sharp: 0.5, modern: 0.2 },
      },
      {
        title: "품이 넉넉한 옷의 펄럭임",
        label: "옷의 펄럭임",
        shift: { vivid: 0.3, sharp: -0.6, modern: -0.2 },
      },
      {
        title: "손바닥에 남은 흙",
        label: "손에 남은 흙",
        shift: { vivid: 0.2, sharp: 0.1, modern: -0.7 },
      },
    ],
  },
];

export interface LightOption {
  emoji: string;
  title: string;
  label: string;
  shift: MoodShift;
}

export const LIGHT: LightOption[] = [
  {
    emoji: "🕯",
    title: "낮게 깔린 노란빛",
    label: "노란빛",
    shift: { vivid: -0.3, sharp: -0.6, modern: -0.5 },
  },
  {
    emoji: "☁️",
    title: "구름 낀 날의 흰빛",
    label: "흰빛",
    shift: { vivid: -0.4, sharp: 0.1, modern: 0.3 },
  },
  {
    emoji: "🔆",
    title: "그림자가 선명한 직광",
    label: "직광",
    shift: { vivid: 0.5, sharp: 0.8, modern: 0.2 },
  },
];

export interface DistanceOption {
  title: string;
  sub: string;
  label: string;
  shift: MoodShift;
}

export const DISTANCE: DistanceOption[] = [
  {
    title: "가까이 오기 편한 사람으로",
    sub: "먼저 말 걸어도 괜찮을 것 같은",
    label: "가까운 거리",
    shift: { vivid: 0.4, sharp: -0.7, modern: -0.2 },
  },
  {
    title: "한 걸음 떨어져 단정한 사람으로",
    sub: "흐트러지지 않는 선이 있는",
    label: "단정한 거리",
    shift: { vivid: -0.5, sharp: 0.6, modern: -0.3 },
  },
  {
    title: "굳이 설명하지 않아도 되는 사람으로",
    sub: "보면 그냥 알 것 같은",
    label: "설명 없는 거리",
    shift: { vivid: -0.3, sharp: 0.3, modern: 0.4 },
  },
];

/** 카테고리 아이콘 이름 — 그림은 design-system의 CATEGORY_ICONS가 들고 있다 */
export type MoodCategoryIcon = "coat" | "window" | "chat" | "box";

export interface MoodCategory {
  icon: MoodCategoryIcon;
  name: string;
  chips: string[];
}

export interface Mood {
  /** 코치가 제안하는 무드의 이름 */
  name: string;
  /** "비슷하지만 조금 달라요" 대안 이름 */
  alt: string;
  tag: string;
  /** 무드를 몸으로 확인하는 행동 하나 */
  anchor: string;
  categories: MoodCategory[];
}

const cats = (
  wear: string[],
  space: string[],
  words: string[],
  things: string[],
): MoodCategory[] => [
  { icon: "coat", name: "옷차림", chips: wear },
  { icon: "window", name: "공간", chips: space },
  { icon: "chat", name: "말과 태도", chips: words },
  { icon: "box", name: "곁에 두는 것", chips: things },
];

/**
 * 무드 8종 — 세 축을 각각 반으로 나눈 8분면.
 * 순서가 곧 좌표다: [고요/생동] × [부드러움/또렷함] × [오래된/지금].
 * MOODS[i]의 i는 styleAxes 결과에서 계산되므로 배열 순서를 바꾸면 안 된다.
 */
export const MOODS: Mood[] = [
  {
    name: "오래된 고요",
    alt: "바랜 온기",
    tag: "오래 쓴 물건처럼, 시간이 스며든 고요함",
    anchor: "오래 쓴 물건 하나를 눈에 보이는 자리에 두기",
    categories: cats(
      ["바랜 아이보리", "도톰한 니트", "오래 입은 코트"],
      ["나무 결", "낮은 조명", "손때 묻은 책"],
      ["느린 말끝", "되묻지 않기", "긴 침묵을 견디기"],
      ["필름 카메라", "종이 노트", "오래된 그릇"],
    ),
  },
  {
    name: "조용한 여백",
    alt: "담백한 고요",
    tag: "덜어낼수록 또렷해지는, 지금의 조용함",
    anchor: "책상 위에서 물건 세 개를 치우기",
    categories: cats(
      ["무채색", "군더더기 없는 선", "한 벌로 끝내기"],
      ["비워둔 벽", "흰 빛", "물건마다의 자리"],
      ["짧은 문장", "먼저 듣기", "여백을 두기"],
      ["흰 머그", "얇은 노트", "유리컵"],
    ),
  },
  {
    name: "단정한 기품",
    alt: "고요한 격식",
    tag: "흐트러지지 않는 선, 오래 지켜온 격식",
    anchor: "외출 전 거울 앞에서 옷깃을 한 번 정리하기",
    categories: cats(
      ["정돈된 칼라", "깊은 네이비", "잘 다린 주름"],
      ["반듯한 선반", "어두운 목재", "정돈된 책상"],
      ["또박또박", "약속 지키기", "예의 있는 거리"],
      ["만년필", "가죽 다이어리", "손목시계"],
    ),
  },
  {
    name: "차분한 미니멀",
    alt: "선명한 절제",
    tag: "군더더기 없이 선명한, 오늘의 절제",
    anchor: "오늘 입을 옷을 흑백 두 가지로만 맞추기",
    categories: cats(
      ["매끈한 소재", "흑과 백", "정확한 기장"],
      ["직선", "숨은 수납", "차가운 빛"],
      ["요점부터", "담백한 거절", "군말 없음"],
      ["검은 노트", "무광 케이스", "단순한 조명"],
    ),
  },
  {
    name: "따뜻한 생기",
    alt: "다정한 활기",
    tag: "손때 묻은 것들 사이의 따뜻한 활기",
    anchor: "식탁에 식물이나 꽃 하나를 올려두기",
    categories: cats(
      ["테라코타", "헐렁한 셔츠", "손뜨개"],
      ["식물", "나무 식탁", "주황빛 등"],
      ["잘 웃기", "먼저 안부 묻기", "이름 불러주기"],
      ["흙빛 그릇", "오래된 라디오", "마른 꽃"],
    ),
  },
  {
    name: "부드러운 활기",
    alt: "말랑한 생동",
    tag: "가볍고 둥근, 지금 이 순간의 생기",
    anchor: "눈에 띄는 색 하나를 몸에 지니고 나가기",
    categories: cats(
      ["파스텔", "둥근 실루엣", "가벼운 소재"],
      ["밝은 창", "알록달록한 소품", "낮은 소파"],
      ["감탄사", "가벼운 농담", "빠른 리액션"],
      ["스티커", "색색의 펜", "작은 인형"],
    ),
  },
  {
    name: "단단한 생동",
    alt: "곧은 활기",
    tag: "또렷한 윤곽 위에 얹힌 오래된 활력",
    anchor: "손으로 만든 것 하나를 오늘 안에 완성하기",
    categories: cats(
      ["두꺼운 데님", "흙빛", "워크 재킷"],
      ["벽돌", "철제 선반", "거친 질감"],
      ["분명한 대답", "직접 말하기", "손 먼저 내밀기"],
      ["연장통", "무쇠팬", "가죽 가방"],
    ),
  },
  {
    name: "선명한 생동",
    alt: "또렷한 생기",
    tag: "선명하고 빠른, 지금의 생동",
    anchor: "가장 선명한 색의 옷을 꺼내 입기",
    categories: cats(
      ["선명한 색", "뚜렷한 대비", "각진 실루엣"],
      ["흰 벽에 포인트", "밝은 직광", "그래픽 포스터"],
      ["빠른 결론", "솔직한 의견", "눈 맞추기"],
      ["형광 마커", "러닝화", "큰 헤드폰"],
    ),
  },
];

export interface ExpressionOption {
  action: string;
  caption: string;
}

/** 무드 하나를 이번 주의 작은 표현 세 가지로 번역한다 */
export function buildExpressions(
  mood: Mood,
  moodName: string,
): ExpressionOption[] {
  return [
    {
      action: `${mood.anchor} — 이번 주 한 번`,
      caption: "겉모습을 다 바꾸지 않아도 돼요",
    },
    {
      action: `「${moodName}」에서 가장 멀어 보이는 물건 하나를 치우기`,
      caption: "더하기보다 덜어내기",
    },
    {
      action: "오늘의 나를 사진 한 장으로 남기기",
      caption: "무드는 기록될 때 선명해져요",
    },
  ];
}
