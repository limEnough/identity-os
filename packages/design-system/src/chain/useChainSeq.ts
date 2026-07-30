"use client";

import { useEffect, useMemo, useState } from "react";

/** 리플레이 결과가 갖춰야 하는 최소한 — 어느 축이든 이 셋은 알려준다 */
export interface ChainOutcome {
  /** 시퀀스가 트리와 어긋나지 않는지 */
  valid: boolean;
  /** 완주했는지 */
  done: boolean;
  /** 어긋나기 전까지 적용된 걸음 수 */
  applied: number;
}

/**
 * 여정 한 축의 상태 기계 — Identity·Style이 똑같이 쓴다.
 *
 * 원본 상태는 응답 시퀀스(발자국) 하나뿐이고, 화면 상태는 전부 리플레이로 파생된다.
 * 그래서 여기서 하는 일은 셋뿐이다: 어긋난 발자국은 어긋난 지점까지만 살려 복원하고,
 * 걸음마다 바깥(URL·브라우저 기억)에 알리고, 완주하면 한 번 알린다.
 *
 * 도메인은 모른다 — 리플레이 함수만 받는다.
 */
export function useChainSeq<T extends ChainOutcome>({
  initialSeq,
  replay,
  onSeqChange,
  onComplete,
}: {
  initialSeq: number[];
  replay: (seq: number[]) => T;
  onSeqChange: (seq: number[]) => void;
  onComplete: (seq: number[]) => void;
}) {
  const [seq, setSeq] = useState<number[]>(() => {
    const outcome = replay(initialSeq);
    return outcome.valid ? initialSeq : initialSeq.slice(0, outcome.applied);
  });

  const outcome = useMemo(() => replay(seq), [replay, seq]);

  useEffect(() => {
    if (outcome.done) onComplete(seq);
  }, [outcome.done, seq, onComplete]);

  /** 한 걸음 — 트리와 어긋나는 선택은 애초에 기록되지 않는다 */
  const choose = (choice: number) => {
    const nextSeq = [...seq, choice];
    if (!replay(nextSeq).valid) return;
    setSeq(nextSeq);
    onSeqChange(nextSeq);
  };

  return { seq, outcome, choose };
}
