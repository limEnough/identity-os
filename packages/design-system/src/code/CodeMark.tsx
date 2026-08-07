import { cn } from "../cn";
import { surface } from "../recipes";

export interface CodeSlot {
  /** 이 자리의 글자 — 아직 또렷하지 않으면 표식(·) */
  glyph: string;
  /** 문턱을 넘었는지 */
  settled: boolean;
}

/**
 * 나의 네 글자 — 축을 지날 때마다 한 자리씩 채워지는 표식.
 *
 * 처음엔 네 자리가 모두 비어 있고(`·`), 같은 방향의 축이 겹칠 때마다 하나씩 또렷해진다.
 * **진행률 바가 인격을 갖는 자리**다: 축 하나를 끝낼 때마다 눈에 보이는 것이 늘어난다.
 *
 * 흐릿함은 연출이 아니라 사실이라서, 채워지지 않은 자리는 비워둔 티가 나야 한다 —
 * 점선 테두리와 옅은 글자로. 판정을 미루고 있다는 표시이기도 하다.
 */
export function CodeMark({
  slots,
  size = "lg",
  className,
}: {
  slots: CodeSlot[];
  size?: "sm" | "lg";
  className?: string;
}) {
  const big = size === "lg";
  return (
    <div
      className={cn("flex justify-center", big ? "gap-2.5" : "gap-1.5", className)}
      aria-label={`나의 네 글자 ${slots.map((s) => s.glyph).join("")}`}
    >
      {slots.map((slot, i) => (
        <span
          key={i}
          className={cn(
            "inline-flex items-center justify-center rounded-tile font-extrabold tabular-nums",
            big ? "size-13 text-[26px]" : "size-8 text-body",
            slot.settled
              ? cn(surface, "text-chip")
              : "border border-dashed border-line bg-transparent text-sub/70",
          )}
        >
          {slot.glyph}
        </span>
      ))}
    </div>
  );
}
