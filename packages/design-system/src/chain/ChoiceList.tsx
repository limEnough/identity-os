import { cn } from "../cn";
import { surface, surfaceLift } from "../recipes";
import type { ChainOptionView } from "./types";

/** 갈림길의 선택지들 — 앞선 걸음일수록 갈래가 많고(예닐곱), 뒤로 갈수록 줄어든다 */
export function ChoiceList({
  options,
  onChoose,
}: {
  options: ChainOptionView[];
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
          <span className="min-w-0">
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
