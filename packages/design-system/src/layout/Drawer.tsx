"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "../cn";
import { useScrollLock } from "../hooks/useScrollLock";
import { overline } from "../recipes";

/**
 * 왼쪽에서 열리는 서랍 — 여정 **밖**의 것들이 사는 자리.
 *
 * 팝업(§Modal)과 층위가 다르다. 팝업은 지금 보고 있는 것 위에 잠깐 겹치는 무대라
 * 가운데서 떠오르지만, 서랍은 화면 밖에 늘 접혀 있다가 옆에서 들어온다 —
 * "여기 말고 다른 데도 있다"를 몸으로 알리는 움직임이다.
 *
 * 닫는 길을 셋 둔다: 바깥 누르기 · 닫기 버튼 · Esc. 서랍은 사용자가 스스로 연
 * 자리라 언제든 스스로 닫을 수 있어야 한다.
 */
export function Drawer({
  side = "right",
  title,
  onClose,
  children,
}: {
  /**
   * 어느 쪽에서 들어올지 — **손잡이가 있는 쪽**으로 맞춘다.
   * 오른쪽 손잡이를 눌렀는데 왼쪽에서 열리면 화면을 가로질러 눈이 되돌아온다.
   */
  side?: "left" | "right";
  /** 서랍의 머리표 */
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useScrollLock(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed-layer fixed inset-0 z-50 animate-appear-fast bg-ink/35 backdrop-blur-[6px]"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "flex h-full w-[86%] max-w-88 flex-col bg-card shadow-modal",
          side === "right"
            ? "ml-auto animate-slide-in-right border-l border-line"
            : "animate-slide-in border-r border-line",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5.5 py-5">
          <p className={cn(overline, "tracking-[0.2em]")}>{title}</p>
          <button
            type="button"
            className="cursor-pointer text-caption font-semibold text-sub transition-colors hover:text-accent"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        {/* 판이 여럿 쌓이면 길어지므로, 서랍 안에서만 스크롤된다 */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5.5 py-5.5">
          {children}
        </div>
      </aside>
    </div>
  );
}
