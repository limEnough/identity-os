import {
  buildExpressions,
  COLOR,
  DISTANCE,
  LIGHT,
  MOODS,
  SCENE,
  VALUE_LEAN,
} from './style-data';
import type {
  ColorOption,
  DistanceOption,
  ExpressionOption,
  LightOption,
  Mood,
  MoodShift,
  SceneOption,
  TextureOption,
} from './style-data';
import type { StepOption } from './engine';
import { SKIP } from './engine';
import { eul, iga, ieyo } from './josa';

/**
 * Style 무드 체인 — Identity Why 체인과 같은 원칙으로 동작한다:
 * 원본 상태는 응답 시퀀스뿐이고, 모든 화면 상태는 결정론적 리플레이로 파생된다.
 *
 * 다른 점은 묻는 방식이다. Identity가 "왜?"를 파고든다면,
 * Style은 감각을 다섯 번 묻고 그 좌표가 무드로 수렴하게 둔다 (불변식: Identity → Style).
 *
 * 그래서 이 축의 리플레이는 Identity의 가치를 함께 받는다. 가치는 좌표의 출발점을
 * 기울이고(VALUE_LEAN), 질문의 말끝과 코치의 발화를 그 사람의 언어로 맞춘다.
 * 발자국만으로는 무드가 정해지지 않는다 — 잎은 뿌리 없이 자라지 않으므로.
 *
 * 시퀀스 단계 (고정 7단계):
 *   0 장면(0-5) · 1 질감(0-3) · 2 빛(0-4|9=넘어감) · 3 색(0-5|9=넘어감)
 *   4 거리(0-4|9=넘어감) · 5 명명(0-3) · 6 표현(0-4)
 */
export const STYLE_STEPS = 7;

export interface StyleState {
  stepIndex: number;
  scene: SceneOption | null;
  texture: TextureOption | null;
  light: LightOption | null;      // null = 아직 or 넘어감
  lightSkipped: boolean;
  color: ColorOption | null;      // null = 아직 or 넘어감
  colorSkipped: boolean;
  distance: DistanceOption | null;
  distanceSkipped: boolean;
  /** 명명 단계에서 확정된 무드 */
  mood: Mood | null;
  /** 확정된 이름 — mood.name 또는 mood.alt */
  moodName: string | null;
  /** "아직 잘 모르겠어요"로 임시 확정했는지 */
  tentative: boolean;
  expression: ExpressionOption | null;
}

export interface StyleReplayOutcome {
  state: StyleState;
  done: boolean;
  valid: boolean;
  applied: number;
}

function initialStyleState(): StyleState {
  return {
    stepIndex: 0, scene: null, texture: null,
    light: null, lightSkipped: false, color: null, colorSkipped: false,
    distance: null, distanceSkipped: false,
    mood: null, moodName: null, tentative: false, expression: null,
  };
}

/* ── 무드 좌표 ── */

export interface StyleAxis {
  /** 음(−) 방향의 이름 — 막대의 왼쪽 끝 */
  left: string;
  /** 양(+) 방향의 이름 — 막대의 오른쪽 끝 */
  right: string;
  /** 0(완전히 왼쪽) ~ 1(완전히 오른쪽) */
  pos: number;
}

const AXIS_LABELS: Array<[keyof MoodShift, string, string]> = [
  ['vivid', '고요함', '생동감'],
  ['sharp', '부드러움', '또렷함'],
  ['modern', '오래된 것', '지금의 것'],
];

/**
 * 좌표를 0~1로 접는 폭. 다섯 걸음의 delta에 가치의 기울기가 하나 더 얹힌다.
 * 넘어간 질문은 0을 더한다 — 건너뜀은 중앙으로 남는다(모르겠다는 답도 답이다).
 */
const AXIS_SPREAD = 4;

/**
 * 지금까지의 선택이 만든 무드 좌표 — 화면의 축 막대이자 무드 판정의 입력.
 *
 * @param value Identity에서 확정된 가치. 좌표의 출발점을 기울인다 —
 *              한 걸음의 절반 아래 크기라, 감각의 선택이 언제든 되돌릴 수 있다.
 */
export function styleAxes(state: StyleState, value = ''): StyleAxis[] {
  const shifts: MoodShift[] = [
    VALUE_LEAN[value],
    state.scene?.shift,
    state.texture?.shift,
    state.light?.shift,
    state.color?.shift,
    state.distance?.shift,
  ].filter((s): s is MoodShift => Boolean(s));

  return AXIS_LABELS.map(([key, left, right]) => {
    const sum = shifts.reduce((acc, s) => acc + s[key], 0);
    const pos = (sum / AXIS_SPREAD + 1) / 2;
    return { left, right, pos: Math.min(1, Math.max(0, pos)) };
  });
}

/** 축마다 절반으로 갈라 얻은 8분면 — 비트 순서가 MOODS의 배열 순서와 같다 */
const octantOf = (axes: StyleAxis[]): number =>
  axes.reduce((acc, axis) => acc * 2 + (axis.pos < 0.5 ? 0 : 1), 0);

