import { buildPractices, DIRECTION, ENVY, ORIGIN, WHY } from "./data";
import type {
  EnvyAspect,
  EnvyType,
  MomentOption,
  OriginOption,
  PracticeContext,
  PracticeOption,
  WhyOption,
} from "./data";
import { eul, ieyo } from "./josa";

/**
 * Identity Why 체인 — 취향 여정(추구미 갈림길)과 같은 원칙으로 동작한다:
 * 원본 상태는 응답 시퀀스뿐이고, 모든 화면 상태는 결정론적 리플레이로 파생된다.
 *
 * 넓게 물어 좁게 닫는다: 앞의 걸음일수록 갈래가 많고, 뒤로 갈수록
 * 고르는 것이 구체해진다 — 유형에서 시작해 이번 주의 행동 하나로 끝난다.
 *
 * 시퀀스 단계 (고정 7단계):
 *   0 동경 유형(0-5) · 1 부러움 포인트(0-3) · 2 순간(0-3|9=넘어감)
 *   3 이유(0-5|9=넘어감) · 4 근원(0-5|9=넘어감) · 5 명명(0-3) · 6 실천(0-4)
 */
export const SKIP = 9;
export const IDENTITY_STEPS = 7;

export interface IdentityState {
  stepIndex: number;
  envy: EnvyType | null;
  aspect: EnvyAspect | null;
  moment: MomentOption | null; // null = 아직 or 넘어감
  momentSkipped: boolean;
  why: WhyOption | null; // null = 아직 or 넘어감
  whySkipped: boolean;
  origin: OriginOption | null;
  originSkipped: boolean;
  /** 명명 단계에서 확정된 가치 */
  value: string | null;
  /** "아직 잘 모르겠어요"로 임시 확정했는지 */
  tentative: boolean;
  practice: PracticeOption | null;
}

export interface IdentityReplayOutcome {
  state: IdentityState;
  done: boolean;
  valid: boolean;
  applied: number;
}

function initialIdentityState(): IdentityState {
  return {
    stepIndex: 0,
    envy: null,
    aspect: null,
    moment: null,
    momentSkipped: false,
    why: null,
    whySkipped: false,
    origin: null,
    originSkipped: false,
    value: null,
    tentative: false,
    practice: null,
  };
}

/** 명명 단계가 고르는 이름들 — 코치의 제안 하나와 결이 다른 대안 둘 */
function nameCandidates(aspect: EnvyAspect): string[] {
  return [aspect.value, ...aspect.alts];
}

/** 실천 카드를 이 사람의 여정에 붙이는 재료 */
function practiceContext(state: IdentityState): PracticeContext {
  return {
    envy: state.envy?.short,
    moment: state.moment?.phrase,
  };
}

function applyIdentityChoice(
  state: IdentityState,
  choice: number,
): IdentityState | null {
  const next: IdentityState = { ...state };
  switch (state.stepIndex) {
    case 0:
      if (!ENVY[choice]) return null;
      next.envy = ENVY[choice];
      break;
    case 1:
      if (!state.envy?.aspects[choice]) return null;
      next.aspect = state.envy.aspects[choice];
      break;
    case 2:
      if (choice === SKIP) next.momentSkipped = true;
      else if (state.envy?.moments[choice]) next.moment = state.envy.moments[choice];
      else return null;
      break;
    case 3:
      if (choice === SKIP) next.whySkipped = true;
      else if (WHY[choice]) next.why = WHY[choice];
      else return null;
      break;
    case 4:
      if (choice === SKIP) next.originSkipped = true;
      else if (ORIGIN[choice]) next.origin = ORIGIN[choice];
      else return null;
      break;
    case 5: {
      if (!state.aspect) return null;
      const names = nameCandidates(state.aspect);
      // 마지막 선택지는 "아직 잘 모르겠어요" — 이름은 코치의 제안으로 두되 임시로 표시한다
      if (choice === names.length) {
        next.value = names[0];
        next.tentative = true;
        break;
      }
      if (!names[choice]) return null;
      next.value = names[choice];
      break;
    }
    case 6: {
      if (!state.value) return null;
      const practices = buildPractices(state.value, practiceContext(state));
      if (!practices[choice]) return null;
      next.practice = practices[choice];
      break;
    }
    default:
      return null;
  }
  next.stepIndex = state.stepIndex + 1;
  return next;
}

export function replayIdentity(seq: number[]): IdentityReplayOutcome {
  let state = initialIdentityState();
  let applied = 0;
  for (const choice of seq) {
    if (state.stepIndex >= IDENTITY_STEPS) break;
    const next = applyIdentityChoice(state, choice);
    if (!next) return { state, done: false, valid: false, applied };
    state = next;
    applied += 1;
  }
  return {
    state,
    done: state.stepIndex >= IDENTITY_STEPS,
    valid: true,
    applied,
  };
}

/* ── UI가 소비하는 일반화된 단계 기술자 ── */

export interface StepOption {
  emoji?: string;
  title: string;
  sub?: string;
  /** 시퀀스에 기록할 값 */
  choice: number;
}

export interface IdentityStep {
  kind: "choice" | "naming" | "practice";
  title: string;
  sub?: string;
  /** 명명 단계: 오브 코치의 발화 (단정이 아니라 제안) */
  coachLines?: string[];
  options: StepOption[];
  /** "넘어갈래요" 허용 여부 — 자기 탐색은 자발적일 때만 유효하다 */
  skippable: boolean;
  skipLabel?: string;
}

