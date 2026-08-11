"use client";

import { useCallback } from "react";
import {
  AXIS_STEPS,
  axisCoords,
  axisInsights,
  currentAxisStep,
  replayAxis,
  SKIP,
} from "@identity-os/identity-core";
import type { AxisDef, Profile } from "@identity-os/identity-core";
import { AxisBars, ChainScreen, useChainSeq } from "@identity-os/design-system";

export interface AxisFlowProps {
  /** 어느 축을 걷는지 — 걸음의 모양은 엔진이, 내용은 이 데이터가 정한다 */
  def: AxisDef;
  /** 앞선 축들이 확정한 것 — 좌표의 출발점이자 물음·결과의 인용 재료 */
  profile: Profile;
  /** 복원할 발자국 */
  initialSeq: number[];
  /** 한 걸음마다 호출 — 앱이 라우트(URL)와 브라우저 기억에 적는다 */
  onSeqChange: (seq: number[]) => void;
  /** 여섯 걸음 완주 시 호출 */
  onComplete: (seq: number[]) => void;
  /** 걷다 멈추고 나갈 때 — 걸음은 이미 저장돼 있으므로 나가는 일만 한다 */
  onPause?: () => void;
}

/**
 * 축 하나를 걷는 화면 — 여덟 축이 이 컴포넌트 하나를 함께 쓴다.
 *
 * 축이 다른 것은 props의 def뿐이다. 그래서 축을 늘리는 일은 화면 작업이 아니라
 * 데이터 작업이 된다(identity-core의 axis/axes/).
 *
 * 리플레이는 언제나 프로필을 물고 간다 — 같은 발자국도 앞서 걸어온 것이 다르면
 * 다른 결과에 닿는다. 여정이 1에서 8로 흐르는 이유가 이 한 줄에 있다.
 */
export function AxisFlow({
  def,
  profile,
  initialSeq,
  onSeqChange,
  onComplete,
  onPause,
}: AxisFlowProps) {
  const replay = useCallback(
    (seq: number[]) => replayAxis(def, seq, profile),
    [def, profile],
  );

  const { outcome, choose } = useChainSeq({
    initialSeq,
    replay,
    onSeqChange,
    onComplete,
  });

  const step = currentAxisStep(def, outcome.state, profile);
  if (!step) return null;

  return (
    <ChainScreen
      step={step}
      totalSteps={AXIS_STEPS}
      stepIndex={outcome.state.stepIndex}
      insights={axisInsights(def, outcome.state, profile)}
      aside={
        // 좌표가 이름을 정하는 축에서만 근거를 보여준다 — 판정이 아니라 거울이므로.
        // Identity는 이름이 고른 갈래에서 오므로 막대가 근거가 되지 않는다.
        def.naming === "octant" ? (
          <AxisBars
            axes={axisCoords(def, outcome.state, profile)}
            className="mt-6.5"
          />
        ) : undefined
      }
      onChoose={choose}
      onSkip={() => choose(SKIP)}
      onPause={onPause}
    />
  );
}
