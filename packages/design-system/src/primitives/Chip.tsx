import type { ReactNode } from "react";
import { cn } from "../cn";
import { chipBase, overline } from "../recipes";

/** 알약 하나 — 무드의 표현 언어를 낱말로 흩뿌린다 */
export function Chip({ children }: { children: ReactNode }) {
  return <span className={chipBase}>{children}</span>;
}

/** 알약 여러 개가 흐르는 자리 */
export function ChipRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-1.75">{children}</div>;
}

/**
 * 발견 조각 — 여정 중에 쌓인 낱말들. 판정이 아니라 "당신이 고른 것들이 여기 있다".
 * 조각은 하나씩 늘어나므로 등장 애니메이션을 각 칩이 지닌다.
 */
export function InsightChips({ chips }: { chips: string[] }) {
  if (chips.length === 0) return null;
  return (
    <div className="mt-12 border-t border-line pt-5">
      <p className={cn(overline, "mb-3 tracking-[0.22em]")}>
        발견 조각 {chips.length}
      </p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="animate-rise rounded-[10px] bg-tint px-3 py-1.75 text-caption text-chip inset-ring inset-ring-chip-line"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
