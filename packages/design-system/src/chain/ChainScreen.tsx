import type { ReactNode } from "react";
import { Screen } from "../layout/Screen";
import { CoachBubble } from "../orb/Coach";
import { InsightChips } from "../primitives/Chip";
import { Desc, Heading, Lines } from "../primitives/Text";
import { SkipLink } from "../primitives/Button";
import { ChoiceList } from "./ChoiceList";
import { StepDots } from "./StepDots";
import type { ChainStepView } from "./types";

/**
 * 여정 한 걸음의 화면 — Identity(왜)와 Style(감각)이 같은 골격을 쓴다.
 *
 * 걸음 점 → 물음(또는 코치의 제안) → 선택지 → 넘어가기 → 발견 조각.
 * 명명 단계에서는 화면이 묻지 않고 오브가 제안한다: "당신은 ~형입니다"가 아니라
 * "이런 이름은 어떨까요"라고. 무엇을 보고 그렇게 말했는지(aside)를 함께 둘 수 있다.
 */
export function ChainScreen({
  step,
  totalSteps,
  stepIndex,
  insights,
  aside,
  onChoose,
  onSkip,
}: {
  step: ChainStepView;
  totalSteps: number;
  stepIndex: number;
  insights: string[];
  /** 코치의 제안 아래에 놓을 근거 — Style은 축 막대를 함께 보여준다 */
  aside?: ReactNode;
  onChoose: (choice: number) => void;
  onSkip: () => void;
}) {
  /** 명명 단계에서만 화면 대신 오브가 말한다 */
  const coachLines = step.kind === "naming" ? step.coachLines : undefined;

  return (
    <Screen as="section">
      <StepDots total={totalSteps} current={stepIndex} />

      {coachLines ? (
        <>
          <CoachBubble>
            <Lines of={coachLines} />
          </CoachBubble>
          {aside}
        </>
      ) : (
        <>
          <Heading as="h2">
            <Lines of={step.title.split("\n")} />
          </Heading>
          {step.sub && <Desc tight>{step.sub}</Desc>}
        </>
      )}

      <ChoiceList options={step.options} onChoose={onChoose} />

      {step.skippable && (
        <SkipLink className="mt-8.5" onClick={onSkip}>
          {step.skipLabel}
        </SkipLink>
      )}

      <InsightChips chips={insights} />
    </Screen>
  );
}
