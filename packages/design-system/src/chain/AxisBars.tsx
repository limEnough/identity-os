import { cn } from "../cn";
import { accentFill } from "../recipes";

export interface AxisView {
  /** 음(−) 방향의 이름 — 막대의 왼쪽 끝 */
  left: string;
  /** 양(+) 방향의 이름 — 막대의 오른쪽 끝 */
  right: string;
  /** 0(완전히 왼쪽) ~ 1(완전히 오른쪽) */
  pos: number;
}

/**
 * 무드 좌표의 축 막대 — 판정이 아니라 거울이다.
 * "당신은 이렇다"가 아니라 "당신이 고른 것들이 여기 있다".
 * 가운데 눈금은 중립(넘어간 걸음이 머무는 자리)을 표시한다.
 */
export function AxisBars({
  axes,
  className,
}: {
  axes: AxisView[];
  className?: string;
}) {
  return (
    <div className={cn("text-left", className)}>
      {axes.map((axis) => (
        <div className="mb-3.5" key={axis.left}>
          <div className="mb-1.25 flex justify-between text-label font-semibold text-sub">
            <span>{axis.left}</span>
            <span>{axis.right}</span>
          </div>
          <div className="relative h-2 rounded-full bg-line before:absolute before:top-[-2px] before:bottom-[-2px] before:left-1/2 before:w-[1.5px] before:bg-tick before:content-['']">
            <i
              className={cn(
                accentFill,
                "absolute top-[-3px] size-3.5 -translate-x-1/2 rounded-full border-[2.5px] border-white shadow-knob transition-[left] duration-600",
              )}
              style={{ left: `${axis.pos * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
