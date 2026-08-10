import { AXES } from './axes';
import type { Canon } from './canon';
import type { AxisCoord } from './engine';
import type { Profile } from './types';

/**
 * 나의 네 글자 — 여덟 축을 가로지르는 결(Canon)을 네 글자로 접은 것.
 *
 * 새로 만든 좌표가 아니다. `Canon`이 이미 네 갈래의 양극이므로, 여기서 하는 일은
 * **꺼내 보이는 것**뿐이다. 축마다의 이름이 8분면(세 극)에서 온다면,
 * 이 네 글자는 여정 전체(네 갈래)에서 온다 — 층위가 겹치지 않고 포개진다.
 *
 * 성격유형이 아니다. 지켜야 할 것 넷:
 *  1. **측정되지 않고 얻어진다.** 문항의 채점이 아니라 마흔 번의 선택이 남긴 잔여물이다.
 *     그래서 처음엔 흐릿하고(`settled === false`), 축을 지날 때마다 한 자리씩 또렷해진다.
 *  2. **날짜가 붙는다.** 영구 라벨이 아니라 그때의 나다 — 봉인은 연표(chronicle)로 간다.
 *  3. **가이드북으로 돌아간다.** 요약이지 대체가 아니다. 글자마다 어느 축에서 왔는지 펼쳐진다.
 *  4. **판정하지 않는다.** 아슬아슬했던 갈래는 아슬아슬했다고 적는다(`wobbly`).
 */

/** 갈래 하나의 양 끝 — 이름은 `Canon`의 주석과 같은 방향을 가리킨다 */
export interface CodePole {
  letter: string;
  /** 이 끝의 이름 */
  pole: string;
  /** 이 끝에 선 사람을 풀어 쓴 말 */
  reads: string;
}

export interface CodeAxis {
  key: keyof Canon;
  /** 갈래의 이름 — "머무름 ↔ 뻗어감" */
  title: string;
  minus: CodePole;
  plus: CodePole;
}

/**
 * 네 갈래의 글자.
 *
 * 글자는 처음 뜻의 머리글자에서 왔다: Quiet·Vivid, Soft·Keen, Rooted·Now,
 * Inward·Outward. 겹치는 알파벳이 없도록 골랐다 — 네 글자를 이어 붙였을 때
 * 어느 자리의 글자인지 순서를 몰라도 읽히도록.
 *
 * **글자는 고정이다.** 앞의 두 갈래는 이름을 실제로 재는 것에 맞게 고쳤지만
 * (고요함↔생동감 → 머무름↔뻗어감, 부드러움↔또렷함 → 흐름↔윤곽) 글자는 그대로
 * 둔다: 열쇠 문자열이 결 연표에 저장되어 있고 공유 링크(`/codes?me=`,
 * `/together?me=`)에도 실려 다니므로, 글자를 바꾸면 지난 판과 남이 보낸 링크가
 * 함께 깨진다. 사람이 읽는 것은 한국어 이름이고, 글자는 이제 자리표에 가깝다.
 */
export const CODE_AXES: [CodeAxis, CodeAxis, CodeAxis, CodeAxis] = [
  {
    key: 'reach',
    title: '머무름 ↔ 뻗어감',
    minus: { letter: 'Q', pole: '머무름', reads: '한자리에 머물며 채워지는' },
    // '밖으로'는 넷째 갈래(I/O)의 말이다 — 한 문장에 둘이 겹치지 않도록 '넓게'로 연다
    plus: { letter: 'V', pole: '뻗어감', reads: '넓게 뻗으며 채워지는' },
  },
  {
    key: 'form',
    title: '흐름 ↔ 윤곽',
    minus: { letter: 'S', pole: '흐름', reads: '흐름에 맡기며 부드러워지는' },
    plus: { letter: 'K', pole: '윤곽', reads: '윤곽을 먼저 세우는' },
  },
  {
    key: 'modern',
    title: '오래된 것 ↔ 지금의 것',
    minus: { letter: 'R', pole: '오래된 것', reads: '쌓인 것에 마음이 가는' },
    plus: { letter: 'N', pole: '지금의 것', reads: '새로 열리는 것에 마음이 가는' },
  },
  {
    key: 'outward',
    title: '안으로 ↔ 밖으로',
    minus: { letter: 'I', pole: '안으로', reads: '안에서 정리하는' },
    plus: { letter: 'O', pole: '밖으로', reads: '밖으로 꺼내며 정리하는' },
  },
];

/**
 * 갈래마다의 한가운데 — 축 하나 몫.
 *
 * 각인(imprint)은 0을 가운데 두고 흩어져 있지 않다. 네 갈래 모두 양(+)으로 치우쳐
 * 있는 데다, 앞 축의 결이 뒤 축을 같은 방향으로 기울이므로(`project`) 걸을수록 쏠림이
 * 커진다. 각인을 그대로 더해 부호만 읽으면 열여섯 자리 중 하나가 절반을 먹는다.
 *
 * 그래서 기준을 0이 아니라 **실제로 걸어서 닿는 값들의 한가운데**로 옮긴다. 네 글자가
 * 재는 것은 절대량이 아니라 "여기까지 걸어온 사람들 사이에서 어느 쪽인가"이므로,
 * 이쪽이 원래 맞는 셈법이기도 하다.
 *
 * 표를 평균한 값이 아니라 **측정값**이다: 여덟 축을 무작위로 걸은 4000판에서
 * 걸음 수별 `median(acc)/n`을 재고, 여섯~여덟 축 구간(코드를 가장 많이 읽는 자리)에
 * 맞췄다. 축 데이터를 크게 손보면 다시 재야 한다 — 그 관문이 code.test.ts의 분포
 * 테스트다(글자마다 35~65%, 한 자리가 4분의 1을 넘지 않기).
 */