/** 좌표가 가리키는 무드 */
export function resolveMood(state: StyleState, value = ''): Mood {
  return MOODS[octantOf(styleAxes(state, value))];
}

/**
 * 가장 아슬아슬했던 축 하나를 뒤집은 이웃 무드.
 *
 * 8분면은 경계에서 갈린다 — 0.49와 0.51은 다른 이름을 받지만 거의 같은 사람이다.
 * 그래서 명명 화면은 제안 하나로 닫지 않고, 그 경계 너머의 이름도 함께 내민다.
 */
export function neighborMood(state: StyleState, value = ''): Mood {
  const axes = styleAxes(state, value);
  const bits: number[] = axes.map((axis) => (axis.pos < 0.5 ? 0 : 1));
  const nearest = axes.reduce(
    (best, axis, i) =>
      Math.abs(axis.pos - 0.5) < Math.abs(axes[best].pos - 0.5) ? i : best,
    0,
  );
  bits[nearest] = bits[nearest] === 1 ? 0 : 1;
  return MOODS[bits.reduce((acc, bit) => acc * 2 + bit, 0)];
}

/** 가장 크게 기운 축의 이름 — 같은 무드 안에서도 어느 쪽으로 쏠렸는지 */
function dominantTilt(axes: StyleAxis[]): string {
  const axis = axes.reduce((a, b) =>
    Math.abs(b.pos - 0.5) > Math.abs(a.pos - 0.5) ? b : a,
  );
  return axis.pos >= 0.5 ? axis.right : axis.left;
}

/* ── 리플레이 ── */

/** 명명 단계가 내미는 이름들 — 제안 · 같은 무드의 다른 결 · 경계 너머의 이웃 */
function moodCandidates(
  state: StyleState,
  value: string,
): Array<{ mood: Mood; name: string }> {
  const mood = resolveMood(state, value);
  const neighbor = neighborMood(state, value);
  return [
    { mood, name: mood.name },
    { mood, name: mood.alt },
    { mood: neighbor, name: neighbor.name },
  ];
}

function applyStyleChoice(
  state: StyleState,
  choice: number,
  value: string,
): StyleState | null {
  const next: StyleState = { ...state };
  switch (state.stepIndex) {
    case 0:
      if (!SCENE[choice]) return null;
      next.scene = SCENE[choice];
      break;
    case 1:
      if (!state.scene?.textures[choice]) return null;
      next.texture = state.scene.textures[choice];
      break;
    case 2:
      if (choice === SKIP) next.lightSkipped = true;
      else if (LIGHT[choice]) next.light = LIGHT[choice];
      else return null;
      break;
    case 3:
      if (choice === SKIP) next.colorSkipped = true;
      else if (COLOR[choice]) next.color = COLOR[choice];
      else return null;
      break;
    case 4:
      if (choice === SKIP) next.distanceSkipped = true;
      else if (DISTANCE[choice]) next.distance = DISTANCE[choice];
      else return null;
      break;
    case 5: {
      if (!state.scene || !state.texture) return null;
      const candidates = moodCandidates(state, value);
      // 마지막 선택지는 "아직 잘 모르겠어요" — 이름은 제안대로 두되 임시로 표시한다
      const picked =
        choice === candidates.length ? candidates[0] : candidates[choice];
      if (!picked) return null;
      next.mood = picked.mood;
      next.moodName = picked.name;
      next.tentative = choice === candidates.length;
      break;
    }
    case 6: {
      if (!state.mood || !state.moodName) return null;
      const expressions = buildExpressions(state.mood, state.moodName, value);
      if (!expressions[choice]) return null;
      next.expression = expressions[choice];
      break;
    }
    default:
      return null;
  }
  next.stepIndex = state.stepIndex + 1;
  return next;
}

/**
 * @param value Identity에서 확정된 가치 — 좌표의 기울기와 표현 카드에 함께 실린다.
 *              (Style은 Identity 없이 열리지 않으므로 실제로는 언제나 채워져 온다)
 */
export function replayStyle(seq: number[], value = ''): StyleReplayOutcome {
  let state = initialStyleState();
  let applied = 0;
  for (const choice of seq) {
    if (state.stepIndex >= STYLE_STEPS) break;
    const next = applyStyleChoice(state, choice, value);
    if (!next) return { state, done: false, valid: false, applied };
    state = next;
    applied += 1;
  }
  return { state, done: state.stepIndex >= STYLE_STEPS, valid: true, applied };
}

/* ── UI가 소비하는 단계 기술자 ── */

export interface StyleStep {
  kind: 'choice' | 'naming' | 'expression';
  title: string;
  sub?: string;
  /** 명명 단계: 오브 코치의 발화 (단정이 아니라 제안) */
  coachLines?: string[];
  options: StepOption[];
  /** "넘어갈래요" 허용 여부 — 자기 탐색은 자발적일 때만 유효하다 */
  skippable: boolean;
  skipLabel?: string;
}

/**
 * @param value Identity에서 확정된 핵심 가치. 질문의 말끝을 그 사람의 언어로 맞춘다.
 *              (Style은 Identity 없이 열리지 않으므로 실제로는 언제나 채워져 온다)
 */
