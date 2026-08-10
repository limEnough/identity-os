import type { ReactNode } from "react";
import { cn } from "../cn";

/**
 * 오브 — Identity OS의 코치 캐릭터.
 * 숨 쉬듯 맥동하는 빛 덩어리. 판정하는 기계가 아니라 곁에서 기다리는 존재.
 * 잠들어도 숨은 쉰다 — 감기는 것은 눈뿐이다.
 *
 * @param size  large(132px) · mini(38px) · 숫자(px)
 * @param mood  awake(깨어 있음) · rest(잠듦) · spark(기뻐함 — 여덟 축을 다 걸었을 때)
 */
export function Orb({
  size = "large",
  mood = "awake",
}: {
  size?: "large" | "mini" | number;
  mood?: "awake" | "rest" | "spark";
}) {
  const mini = size === "mini";

  /* 눈 크기는 오브 크기에 비례한다 — px로 고정하면 작은 오브에서 양쪽 눈이 붙는다.
     너비만은 mini에서 px을 쓴다: 38px에서는 비율보다 또렷함이 먼저다.

     기뻐하는 눈은 별이라 정사각형에서 출발한다(clip-path가 네 갈래로 깎는다).
     그만큼 넓어지므로 양쪽 눈을 바깥으로 조금 더 벌려 세운다. */
  const eye = cn(
    "absolute bg-white",
    mood === "rest"
      ? cn(
          "top-1/2 h-[3%] min-h-[3px] rounded-full shadow-eye-rest",
          mini ? "w-[4.5px]" : "w-[10%]",
        )
      : mood === "spark"
        ? cn(
            "orb-eye-spark animate-twinkle shadow-eye",
            mini ? "top-[32%] size-[11px]" : "top-[34%] size-[19%]",
          )
        : cn(
            "animate-blink shadow-eye",
            mini
              ? "top-[40%] h-[9px] w-[4.5px] rounded-[3px]"
              : "top-[42%] h-[20%] w-[10%] rounded-full",
          ),
  );

  const inset =
    mood === "spark"
      ? { left: "left-[24%]", right: "right-[24%]" }
      : mini
        ? { left: "left-[30%]", right: "right-[30%]" }
        : { left: "left-[33%]", right: "right-[33%]" };

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
      <span className={cn(eye, inset.left)} />
      {/* 두 눈이 한 박자로 반짝이면 기계가 된다 — 오른쪽만 조금 늦게.
          정확히 반 박자를 늦추면 한쪽이 감긴 것처럼 보여, 그보다 짧게 어긋낸다. */}
      <span
        className={cn(eye, inset.right, mood === "spark" && "[animation-delay:0.5s]")}
      />
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