export const CENTER: Canon = {
  reach: 0.25,
  form: 0.35,
  modern: 0.14,
  outward: 0.27,
};

/**
 * 한가운데를 뺀 누적 결 — 네 글자가 읽는 유일한 입력.
 * 축을 지날 때마다 한가운데도 한 축만큼 함께 움직인다.
 */
export function codeCanon(profile: Profile): Canon {
  const walked = profile.results.filter((r) => r.done).length;
  return {
    reach: profile.acc.reach - CENTER.reach * walked,
    form: profile.acc.form - CENTER.form * walked,
    modern: profile.acc.modern - CENTER.modern * walked,
    outward: profile.acc.outward - CENTER.outward * walked,
  };
}

/**
 * 한 글자가 또렷해지는 문턱.
 *
 * 한가운데에서 이만큼 벗어나면 자리를 잡는다. 한 축을 걸어 자리를 잡는 글자는 평균
 * 반 자리쯤이고, 네 자리가 다 차려면 대개 여섯 축 넘게 걸어야 한다 — 같은 방향의
 * 축이 겹쳐야 벗어나는 크기이므로.
 *
 * 흐릿함은 연출이 아니라 사실이다: 아직 덜 확실하므로 덜 확실하게 보인다.
 */
export const SETTLE = 0.62;

/** 흐릿한 자리를 대신하는 표식 */
export const FAINT = '·';

export interface CodeLetter extends CodePole {
  key: keyof Canon;
  title: string;
  /** 누적된 결 — 부호가 곧 어느 끝인지 */
  value: number;
  /** 0(중앙) ~ 1(문턱에 닿음) */
  strength: number;
  /** 문턱을 넘어 또렷해졌는지 */
  settled: boolean;
  /** 반대편 끝 — 경계에서 좁힐 때 내미는 이웃 */
  other: CodePole;
}

export interface Code {
  letters: [CodeLetter, CodeLetter, CodeLetter, CodeLetter];
  /**
   * 걷는 중의 표시 — 아직 또렷하지 않은 자리는 `·`로 남는다.
   * 축을 지날 때마다 한 자리씩 채워지는 것이 이 문자열이다.
   */
  mark: string;
  /** 네 글자 전부 — 이름을 찾는 열쇠 (흐릿한 자리도 지금 기운 쪽으로 채운다) */
  key: string;
  name: string;
  summary: string;
  /** 여덟 축을 모두 걸어 확정됐는지 — 봉인되면 흐릿한 자리도 이름을 받는다 */
  sealed: boolean;
  /** 봉인 뒤에도 거의 반반이었던 갈래들 — 판정하지 않기 위해 남긴다 */
  wobbly: CodeLetter[];
  /** 또렷해진 글자 수 (0~4) */
  settledCount: number;
  /** 이 코드가 몇 개의 축에서 나왔는지 */
  walked: number;
}

/** 축이 몇 개인지 — 봉인의 조건 */
export const AXIS_COUNT = AXES.length;

export function buildCode(profile: Profile): Code {
  const walked = profile.results.filter((r) => r.done).length;
  const sealed = walked >= AXIS_COUNT;
  const centered = codeCanon(profile);

  const letters = CODE_AXES.map((axis): CodeLetter => {
    const value = centered[axis.key];
    const positive = value >= 0;
    const here = positive ? axis.plus : axis.minus;
    const other = positive ? axis.minus : axis.plus;
    const strength = Math.min(1, Math.abs(value) / SETTLE);
    return {
      ...here,
      key: axis.key,
      title: axis.title,
      value,
      strength,
      settled: strength >= 1,
      other,
    };
  }) as Code['letters'];

  const key = letters.map((l) => l.letter).join('');
  const named = CODE_NAMES[key];

  return {
    letters,
    // 봉인된 뒤에는 흐릿한 자리도 이름을 받는다 — 다만 아슬아슬했다고 함께 적는다
    mark: letters
      .map((l) => (l.settled || sealed ? l.letter : FAINT))
      .join(''),
    key,
    name: named.name,
    summary: named.summary,
    sealed,
    wobbly: letters.filter((l) => !l.settled),
    settledCount: letters.filter((l) => l.settled).length,
    walked,
  };
}

/**
 * 네 갈래를 축 막대와 같은 모양으로 — 근거를 눈에 보이게 한다.
 * 문턱(SETTLE)에 닿으면 4분의 3 지점, 그보다 멀어져도 끝을 넘지 않는다.
 */
