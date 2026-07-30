import { cn } from "../cn";
import { accentFill } from "../recipes";

/**
 * 걸어온 걸음 — 숫자도 퍼센트도 쓰지 않는다.
 * 남은 길이 몇 걸음인지만 조용히 보여주는 점들.
 */
export function StepDots({
  total,
  current,
}: {
  total: number;
  /** 지금 서 있는 걸음(0부터) — 여기까지의 점이 켜진다 */
  current: number;
}) {
  return (
    <div className="mb-9 flex justify-center gap-1.75">
      {Array.from({ length: total }, (_, i) => (
        <i
          key={i}
          className={cn(
            accentFill,
            "size-1.5 rounded-full shadow-knob",
            i <= current ? "opacity-100" : "opacity-25",
          )}
        />
      ))}
    </div>
  );
}
