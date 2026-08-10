/**
 * 당김(pull) — 결과가 **무엇을 얻으려 무엇을 내주는지**를 적는 네 갈래.
 *
 * `Canon`과 층위가 다르다. Canon은 표현의 결이라 더할수록 두꺼워지고, 반대끼리
 * 만나면 상쇄되어 가운데로 간다 — 여덟 축을 하나의 인상으로 접기 위한 좌표다.
 * 그런데 자기이해의 깊이는 대개 **상쇄되지 않는 곳**에서 온다. 자유를 동경하면서
 * 안정된 하루를 지은 사람은 '중간쯤인 사람'이 아니라 두 마음을 함께 지고 사는
 * 사람이고, 그 사실이야말로 그 사람에 대해 가장 할 말이 많은 자리다.
 *
 * 그래서 당김은 **더하지 않는다.** 축마다 따로 서 있다가, 서로 반대쪽으로
 * 당기고 있으면 그것을 긴장(§tension)으로 꺼낸다. Canon이 "어떤 인상인가"를
 * 답한다면 당김은 "무엇과 무엇 사이에 서 있는가"를 답한다.
 *
 * 네 갈래는 모두 **진짜 트레이드오프**다 — 둘 다 가질 수 있는 것은 여기 적지 않는다.
 * 둘 다 가질 수 있으면 긴장이 생기지 않고, 긴장이 없으면 할 말도 없기 때문이다.
 */

/** 갈래의 키 — 이름은 언제나 양(+)의 방향을 가리킨다 */
export type PullKey = 'open' | 'mine' | 'now' | 'wide';

/**
 * 결과 하나가 지고 있는 당김. **비워둘 수 있다** — 아니, 대개 비워둔다.
 * 결과마다 네 갈래를 다 채우면 모든 축이 모든 갈래에서 조금씩 당기게 되고,
 * 그러면 긴장이 아무 데서나 나와 아무 뜻도 없어진다. 또렷한 하나둘만 적는다.
 */
export type Pull = Partial<Record<PullKey, number>>;

export const PULL_KEYS: PullKey[] = ['open', 'mine', 'now', 'wide'];

export interface PullPole {
  /** 이 끝의 이름 */
  pole: string;
  /** 이 끝에 선 결과를 풀어 쓴 말 — '쪽'으로 닫아 이름 뒤에 그대로 붙는다 */
  reads: string;
}

export interface PullAxis {
  key: PullKey;
  /** 갈래의 이름 — "안정 ↔ 자유" */
  title: string;
  minus: PullPole;
  plus: PullPole;
  /**
   * 이 갈래가 당길 때 곁들이는 관찰.
   *
   * **어느 쪽이 옳다고 말하지 않는다**(불변식 #3). 대신 양쪽 모두의 값을 적는다 —
   * 트레이드오프를 트레이드오프라고 말해주는 것까지가 거울의 일이고,
   * 어느 쪽으로 가라고 말하는 순간 거울이 아니라 처방이 된다.
   */
  note: string;
}

/**
 * 네 갈래.
 *
 * Schwartz의 가치 원형이 그렇듯, 값진 것들은 원 위에서 마주 본다 —
 * 열림과 지킴, 나와 우리. 그 구조만 빌리고 문항과 채점은 빌리지 않았다:
 * 이 앱은 사람을 재는 곳이 아니라 사람이 스스로 이름 붙이는 곳이므로.
 */
export const PULL_AXES: [PullAxis, PullAxis, PullAxis, PullAxis] = [
  {
    key: 'open',
    title: '안정 ↔ 자유',
    minus: { pole: '안정', reads: '딛고 설 자리를 지키는 쪽' },
    plus: { pole: '자유', reads: '가능성을 열어두는 쪽' },
    note: '지킬수록 갈 수 있는 데가 줄고, 열어둘수록 딛을 데가 줄어요.',
  },
  {
    key: 'mine',
    title: '곁 ↔ 나',
    minus: { pole: '곁', reads: '곁의 사람을 먼저 두는 쪽' },
    plus: { pole: '나', reads: '내 몫을 먼저 세우는 쪽' },
    note: '곁을 먼저 두면 내 몫이 자꾸 뒤로 밀리고, 내 몫을 먼저 세우면 곁이 서운해져요.',
  },
  {
    key: 'now',
    title: '나중 ↔ 오늘',
    minus: { pole: '나중', reads: '나중을 위해 오늘을 아끼는 쪽' },
    plus: { pole: '오늘', reads: '오늘의 좋음을 먼저 챙기는 쪽' },
    note: '아껴둔 오늘은 돌려받지 못하고, 다 쓴 오늘은 쌓이지 않아요.',
  },
  {
    key: 'wide',
    title: '깊이 ↔ 넓이',
    minus: { pole: '깊이', reads: '하나를 끝까지 파는 쪽' },
    plus: { pole: '넓이', reads: '여러 갈래를 열어두는 쪽' },
    note: '깊어지려면 다른 갈래를 닫아야 하고, 넓히려면 어느 하나도 끝까지 가기 어려워요.',
  },
];

export const pullAxis = (key: PullKey): PullAxis =>
  PULL_AXES.find((a) => a.key === key) as PullAxis;

/** 적지 않은 갈래는 당기지 않는다 — 0이다 */
export const pullAt = (pull: Pull | undefined, key: PullKey): number =>
  pull?.[key] ?? 0;

/** 당김을 짧게 적는다 — 데이터 파일이 숫자 벽이 되지 않도록 */
export const pull = (p: Pull): Pull => p;

/** 여럿에게 같은 당김을 매긴다 — 이름으로 흩어져 있는 것을 갈래로 묶을 때 */
export const pullsOf = (names: string[], p: Pull): Record<string, Pull> =>
  Object.fromEntries(names.map((n) => [n, p]));

/** 임시 확정('아직 잘 모르겠어요')은 절반만 당긴다 — 각인과 같은 셈법 */
export const scalePull = (p: Pull, k: number): Pull =>
  Object.fromEntries(
    Object.entries(p).map(([key, value]) => [key, value * k]),
  ) as Pull;
