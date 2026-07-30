"use client";

import {
  currentIdentityStep,
  identityInsights,
  IDENTITY_STEPS,
  replayIdentity,
  SKIP,
} from "@identity-os/identity-core";
import { ChainScreen, useChainSeq } from "@identity-os/design-system";

export interface IdentityFlowProps {
  /** 복원할 Why 체인 시퀀스 */
  initialSeq: number[];
  /** 한 걸음마다 호출 — 앱이 라우트(URL)에 기록한다 */
  onSeqChange: (seq: number[]) => void;
  /** 7단계 완주 시 호출 */
  onComplete: (seq: number[]) => void;
}

/**
 * Identity 피처 — 부러움을 거울 삼아 내 가치를 찾는 Why 체인.
 * 화면당 질문 하나, 모든 깊은 질문엔 "넘어갈래요"가 있다.
 * 명명 단계에서 오브 코치는 단정하지 않고 제안한다.
 *
 * 화면의 골격은 Style과 공유한다(ChainScreen) — 이 축이 정하는 것은
 * 어떤 트리를 걷는지(replayIdentity)와 무엇을 발견 조각으로 남기는지다.
 */
export function IdentityFlow({
  initialSeq,
  onSeqChange,
  onComplete,
}: IdentityFlowProps) {
  const { outcome, choose } = useChainSeq({
    initialSeq,
    replay: replayIdentity,
    onSeqChange,
    onComplete,
  });

  if (outcome.done) return null;
  const step = currentIdentityStep(outcome.state);
  if (!step) return null;

  return (
    <ChainScreen
      step={step}
      totalSteps={IDENTITY_STEPS}
      stepIndex={outcome.state.stepIndex}
      insights={identityInsights(outcome.state)}
      quoted={step.kind === "practice"}
      onChoose={choose}
      onSkip={() => choose(SKIP)}
    />
  );
}
