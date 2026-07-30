import type { ButtonHTMLAttributes } from "react";
import { cn } from "../cn";
import { accentFill } from "../recipes";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost";
};

const base =
  "block w-full cursor-pointer rounded-btn p-[17px] text-body font-semibold transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5";

const variants = {
  solid: cn(accentFill, "text-white shadow-cta hover:shadow-cta-hover"),
  ghost: "border border-line bg-card text-sub shadow-ghost",
} as const;

/** 주 버튼(solid)과 물러선 버튼(ghost) — 여정을 잇는 단 하나의 눌림 */
export function Button({
  variant = "solid",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}

/**
 * 형태 없는 텍스트 버튼 — "넘어갈래요", "처음부터 다시 걷기".
 * 주 버튼과 나란히 놓이더라도 앞서지 않게, 밑줄만 옅게 두른다.
 */
export function SkipLink({
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "mx-auto block cursor-pointer text-caption text-sub underline decoration-line underline-offset-[3px] hover:text-accent",
        className,
      )}
      {...props}
    />
  );
}
