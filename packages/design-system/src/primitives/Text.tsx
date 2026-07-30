import { Fragment, type ReactNode } from "react";
import { cn } from "../cn";
import { overline } from "../recipes";

/** 여정의 머리표 — IDENTITY OS · MY LIFE GUIDE */
export function Brand({ children }: { children: ReactNode }) {
  return (
    <p className={cn(overline, "mb-7.5 text-center tracking-[0.28em]")}>
      {children}
    </p>
  );
}

/** 화면의 물음 — 한 화면에 하나뿐이다 */
export function Heading({
  as: Tag = "h1",
  children,
}: {
  as?: "h1" | "h2";
  children: ReactNode;
}) {
  return (
    <Tag className="text-center text-display font-extrabold">{children}</Tag>
  );
}

/**
 * 물음에 딸린 한 줄 — 정답 없음을 알리는 자리.
 * @param tight 물음 바로 아래에 붙일 때 (갈림길의 부제)
 */
export function Desc({
  tight = false,
  children,
}: {
  tight?: boolean;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        tight ? "mt-2" : "mt-4.5",
        "text-center text-support text-sub",
      )}
    >
      {children}
    </p>
  );
}

/** 더 작고 더 조용한 한 줄 — 여백은 놓는 자리가 정한다 */
export function Note({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p className={cn("text-center text-caption text-sub", className)}>
      {children}
    </p>
  );
}

/**
 * 자간을 벌린 작은 라벨 — 무엇을 보고 있는지만 알린다.
 * @param tight 딸린 칸의 머리표처럼 조금 덜 벌릴 때
 */
export function Overline({
  tight = false,
  className,
  children,
}: {
  tight?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        overline,
        tight ? "tracking-[0.18em]" : "tracking-[0.28em]",
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * 손글씨로 쓰인 글 — '나의 문장' 한 곳에만.
 *
 * 서체가 도착하기 전엔 그리지 않는다: 폴백으로 한 번 조판됐다가 갈아끼워지는
 * 장면을 감추기 위해서다. 자리는 차지한 채 투명하게만 두므로 레이아웃은 흔들리지 않는다.
 * 표식(html.serif-ready)을 붙이는 건 <SerifFontGate />.
 */
export function Serif({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "font-serif text-quote tracking-[0.01em] opacity-0 transition-opacity duration-450 serif-ready:opacity-100",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** 줄바꿈이 담긴 글을 <br />로 펼친다 — 질문·코치 발화·문장이 함께 쓴다 */
export function Lines({ of }: { of: readonly string[] }) {
  return (
    <>
      {of.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}
