"use client";

import { useEffect } from "react";
import { cn } from "../cn";
import { useScrollLock } from "../hooks/useScrollLock";
import { Orb } from "./Orb";

/**
 * 축하 화면 — 여덟 축을 다 걸은 그 순간에만, 딱 한 번.
 *
 * 닫는 버튼이 없다. 무엇을 고르라고 하지도, 무엇을 알리지도 않는다 —
 * 몇 초 동안 빛나기만 하고 스스로 물러난다. 축하에 확인 버튼을 붙이면
 * 축하가 아니라 안내가 되기 때문이다.
 *
 * 그래서 여기엔 링크도 CTA도 두지 않는다. 다 보고 나면 원래 있던 가이드북이
 * 그대로 아래에 있다.
 */
export function Fanfare({
  title,
  sub,
  hold = 3000,
  onDone,
}: {
  title: string;
  /** 이름 한 줄 — 없으면 제목만 */
  sub?: string;
  /** 머무는 시간(ms) */
  hold?: number;
  onDone: () => void;
}) {
  useScrollLock(true);

  useEffect(() => {
    const timer = setTimeout(onDone, hold);
    return () => clearTimeout(timer);
  }, [hold, onDone]);

  return (
    <div
      className="fixed-layer fixed inset-0 z-60 flex animate-appear-fast flex-col items-center justify-center bg-deep/85 px-8 backdrop-blur-[14px]"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex size-33 items-center justify-center">
        {/* 오브에서 퍼져 나가는 빛 세 겹 — 시차를 두고 겹친다 */}
        {["", "[animation-delay:0.7s]", "[animation-delay:1.4s]"].map(
          (delay, i) => (
            <span
              key={i}
              className={cn(
                "absolute size-33 animate-flare rounded-[42%] bg-glow",
                delay,
              )}
              aria-hidden
            />
          ),
        )}
        <Orb mood="spark" />
      </div>

      <p className="mt-11 text-center text-display font-extrabold text-white">
        {title}
      </p>
      {sub && (
        <p className="mt-3 text-center text-support text-deep-sub">{sub}</p>
      )}
    </div>
  );
}
