import type { ReactNode } from "react";

/**
 * 플로팅 CTA — 버튼은 하단에 머물고, 콘텐츠만 스크롤된다.
 *
 * 배경은 위로 갈수록 투명해지는 페이드라 글이 버튼 아래로 스며 사라진다.
 * 텍스트 버튼(넘어가기·다시 걷기)이 함께 놓이면 주 버튼 위에 형태 없이 뜬다 —
 * 사이 간격은 gap이 맡으므로, 홀로 남는 화면에서도 아래가 비지 않는다.
 *
 * fixed-layer는 <Screen />이 "떠오르지 않는 층"으로 알아보는 표식 — 페이드만 한다.
 */
export function FloatingCta({ children }: { children: ReactNode }) {
  return (
    <div className="fixed-layer pointer-events-none fixed bottom-0 left-1/2 z-20 flex w-full max-w-150 -translate-x-1/2 animate-appear flex-col gap-4 bg-[linear-gradient(to_top,var(--color-bg)_45%,rgb(245_247_255/0.85)_70%,transparent)] px-5 pt-8.5 pb-[calc(18px+env(safe-area-inset-bottom,0px))] *:pointer-events-auto">
      {children}
    </div>
  );
}
