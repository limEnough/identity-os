import type { ReactNode } from "react";
import { cn } from "../cn";
import { Orb } from "./Orb";

const bubble =
  "mt-9 flex items-start gap-3.5 rounded-card border border-line bg-card px-6 py-5.5 shadow-coach";

/** 오브가 말하는 말풍선 — 곁에 작은 오브가 함께 뜬다 */
export function CoachBubble({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(bubble, className)}>
      <Orb size="mini" />
      <p className="pt-1 text-body">{children}</p>
    </div>
  );
}

/** 말하는 이가 없는 말풍선 — 화면이 스스로 건네는 한마디 */
export function Bubble({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(bubble, className)}>
      <p className="pt-1 text-body">{children}</p>
    </div>
  );
}
