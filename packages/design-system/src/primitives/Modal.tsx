"use client";

import type { ReactNode } from "react";
import { cn } from "../cn";
import { useScrollLock } from "../hooks/useScrollLock";

/** 무대의 두 종류 — 묻는 팝업(가운데 정렬)과 읽는 팝업(왼쪽 정렬, 조금 더 넓다) */
const panels = {
  confirm: "max-w-105 px-6.5 pt-7.5 pb-5.5 text-center",
  note: "max-w-115 px-6 pt-6.5 pb-5 text-left",
} as const;

/**
 * 무대 하나를 가리고 올라오는 팝업 — 시작 전 확인, 펼쳐본 쪽지.
 *
 * 바깥을 누르면 닫힌다. 열려 있는 동안 뒤 페이지는 붙잡아 둔다(useScrollLock).
 * 여는 쪽에서 조건부로 렌더하므로, 여기서는 "열렸다"는 사실만 다룬다.
 */
export function Modal({
  variant = "confirm",
  onClose,
  children,
}: {
  variant?: keyof typeof panels;
  onClose: () => void;
  children: ReactNode;
}) {
  useScrollLock(true);

  return (
    <div
      className="fixed-layer fixed inset-0 z-50 flex animate-appear-fast items-center justify-center bg-ink/35 p-6 backdrop-blur-[6px]"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full animate-rise-fast rounded-panel border border-line bg-card shadow-modal",
          panels[variant],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * 팝업 아래의 버튼 줄 — 둘이 놓이면 반씩 나눠 갖는다.
 *
 * @param tight 위 칸이 스크롤되는 팝업에서. 여백 대신 **페이드**가 경계를 맡으므로
 *   버튼이 스크롤 영역에 바로 붙는다 — 사이를 비워두면 글이 허공에서 잘린다.
 */
export function ModalActions({
  tight = false,
  children,
}: {
  tight?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex gap-2.5 *:flex-1", !tight && "mt-6.5")}>
      {children}
    </div>
  );
}
