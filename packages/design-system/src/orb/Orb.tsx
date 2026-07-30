import type { ReactNode } from "react";
import { cn } from "../cn";

/**
 * 오브 — Identity OS의 코치 캐릭터.
 * 숨 쉬듯 맥동하는 빛 덩어리. 판정하는 기계가 아니라 곁에서 기다리는 존재.
 * 잠들어도 숨은 쉰다 — 감기는 것은 눈뿐이다.
 *
 * @param size  large(132px) · mini(38px) · 숫자(px)
 * @param mood  awake(깨어 있음) · rest(잠듦 — 회고를 기다릴 때)
 */
export function Orb({
  size = "large",
  mood = "awake",
}: {
  size?: "large" | "mini" | number;
  mood?: "awake" | "rest";
}) {
  const mini = size === "mini";
  const asleep = mood === "rest";

  /* 눈 크기는 오브 크기에 비례한다 — px로 고정하면 작은 오브에서 양쪽 눈이 붙는다.
     너비만은 mini에서 px을 쓴다: 38px에서는 비율보다 또렷함이 먼저다. */
  const eye = cn(
    "absolute bg-white",
    mini ? "w-[4.5px]" : "w-[10%]",
    asleep
      ? "top-1/2 h-[3%] min-h-[3px] rounded-full shadow-eye-rest"
      : cn(
          "animate-blink shadow-eye",
          mini ? "top-[40%] h-[9px] rounded-[3px]" : "top-[42%] h-[20%] rounded-full",
        ),
  );

  return (
    <div
      className={cn(
        "orb-skin relative flex-none animate-breathe",
        mini ? "size-9.5 rounded-[44%] shadow-orb-mini" : "rounded-[42%] shadow-orb",
        typeof size === "string" && !mini && "size-33",
      )}
      style={
        typeof size === "number" ? { width: size, height: size } : undefined
      }
      aria-hidden
    >
      <span className={cn(eye, mini ? "left-[30%]" : "left-[33%]")} />
      <span className={cn(eye, mini ? "right-[30%]" : "right-[33%]")} />
    </div>
  );
}

/** 오브가 서는 무대 — 화면 가운데 */
export function OrbStage({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("flex justify-center", className)}>{children}</div>;
}