export function codeCoords(code: Code): AxisCoord[] {
  return code.letters.map((letter, i) => {
    const axis = CODE_AXES[i];
    const pos = 0.5 + letter.value / (SETTLE * 4);
    return {
      left: axis.minus.pole,
      right: axis.plus.pole,
      pos: Math.min(1, Math.max(0, pos)),
    };
  });
}

/** 한 갈래를 뒤집은 이웃 코드의 열쇠 — 16의 지도에서 옆칸을 찾는 데 쓴다 */
export function flipCode(key: string, index: number): string {
  const axis = CODE_AXES[index];
  const letters = key.split('');
  letters[index] =
    letters[index] === axis.plus.letter ? axis.minus.letter : axis.plus.letter;
  return letters.join('');
}

/** 열쇠에서 각 갈래의 부호를 읽는다 (+1 / −1) — 겹쳐보기가 쓴다 */
export function codeSigns(key: string): number[] {
  return CODE_AXES.map((axis, i) => (key[i] === axis.plus.letter ? 1 : -1));
}

/** 네 글자로 읽힐 수 있는 열쇠인지 */
export function isCodeKey(raw: string | null | undefined): raw is string {
  if (!raw || raw.length !== CODE_AXES.length) return false;
  return CODE_AXES.every(
    (axis, i) => raw[i] === axis.plus.letter || raw[i] === axis.minus.letter,
  );
}

/** 열쇠에 담긴 네 극의 이름 */
export function codePoles(key: string): CodePole[] {
  return CODE_AXES.map((axis, i) =>
    key[i] === axis.plus.letter ? axis.plus : axis.minus,
  );
}

/** 열쇠 하나가 가리키는 이름 */
export const codeName = (key: string) => CODE_NAMES[key];

/** 열여섯 자리 전부 — 16의 지도가 순서대로 훑는다 */
export const CODE_KEYS: string[] = (() => {
  const keys: string[] = [];
  for (const a of [CODE_AXES[0].minus, CODE_AXES[0].plus])
    for (const b of [CODE_AXES[1].minus, CODE_AXES[1].plus])
      for (const c of [CODE_AXES[2].minus, CODE_AXES[2].plus])
        for (const d of [CODE_AXES[3].minus, CODE_AXES[3].plus])
          keys.push(a.letter + b.letter + c.letter + d.letter);
  return keys;
})();

export interface CodeName {
  name: string;
  /** 이름은 혼자 놓이지 않는다 — 뜻은 언제나 쉬운 한 줄이 전한다 */
  summary: string;
}

/**
 * 열여섯 자리의 이름.
 *
 * 이름은 전부 **자리(장소)** 다. 사람을 유형으로 부르면 판정이 되지만,
 * 자리로 부르면 "당신이 잘 지내는 곳"이 된다 — 같은 사람이 계절마다 다른 자리에
 * 있어도 이상하지 않은 이름. 연표가 성립하는 이유이기도 하다.
 */
export const CODE_NAMES: Record<string, CodeName> = {
  QSRI: {
    name: '오래된 서재',
    summary: '익숙한 것 곁에서 천천히 채워지는 사람',
  },
  QSRO: {
    name: '해질녘 툇마루',
    summary: '조용히, 그러나 곁을 내주며 지내는 사람',
  },
  QSNI: {
    name: '밤의 작업실',
    summary: '새로운 것을 혼자 조용히 만져보는 사람',
  },
  QSNO: {
    name: '이른 아침의 카페',
    summary: '지금의 것을 부드럽게 나누는 사람',
  },
  QKRI: {
    name: '필사하는 책상',
    summary: '스스로 세운 규칙을 조용히 지키는 사람',
  },
  QKRO: {
    name: '오래된 등대',
    summary: '말수는 적지만 기준이 되어주는 사람',
  },
  QKNI: {
    name: '새벽의 설계실',
    summary: '앞을 조용히 계산해두는 사람',
  },
  QKNO: {
    name: '유리 진열장',
    summary: '군더더기 없이 지금을 보여주는 사람',
  },
  VSRI: {
    name: '손때 묻은 공방',
    summary: '좋아하는 것을 오래 즐겁게 만지는 사람',
  },
  VSRO: {
    name: '동네 골목시장',
    summary: '익숙한 사이를 흥으로 데우는 사람',
  },
  VSNI: {
    name: '한밤의 플레이리스트',
    summary: '새것을 잔뜩 모아 혼자 즐기는 사람',
  },
  VSNO: {
    name: '봄의 옥상',
    summary: '지금 재미있는 걸 곧장 나누는 사람',
  },
  VKRI: {
    name: '연습실의 메트로놈',
    summary: '좋아하는 것을 끝까지 파고드는 사람',
  },
  VKRO: {
    name: '무대 위의 밴드',
    summary: '오래 벼려온 것을 꺼내 보이는 사람',
  },
  VKNI: {
    name: '한밤의 실험실',
    summary: '새로운 걸 혼자 끝까지 시험해보는 사람',
  },
  VKNO: {
    name: '광장의 신호등',
    summary: '지금 필요한 걸 먼저 말하는 사람',
  },
};
