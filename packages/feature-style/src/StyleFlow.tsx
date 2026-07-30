"use client";

import {
  currentStyleStep,
  replayStyle,
  SKIP,
  styleAxes,
  styleInsights,
  STYLE_STEPS,
} from "@identity-os/identity-core";
import { AxisBars, ChainScreen, useChainSeq } from "@identity-os/design-system";

export interface StyleFlowProps {
  /** Identity에서 확정된 핵심 가치 — 질문의 말끝을 그 사람의 언어로 맞춘다 */
  value: string;
  /** 복원할 무드 체인 시퀀스 */
  initialSeq: number[];
  /** 한 걸음마다 호출 — 앱이 라우트(URL)에 기록한다 */
  onSeqChange: (seq: number[]) => void;
  /** 6단계 완주 시 호출 */
  onComplete: (seq: number[]) => void;
}

/**
 * Style 피처 — 감각을 물어 무드에 이름을 붙이는 체인.
 * Identity가 "왜?"를 파고든다면 여기서는 장면·질감·빛·거리를 묻는다.
 *
 * 화면의 골격은 Identity와 공유한다(ChainScreen). 다른 것은 하나뿐 —
 * 명명 화면에서 오브가 무슨 근거로 그렇게 말했는지 축 막대를 함께 둔다.
 * 판정이 아니라 거울이므로.
 */
export function StyleFlow({
  value,
  initialSeq,
  onSeqChange,
  onComplete,
}: StyleFlowProps) {
  const { outcome, choose } = useChainSeq({
    initialSeq,
    replay: replayStyle,
    onSeqChange,
    onComplete,
  });

  if (outcome.done) return null;
  const step = currentStyleStep(outcome.state, value);
  if (!step) return null;

  return (
    <ChainScreen
      step={step}
      totalSteps={STYLE_STEPS}
      stepIndex={outcome.state.stepIndex}
      insights={styleInsights(outcome.state)}
      quoted={step.kind === "expression"}
      aside={<AxisBars axes={styleAxes(outcome.state)} className="mt-6.5" />}
      onChoose={choose}
      onSkip={() => choose(SKIP)}
    />
  );
}
