import { cn } from "../cn";
import { quoteBar, surface, surfaceLift } from "../recipes";
import type { ChainOptionView } from "./types";

/**
 * 갈림길의 선택지들 — 한 화면에 셋 또는 넷.
 *
 * @param quoted 실천·표현처럼 '내가 하기로 한 것'을 고르는 걸음이면 왼쪽 인용 막대로 묶는다
 */
export function ChoiceList({
  options,
  quoted = false,
  onChoose,
}: {
  options: ChainOptionView[];
  quoted?: boolean;
  onChoose: (choice: number) => void;
}) {
  return (
    <div className="mt-8.5 grid gap-3">
      {options.map((option) => (
        <button
          key={option.choice}
          type="button"
          className={cn(
            surface,
            surfaceLift,
            "flex items-center gap-3.5 rounded-tile px-5.25 py-4.75 text-left",
          )}
          onClick={() => onChoose(option.choice)}
        >
          {option.emoji && (
            <span
              className="flex size-11 flex-none items-center justify-center rounded-[13px] bg-tint text-[24px]"
              aria-hidden
            >
              {option.emoji}
            </span>
          )}
          <span className={cn("min-w-0", quoted && quoteBar)}>
            <span className="block text-body font-semibold">
              {option.title}
            </span>
            {option.sub && (
              <span className="mt-1 block text-caption text-sub">
                {option.sub}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
