"use client";

import type { Mood, StyleAxis } from "@identity-os/identity-core";
import {
  AxisBars,
  CATEGORY_ICONS,
  Chip,
  ChipRow,
  cn,
  iconSlot,
  surface,
} from "@identity-os/design-system";

export interface MoodCardProps {
  mood: Mood;
  /** 확정된 이름 — mood.name일 수도 mood.alt일 수도 있다 */
  moodName: string;
  axes: StyleAxis[];
  /** 무드의 표현 언어(옷차림·공간·말과 태도·곁에 두는 것)까지 펼칠지 */
  showCategories?: boolean;
}

/**
 * 무드 카드 — 이름·색·좌표로 무드를 눈에 보이게 한다.
 * 판정이 아니라 거울이다: 축 막대는 "당신은 이렇다"가 아니라 "당신이 고른 것들이 여기 있다".
 *
 * 쪽지 안에서는 카드가 한 겹 더 겹치지 않는다 — 무대는 팝업 하나뿐이므로
 * 표면(테두리·그림자·여백)은 두르지 않고 내용만 놓는다.
 */
export function MoodCard({
  mood,
  moodName,
  axes,
  showCategories = true,
}: MoodCardProps) {
  return (
    <>
      <div className="text-center">
        <p className="text-[18px] font-semibold">「{moodName}」</p>
        <p className="mt-1.5 text-support text-sub">{mood.tag}</p>
        <AxisBars axes={axes} className="mt-6.5" />
      </div>

      {showCategories && (
        <div className="mt-8.5 grid gap-3">
          {mood.categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.icon];
            return (
              <div
                className={cn(surface, "rounded-tile px-5 py-4.5")}
                key={category.name}
              >
                <div className="mb-2.5 flex items-center gap-2.5">
                  <span className={cn(iconSlot, "text-[28px]")}>
                    <Icon aria-hidden />
                  </span>
                  <span className="text-body font-semibold">
                    {category.name}
                  </span>
                </div>
                <ChipRow>
                  {category.chips.map((chip) => (
                    <Chip key={chip}>{chip}</Chip>
                  ))}
                </ChipRow>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
