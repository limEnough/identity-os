/**
 * Identity OS 도메인 두뇌 — 여덟 축이 하나의 엔진 위에 선다.
 *
 * 축마다 다른 것은 데이터(AxisDef)뿐이고, 걸음의 모양·좌표·명명·잠금 순서는
 * axis/ 한 곳에만 적혀 있다. 프레임워크 무의존 순수 TS.
 */

/* 여덟 축의 데이터 */
export { AXES } from './axis/axes';
export {
  identityAxis,
  mindsetAxis,
  communicationAxis,
  lifestyleAxis,
  tasteAxis,
  styleAxis,
  healthAxis,
  careerAxis,
  DIRECTION,
  RITUAL,
} from './axis/axes';

/* 공통 축 엔진 */
export {
  SKIP,
  AXIS_STEPS,
  emptyProfile,
  buildProfile,
  replayAxis,
  currentAxisStep,
  axisCoords,
  axisInsights,
  axisNote,
  axisResult,
  resolveOutcome,
  neighborOutcome,
  nameCandidates,
  dominantTilt,
  outcomeVariant,
  crossPractices,
} from './axis/engine';
export type { AxisCoord, AxisReplay, AxisStep, StepOption } from './axis/engine';

/* 여정 — 순서와 잠금 */
export {
  axisById,
  axisIndex,
  axisHref,
  guideHref,
  resumeHref,
  journeyQuery,
  journeyStep,
  footprintsFromQuery,
  walkJourney,
  canWalk,
  JOURNEY_STEPS,
} from './axis/journey';
export type {
  Footprints,
  Journey,
  JourneyStep,
  AxisStatus,
} from './axis/journey';

/* 나의 문장 */
export { buildStatement } from './axis/statement';

/* 나의 네 글자 — 여덟 축을 가로지르는 결을 네 글자로 */
export {
  AXIS_COUNT,
  CENTER,
  CODE_AXES,
  CODE_KEYS,
  CODE_NAMES,
  FAINT,
  SETTLE,
  buildCode,
  codeCanon,
  codeCoords,
  codeName,
  codePoles,
  codeSigns,
  flipCode,
  isCodeKey,
} from './axis/code';
export type { Code, CodeAxis, CodeLetter, CodeName, CodePole } from './axis/code';

/* 결 벡터 */
export { canon, addCanon, scaleCanon, sumCanon, project, ZERO, CANON_KEYS } from './axis/canon';
export type { Canon, PoleProjection } from './axis/canon';

/* 타입 */
export type {
  AxisId,
  AxisDef,
  AxisOpening,
  AxisOption,
  AxisScoped,
  AxisChild,
  AxisProbe,
  AxisFacet,
  AxisOutcome,
  AxisPole,
  AxisResult,
  AxisState,
  NamedOutcome,
  PracticeCtx,
  PracticeOption,
  Profile,
  Triple,
} from './axis/types';

/* 조각들 */
export { hasBatchim, eul, gwa, iga, ieyo } from './josa';
export { encodeSeq, decodeSeq } from './seq';
export { createLocalStore } from './progress-store';
export type { ProgressStore } from './progress-store';