export function currentStyleStep(state: StyleState, value = ''): StyleStep | null {
  switch (state.stepIndex) {
    case 0:
      return {
        kind: 'choice',
        title: value
          ? `「${value}」${iga(value)}\n가장 잘 드러나는 장면은?`
          : '가장 나다운 장면은\n어디인가요?',
        sub: '고르는 건 취향이 아니라 공기예요. 먼저 마음이 가는 쪽으로.',
        options: SCENE.map((s, i) => ({ emoji: s.emoji, title: s.title, sub: s.sub, choice: i })),
        skippable: false,
      };
    case 1:
      return {
        kind: 'choice',
        title: '그 장면에서\n손에 먼저 닿는 것은?',
        sub: '몸이 기억하는 감각을 찾는 중이에요.',
        options: (state.scene?.textures ?? []).map((t, i) => ({ title: t.title, choice: i })),
        skippable: false,
      };
    case 2:
      return {
        kind: 'choice',
        title: '그 장면의 빛은\n어떤가요?',
        sub: '빛은 그 자리의 공기를 정해요.',
        options: LIGHT.map((l, i) => ({ emoji: l.emoji, title: l.title, choice: i })),
        skippable: true,
        skipLabel: '잘 모르겠어요 — 넘어갈래요',
      };
    case 3:
      return {
        kind: 'choice',
        title: '그 장면에 색을\n하나만 놓는다면?',
        sub: '어울리는 색이 아니라, 먼저 손이 가는 색으로.',
        options: COLOR.map((c, i) => ({ emoji: c.emoji, title: c.title, choice: i })),
        skippable: true,
        skipLabel: '색은 잘 모르겠어요 — 넘어갈래요',
      };
    case 4:
      return {
        kind: 'choice',
        title: '사람들 사이에서\n어떻게 보이고 싶나요?',
        sub: '누구에게 잘 보이려는 게 아니라, 내가 편한 쪽으로.',
        options: DISTANCE.map((d, i) => ({ title: d.title, sub: d.sub, choice: i })),
        skippable: true,
        skipLabel: '아직 모르겠어요 — 넘어갈래요',
      };
    case 5: {
      const [proposed, other, neighbor] = moodCandidates(state, value);
      const tilt = dominantTilt(styleAxes(state, value));
      return {
        kind: 'naming',
        title: '',
        coachLines: [
          value ? `「${value}」${eul(value)} 아는 사람의 공기라면,` : '고른 것들을 모아보니,',
          `「${proposed.name}」에 가까울 것 같아요.`,
          `그중에서도 ${tilt} 쪽으로 기울어 있고요.`,
          '맞나요?',
        ],
        options: [
          { title: `맞아요 — 「${proposed.name}」${ieyo(proposed.name)}`, choice: 0 },
          { title: `비슷하지만, 「${other.name}」에 더 가까워요`, choice: 1 },
          { title: `조금 다른 쪽이에요 — 「${neighbor.name}」`, choice: 2 },
          { title: '아직 잘 모르겠어요 — 일단 이 이름으로 둘게요', choice: 3 },
        ],
        skippable: false,
      };
    }
    case 6: {
      if (!state.mood || !state.moodName) return null;
      return {
        kind: 'expression',
        title: '무드를 하루 속의\n작은 표현 하나로',
        sub: '겉모습을 다 바꾸지 않아도 돼요. 이번 주에 딱 하나만.',
        options: buildExpressions(state.mood, state.moodName, value).map((e, i) => ({
          title: e.action,
          sub: e.caption,
          choice: i,
        })),
        skippable: false,
      };
    }
    default:
      return null;
  }
}

/**
 * 지금까지의 발견 조각 — Identity의 조각과 같은 자리에 쌓인다.
 * 첫 조각은 이 축의 것이 아니라 뿌리에서 가져온다 — 무엇 위에서 고르고 있는지 잊지 않도록.
 */
export function styleInsights(state: StyleState, value = ''): string[] {
  const chips: string[] = [];
  if (value) chips.push(`뿌리 — 「${value}」`);
  if (state.scene) chips.push(`장면 — ${state.scene.label}`);
  if (state.texture) chips.push(`질감 — ${state.texture.label}`);
  if (state.light) chips.push(`빛 — ${state.light.label}`);
  if (state.color) chips.push(`색 — ${state.color.label}`);
  if (state.distance) chips.push(`거리 — ${state.distance.label}`);
  if (state.moodName) chips.push(`무드 — 「${state.moodName}」`);
  return chips;
}

/**
 * 가이드북 Style 섹션의 한 줄.
 * 아직 확정 전이면 빈 문자열 — 호출부가 "열림" 상태를 그대로 쓰게 둔다.
 */
export function buildStyleNote(state: StyleState, value = ''): string {
  if (!state.mood || !state.moodName) return '';
  const tilt = dominantTilt(styleAxes(state, value));
  return `「${state.moodName}」 — ${state.mood.tag} · ${tilt} 쪽으로`;
}
