"use client";

/**
 * 지난 발자국을 알리는 배너 — 계정도 서버도 없이 "이렇게 당신을 알아볼게요"의 결과.
 * 어두운 면 하나로 배경에서 떼어 둔다: 여정의 일부가 아니라 여정 밖에서 건네는 말이므로.
 */
export function ResumeBanner({
  steps,
  onResume,
  onForget,
}: {
  /** 지난번에 걸어온 걸음 수 */
  steps: number;
  onResume: () => void;
  onForget: () => void;
}) {
  return (
    <div className="mt-4.5 rounded-btn bg-deep px-4.25 py-3.75 text-support text-deep-ink shadow-banner">
      <span>
        지난 여정의 발자국이 남아 있어요 — <b>{steps}걸음</b>까지 걸어왔네요.
        이어서 걸을까요?
      </span>
      <div className="mt-2.5 flex gap-2 *:flex-1 *:cursor-pointer *:rounded-[10px] *:py-2.25 *:text-caption *:font-bold">
        <button type="button" className="bg-white text-ink" onClick={onResume}>
          이어서 걷기
        </button>
        <button
          type="button"
          className="border border-deep-line text-deep-sub"
          onClick={onForget}
        >
          새로 떠나기
        </button>
      </div>
    </div>
  );
}
