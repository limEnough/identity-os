"use client";

import type { ReactNode } from "react";
import { cn } from "../cn";

/**
 * 손잡이 곁에 잠깐 붙는 말 — 누르면 무엇이 있는지 미리 알린다.
 *
 * 어두운 면을 쓰는 것은 §ResumeBanner와 같은 이유다: **여정의 일부가 아니라
 * 여정 밖에서 건네는 말**이므로 배경에서 떼어 둔다. 지난 발자국을 알리는 배너와
 * 같은 톤이라, 둘 다 "당신을 알아봤어요"의 자리라는 게 색으로 읽힌다.
 *
 * 스스로 사라지지 않는다. 시간이 지나 사라지는 안내는 못 본 사람에게는 없던 것과
 * 같고, 본 사람에게는 다시 볼 수 없는 것이 된다 — 누르면 닫히고, 가리키는 것을
 * 열어도 닫힌다. 닫는 일은 여는 쪽이 정한다(`onDismiss`).
 *
 * 놓는 자리는 감싼 쪽이 `relative`로 정한다.
 */
export function Tooltip({
  side = "right",
  onDismiss,
  children,
}: {
  /** 손잡이의 어느 쪽 끝에 맞출지 — 화면 가장자리로 넘치지 않게 */
  side?: "left" | "right";
  onDismiss?: () => void;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "absolute top-full z-20 mt-2.5 animate-appear-fast",
        side === "right" ? "right-0" : "left-0",
      )}
    >
      {/* 손잡이를 가리키는 꼭지 — 같은 색의 네모를 45° 돌려 얹는다 */}
      <span
        aria-hidden
        className={cn(
          "absolute -top-1 size-2 rotate-45 bg-deep",
          // 손잡이(36px)의 한가운데를 겨눈다 — 꼭지 절반(4px)을 빼고 18 − 4 = 14px
          side === "right" ? "right-3.5" : "left-3.5",
        )}
      />
      <button
        type="button"
        className={cn(
          "block cursor-pointer rounded-btn bg-deep px-3.5 py-2.5",
          "text-caption font-semibold whitespace-nowrap text-deep-ink shadow-banner",
        )}
        onClick={onDismiss}
      >
        {children}
      </button>
    </span>
  );
}