export function currentIdentityStep(state: IdentityState): IdentityStep | null {
  switch (state.stepIndex) {
    case 0:
      return {
        kind: "choice",
        title: "어떤 사람을 보면\n가장 부럽나요?",
        sub: "정답은 없어요. 가장 먼저 마음이 가는 쪽으로.",
        options: ENVY.map((e, i) => ({
          title: e.title,
          sub: e.sub,
          choice: i,
        })),
        skippable: false,
      };
    case 1:
      return {
        kind: "choice",
        title: "그 사람의 어떤 점이\n부러운가요?",
        sub: "그 사람이 아니라, 당신의 마음이 향한 곳을 찾는 중이에요.",
        options: (state.envy?.aspects ?? []).map((a, i) => ({
          title: a.title,
          choice: i,
        })),
        skippable: false,
      };
    case 2:
      return {
        kind: "choice",
        title: "그 마음은 주로\n언제 찾아오나요?",
        sub: "부러움은 아무 때나 오지 않아요. 가장 자주 오는 자리를 찾는 중이에요.",
        options: (state.envy?.moments ?? []).map((m, i) => ({
          title: m.title,
          choice: i,
        })),
        skippable: true,
        skipLabel: "딱히 그런 순간은 없어요 — 넘어갈래요",
      };
    case 3:
      return {
        kind: "choice",
        title: "왜 그게 당신에게\n중요한가요?",
        sub: "고르기 어려우면, 가장 아닌 것부터 지워보세요.",
        options: WHY.map((w, i) => ({ title: w.title, choice: i })),
        skippable: true,
        skipLabel: "잘 모르겠어요 — 넘어갈래요",
      };
    case 4:
      return {
        kind: "choice",
        title: "그 마음은,\n언제부터였을까요?",
        sub: "천천히 생각해도 돼요. 떠오르지 않으면 그것도 괜찮아요.",
        options: ORIGIN.map((o, i) => ({ title: o.title, choice: i })),
        skippable: true,
        skipLabel: "떠오르지 않아요 — 넘어갈래요",
      };
    case 5: {
      if (!state.aspect) return null;
      const [v, ...alts] = nameCandidates(state.aspect);
      return {
        kind: "naming",
        title: "",
        coachLines: [
          state.moment
            ? `${state.moment.phrase}에 그 마음이 온다면,`
            : "여기까지 들어보니,",
          `당신에게 중요한 건 「${v}」인 것 같아요.`,
          "맞나요?",
        ],
        options: [
          { title: `맞아요 — 「${v}」${ieyo(v)}`, choice: 0 },
          ...alts.map((alt, i) => ({
            title: `비슷하지만, 「${alt}」에 더 가까워요`,
            choice: i + 1,
          })),
          {
            title: "아직 잘 모르겠어요 — 일단 이 이름으로 둘게요",
            choice: alts.length + 1,
          },
        ],
        skippable: false,
      };
    }
    case 6:
      return {
        kind: "practice",
        title: "문장을 하루 속의\n작은 행동 하나로",
        sub: "거창하지 않아도 돼요. 이번 주에 딱 하나만.",
        options: buildPractices(state.value ?? "", practiceContext(state)).map(
          (p, i) => ({
            title: p.action,
            sub: p.caption,
            choice: i,
          }),
        ),
        skippable: false,
      };
    default:
      return null;
  }
}

/** 지금까지의 발견 조각 — 축적되는 자기 이해의 최소 단위 */
export function identityInsights(state: IdentityState): string[] {
  const chips: string[] = [];
  if (state.envy) chips.push(`동경 — ${state.envy.short}`);
  if (state.aspect) chips.push(`부러움의 정체 — ${state.aspect.label}`);
  if (state.moment) chips.push(`순간 — ${state.moment.phrase}`);
  if (state.why) chips.push(`이유 — ${state.why.label}`);
  if (state.origin) chips.push(`근원 — ${state.origin.phrase}`);
  if (state.value) chips.push(`가치 — 「${state.value}」`);
  return chips;
}

/**
 * 나의 문장 — 취향 여정의 무드와 Why 체인의 발견을 하나로 잇는다.
 * moodName이 있으면 "그래서 그 무드에 끌렸는지도 모른다"의 다리가 놓인다 (Identity → Style의 서사).
 */
export function buildStatement(
  state: IdentityState,
  moodName?: string,
): string[] {
  if (!state.envy || !state.value) return [];
  const lines: string[] = [];
  lines.push(
    `나는 ${state.envy.short}${eul(state.envy.short)} 동경하는 사람이다.`,
  );
  if (moodName)
    lines.push(`그래서 「${moodName}」의 무드에 끌렸는지도 모른다.`);
  else lines.push(`그 동경의 이름은 「${state.value}」.`);
  // 넘어간 근원은 문장에서도 비워둔다 — 없는 기억을 지어내지 않는다
  if (state.origin)
    lines.push(`그 마음은 ${state.origin.phrase}에 닿아 있다.`);
  lines.push(
    `그래서 나는, ${DIRECTION[state.value] ?? "나의 문장대로 살아보려 한다"}.`,
  );
  return lines;
}
