"use client";

import type { ReactNode } from "react";
import { cn } from "../cn";

/**
 * 무언가를 가리키며 붙는 말 — 손잡이 곁에, 또는 버튼 위에.
 *
 * 어두운 면을 쓴다: **여정의 일부가 아니라 여정 밖에서 건네는 말**이므로 배경에서
 * 떼어 둔다. 한때 같은 톤의 배너가 화면 한가운데 따로 있었는데, 알리는 자리와
 * 고르는 자리가 멀어 눈이 두 번 움직였다 — 그래서 가리키는 것에 붙였다.
 *
 * 스스로 사라지지 않는다. 시간이 지나 사라지는 안내는 못 본 사람에게는 없던 것과
 * 같고, 본 사람에게는 다시 볼 수 없는 것이 된다 — 누르면 닫히고, 가리키는 것을
 * 열어도 닫힌다. 닫는 일은 여는 쪽이 정한다(`onDismiss`).
 *
 * 놓는 자리는 감싼 쪽이 `relative`로 정한다. 말풍선과 꼭지는 **따로 놓인다**:
 * 말풍선은 화면 밖으로 넘치지 않게 가장자리에 맞추고, 꼭지는 언제나 가리키는 것의
 * 한가운데에 선다. 하나로 묶으면 말풍선이 넓어질 때 꼭지가 엉뚱한 데를 가리킨다.
 */
export function Tooltip({
  placement = "below",
  align = "right",
  onDismiss,
  children,
}: {
  /** 가리키는 것의 위인지 아래인지 */
  placement?: "above" | "below";
  /** 말풍선을 어느 가장자리에 맞출지 — 화면 밖으로 넘치지 않게 */
  align?: "left" | "right";
  onDismiss?: () => void;
  children: ReactNode;
}) {
  const above = placement === "above";

  return (
    <>
      <button
        type="button"
        className={cn(
          "absolute z-20 w-max max-w-[min(20rem,calc(100vw-2.5rem))] animate-appear-fast",
          "cursor-pointer rounded-btn bg-deep px-3.5 py-2.5",
          "text-left text-caption font-semibold text-deep-ink shadow-banner",
          above ? "bottom-full mb-2.5" : "top-full mt-2.5",
          align === "right" ? "right-0" : "left-0",
        )}
        onClick={onDismiss}
      >
        {children}
      </button>
      {/* 꼭지는 가리키는 것의 한가운데 — 말풍선이 아니라 감싼 쪽을 기준으로 선다 */}
      <span
        aria-hidden
        className={cn(
          "absolute left-1/2 z-20 size-2 -translate-x-1/2 rotate-45 bg-deep",
          above ? "bottom-full mb-1.5" : "top-full mt-1.5",
        )}
      />
    </>
  );
}
