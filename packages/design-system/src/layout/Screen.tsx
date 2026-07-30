import type { ReactNode } from "react";
import { cn } from "../cn";

/** 앱의 폭 — 여정은 한 손에 들어오는 너비에서 걷는다 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-140 px-4 pt-8 pb-37.5">{children}</div>
  );
}

/**
 * 화면 하나 — 들어설 때 아래에서 살짝 떠오른다.
 *
 * 떠오르는 것은 자식들이고 컨테이너가 아니다: 컨테이너에 transform이 걸리면
 * 내부 붙박이(fixed) 요소의 기준이 뷰포트에서 컨테이너로 바뀌어 플로팅 CTA가
 * 함께 움직인다.
 *
 * 붙박이 층(.fixed-layer — 플로팅 CTA·팝업)은 떠오르지 않는다. 등장 방식은
 * 그 층이 스스로 갖는다: 여기서 함께 지정하면 같은 속성의 애니메이션이 겹친다.
 */
const enter = "[&>*:not(.fixed-layer)]:animate-rise";

export function Screen({
  as: Tag = "main",
  className,
  children,
}: {
  as?: "main" | "section";
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cn(enter, className)}>{children}</Tag>;
}
