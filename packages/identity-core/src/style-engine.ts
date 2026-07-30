import {
  buildExpressions,
  DISTANCE,
  LIGHT,
  MOODS,
  SCENE,
} from './style-data';
import type {
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
 * 다른 점은 묻는 방식이다. Identity가 "왜?"를 네 번 파고든다면,
 * Style은 감각을 네 번 묻고 그 좌표가 무드로 수렴하게 둔다 (불변식: Identity → Style).
 *
 * 시퀀스 단계 (고정 6단계):
 *   0 장면(0-3) · 1 질감(0-2) · 2 빛(0-2|9=넘어감)
 *   3 거리(0-2|9=넘어감) · 4 명명(0-2) · 5 표현(0-2)
 */
export const STYLE_STEPS = 6;

export interface StyleState {
  stepIndex: number;
  scene: SceneOption | null;
  texture: TextureOption | null;
  light: LightOption | null;      // null = 아직 or 넘어감
  lightSkipped: boolean;
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
    light: null, lightSkipped: false, distance: null, distanceSkipped: false,
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
 * 좌표를 0~1로 접는 폭. 네 걸음의 delta 합은 이론상 ±3을 넘지 않는다.
 * 넘어간 질문은 0을 더한다 — 건너뜀은 중앙으로 남는다(모르겠다는 답도 답이다).
 */
const AXIS_SPREAD = 3;

/** 지금까지의 선택이 만든 무드 좌표 — 화면의 축 막대이자 무드 판정의 입력 */
export function styleAxes(state: StyleState): StyleAxis[] {
  const shifts: MoodShift[] = [
    state.scene?.shift,
    state.texture?.shift,
    state.light?.shift,
    state.distance?.shift,
  ].filter((s): s is MoodShift => Boolean(s));

  return AXIS_LABELS.map(([key, left, right]) => {
    const sum = shifts.reduce((acc, s) => acc + s[key], 0);
    const pos = (sum / AXIS_SPREAD + 1) / 2;
    return { left, right, pos: Math.min(1, Math.max(0, pos)) };
  });
}

/**
 * 좌표가 가리키는 무드. 축마다 절반으로 갈라 8분면 중 하나를 고른다 —
 * 비트 순서가 MOODS의 배열 순서와 같다.
 */
export function resolveMood(state: StyleState): Mood {
  const index = styleAxes(state).reduce(
    (acc, axis) => acc * 2 + (axis.pos < 0.5 ? 0 : 1),
    0,
  );
  return MOODS[index];
}

/* ── 리플레이 ── */

function applyStyleChoice(state: StyleState, choice: number): StyleState | null {
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
      if (choice === SKIP) next.distanceSkipped = true;
      else if (DISTANCE[choice]) next.distance = DISTANCE[choice];
      else return null;
      break;
    case 4: {
      if (!state.scene || !state.texture || choice < 0 || choice > 2) return null;
      const mood = resolveMood(state);
      next.mood = mood;
      next.moodName = choice === 1 ? mood.alt : mood.name;
      next.tentative = choice === 2;
      break;
    }
    case 5: {
      if (!state.mood || !state.moodName) return null;
      const expressions = buildExpressions(state.mood, state.moodName);
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

export function replayStyle(seq: number[]): StyleReplayOutcome {
  let state = initialStyleState();
  let applied = 0;
  for (const choice of seq) {
    if (state.stepIndex >= STYLE_STEPS) break;
    const next = applyStyleChoice(state, choice);
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
        options: LIGHT.map((l, i) => ({ emoji: l.emoji, title: l.title, choice: i })),
        skippable: true,
        skipLabel: '잘 모르겠어요 — 넘어갈래요',
      };
    case 3:
      return {
        kind: 'choice',
        title: '사람들 사이에서\n어떻게 보이고 싶나요?',
        sub: '누구에게 잘 보이려는 게 아니라, 내가 편한 쪽으로.',
        options: DISTANCE.map((d, i) => ({ title: d.title, sub: d.sub, choice: i })),
        skippable: true,
        skipLabel: '아직 모르겠어요 — 넘어갈래요',
      };
    case 4: {
      const mood = resolveMood(state);
      return {
        kind: 'naming',
        title: '',
        coachLines: [
          value ? `「${value}」${eul(value)} 아는 사람의 공기라면,` : '고른 것들을 모아보니,',
          `「${mood.name}」에 가까울 것 같아요.`,
          '맞나요?',
        ],
        options: [
          { title: `맞아요 — 「${mood.name}」${ieyo(mood.name)}`, choice: 0 },
          { title: `비슷하지만, 「${mood.alt}」에 더 가까워요`, choice: 1 },
          { title: '아직 잘 모르겠어요 — 일단 이 이름으로 둘게요', choice: 2 },
        ],
        skippable: false,
      };
    }
    case 5: {
      if (!state.mood || !state.moodName) return null;
      return {
        kind: 'expression',
        title: '무드를 하루 속의\n작은 표현 하나로',
        sub: '겉모습을 다 바꾸지 않아도 돼요. 이번 주에 딱 하나만.',
        options: buildExpressions(state.mood, state.moodName).map((e, i) => ({
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

/** 지금까지의 발견 조각 — Identity의 조각과 같은 자리에 쌓인다 */
export function styleInsights(state: StyleState): string[] {
  const chips: string[] = [];
  if (state.scene) chips.push(`장면 — ${state.scene.label}`);
  if (state.texture) chips.push(`질감 — ${state.texture.label}`);
  if (state.light) chips.push(`빛 — ${state.light.label}`);
  if (state.distance) chips.push(`거리 — ${state.distance.label}`);
  if (state.moodName) chips.push(`무드 — 「${state.moodName}」`);
  return chips;
}

/**
 * 가이드북 Style 섹션의 한 줄.
 * 아직 확정 전이면 빈 문자열 — 호출부가 "열림" 상태를 그대로 쓰게 둔다.
 */
export function buildStyleNote(state: StyleState): string {
  if (!state.mood || !state.moodName) return '';
  return `「${state.moodName}」 — ${state.mood.tag}`;
}
