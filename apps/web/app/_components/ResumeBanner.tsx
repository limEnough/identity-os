"use client";

/**
 * 지난 발자국을 알리는 배너 — 계정도 서버도 없이 "이렇게 당신을 알아볼게요"의 결과.
 * 어두운 면 하나로 배경에서 떼어 둔다: 여정의 일부가 아니라 여정 밖에서 건네는 말이므로.
 *
 * **알리기만 한다.** 한때 이 안에 「이어서 걷기」·「새로 떠나기」 두 버튼이 있었는데,
 * 화면 한가운데의 작은 버튼이라 아래 CTA와 어느 쪽이 주인지 흐렸다. 고르는 일은
 * 하단 CTA가 맡는다(§FloatingCta) — 이 자리는 무엇을 고를지 알려주는 데까지다.
 */
export function ResumeBanner({
  steps,
  axisName,
}: {
  /** 지난번에 걸어온 걸음 수 */
  steps: number;
  /** 이어 걸으면 만날 축 — 여덟 축을 다 걸었으면 없다 */
  axisName?: string;
}) {
  return (
    <div className="mt-4.5 rounded-btn bg-deep px-4.25 py-3.75 text-support text-deep-ink shadow-banner">
      지난 여정의 발자국이 남아 있어요 — <b>{steps}걸음</b>까지 걸어왔네요.
      {axisName ? ` 다음은 ${axisName}이에요.` : " 여덟 축을 모두 걸었어요."}
    </div>
  );
}
