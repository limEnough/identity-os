"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../cn";

/**
 * 제목을 복사해 가는 버튼 — 서재의 유일한 출구.
 *
 * 링크는 두지 않는다. 어디서 듣고 어디서 읽을지는 각자 정하는 일이고, 바깥으로 나가는
 * 문을 만들면 선물이 광고처럼 보이기 시작한다. 여기서는 제목만 건넨다 —
 * 각자 쓰던 곳에 붙여넣도록.
 */
export function CopyButton({
  value,
  label = "제목 복사",
  className,
}: {
  /** 클립보드에 담길 말 — 검색창에 그대로 붙여넣을 수 있는 형태로 */
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // 클립보드를 막아둔 환경 — 조용히 넘어간다. 제목은 화면에 이미 적혀 있다.
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "rounded-full border px-3 py-1.5 text-label font-semibold transition-colors duration-250",
        copied
          ? "border-rim bg-tint text-chip"
          : "border-line text-sub hover:border-edge hover:text-chip",
        className,
      )}
    >
      {copied ? "복사했어요" : label}
    </button>
  );
}
