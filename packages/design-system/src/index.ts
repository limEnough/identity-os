/**
 * Identity OS 디자인 시스템 — 피처 간 시각 일관성의 단일 출처.
 *
 * 토큰과 기본값은 styles.css(Tailwind 진입점)에, 되풀이되는 유틸리티 조합은 recipes.ts에,
 * 그 조합을 입은 컴포넌트가 여기에. 스타일은 전부 Tailwind 유틸리티로 적는다.
 */

/* 골격 */
export { AppShell, Screen } from "./layout/Screen";
export { Aurora } from "./layout/Aurora";
export { FloatingCta } from "./layout/FloatingCta";

/* 낱개 */
export { Button, SkipLink } from "./primitives/Button";
export { Chip, ChipRow, InsightChips } from "./primitives/Chip";
export { Modal, ModalActions } from "./primitives/Modal";
export {
  Brand,
  Desc,
  Heading,
  Lines,
  Note,
  Overline,
  Serif,
} from "./primitives/Text";

/* 코치 */
export { Orb, OrbStage } from "./orb/Orb";
export { Bubble, CoachBubble } from "./orb/Coach";

/* 여정의 공통 골격 — Identity·Style이 함께 쓴다 */
export { ChainScreen } from "./chain/ChainScreen";
export { ChoiceList } from "./chain/ChoiceList";
export { StepDots } from "./chain/StepDots";
export { AxisBars } from "./chain/AxisBars";
export type { AxisView } from "./chain/AxisBars";
export { useChainSeq } from "./chain/useChainSeq";
export type { ChainOutcome } from "./chain/useChainSeq";
export type { ChainOptionView, ChainStepView } from "./chain/types";

/* 서체·손글씨 */
export { SerifFontGate } from "./fonts/SerifFontGate";

/* 훅 */
export { useScrollLock } from "./hooks/useScrollLock";

/* 조합 그대로 필요할 때 */
export { cn } from "./cn";
export {
  accentFill,
  chipBase,
  iconSlot,
  overline,
  quoteBar,
  surface,
  surfaceLift,
} from "./recipes";

/* 아이콘 */
export {
  BoxIcon,
  CATEGORY_ICONS,
  ChatIcon,
  CoatIcon,
  NoteIcon,
  WindowIcon,
} from "./icons";
export type { CategoryIconName, IconProps } from "./icons";
