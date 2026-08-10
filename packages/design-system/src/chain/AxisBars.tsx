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
 *
 * 막대는 제 판 위에 놓인다. 양 끝의 이름("머무는 생각 ↔ 움직이는 생각")이 카드나
 * 화면의 가장자리에 그대로 붙으면 읽는 눈이 갈 곳을 잃고, 손잡이가 0%나 100%에
 * 섰을 때는 잘린 것처럼 보이기까지 한다. 그래서 좌우로 숨 쉴 자리를 두고,
 * 흰 카드 위에서도 한 덩어리로 읽히도록 판에는 옅은 색을 깐다.
 */
export function AxisBars({
  axes,
  className,
}: {
  axes: AxisView[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-3.5 rounded-tile bg-tint/70 px-5 py-4.5 text-left",
        className,
      )}
    >
      {axes.map((axis) => (
        <div key={axis.left}>
          <div className="mb-1.25 flex justify-between text-label font-semibold text-sub">
            <span>{axis.left}</span>
            <span>{axis.right}</span>
          </div>
          {/* 판이 색을 가지므로 홈은 흰색이어야 눈금과 손잡이가 또렷하게 선다 */}
          <div className="relative h-2 rounded-full bg-white before:absolute before:top-[-2px] before:bottom-[-2px] before:left-1/2 before:w-[1.5px] before:bg-tick before:content-['']">
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
