"use client";

import { accentFill, cn, surfaceLift } from "@identity-os/design-system";

/** 여덟 섹션이 가질 수 있는 상태 — 채워짐 · 잠김 · 방금 열림 */
type Tone = "filled" | "locked" | "open";

export interface GuideSection {
  no: string;
  name: string;
  body: string;
  tone: Tone;
  /** 열린 섹션만 눌러서 걸어 들어간다 */
  onOpen?: () => void;
  /** 걸어온 섹션의 결과를 펼친다 — 결과가 있는 축에만 붙는다 */
  onResult?: () => void;
}

/**
 * 상태가 카드의 결·본문 색·꼬리표를 한꺼번에 정한다.
 * 테두리색과 그림자는 상태가 통째로 갖는다 — 같은 속성의 유틸리티가 겹치면
 * 승자를 문자열 순서로 정할 수 없기 때문.
 */
const tones: Record<
  Tone,
  { card: string; body: string; tag: string; label: string }
> = {
  filled: {
    card: "border-rim shadow-filled",
    body: "text-chip",
    tag: "bg-tint text-chip",
    label: "작성됨",
  },
  locked: {
    card: "border-line opacity-55",
    body: "text-sub",
    tag: "border border-line text-sub",
    label: "다음",
  },
  open: {
    card: "border-line shadow-soft",
    body: "text-sub",
    tag: cn(accentFill, "text-white shadow-tag"),
    label: "방금 열림",
  },
};

const shape =
  "flex items-center gap-3.75 rounded-tile border bg-card px-5.25 py-4.75 text-left";

const tagShape =
  "ml-auto flex-none rounded-lg px-2.25 py-1 text-label font-semibold tracking-[0.04em] whitespace-nowrap";

/**
 * 가이드북의 목차 — 여덟 축이 어디까지 왔는지 한눈에.
 *
 * 낭독이 아니라 목차다: 한 줄만 두고, 결과는 **여기서 펼친다.** 한때 결과가
 * 쪽지 서랍에 따로 쌓였는데, 걸어온 축이 늘수록 쪽지가 늘어나 목차와 서랍이
 * 같은 것을 두 번 말했다. 결과는 그 축의 자리에서 열리는 게 맞다.
 */
export function GuideSections({ sections }: { sections: GuideSection[] }) {
  return (
    <div className="mt-9.5 grid gap-2.5">
      {sections.map((section) => {
          const tone = tones[section.tone];
          const inner = (
            <>
              <span className="w-5 flex-none self-start pt-0.75 text-label font-semibold text-sub">
                {section.no}
              </span>
              <span className="min-w-0">
                <span className="text-body font-semibold">{section.name}</span>
                <span className={cn("mt-1.25 block text-caption", tone.body)}>
                  {section.body}
                </span>
              </span>
            </>
          );

          // 걸어 들어가는 카드는 통째로 버튼이다 — 그 안에 또 버튼을 둘 수는 없다.
          // 다행히 '방금 열림'과 '결과 있음'은 같은 카드에서 겹치지 않는다.
          if (section.onOpen) {
            return (
              <button
                key={section.no}
                type="button"
                className={cn(shape, tone.card, surfaceLift, "w-full")}
                onClick={section.onOpen}
              >
                {inner}
                <span className={cn(tagShape, tone.tag)}>{tone.label}</span>
              </button>
            );
          }

          return (
            <div key={section.no} className={cn(shape, tone.card)}>
              {inner}
              {section.onResult ? (
                <button
                  type="button"
                  className={cn(
                    "ml-auto flex-none rounded-btn border border-chip-line bg-tint px-3.5 py-2.5 text-caption font-semibold whitespace-nowrap text-chip",
                    surfaceLift,
                  )}
                  onClick={section.onResult}
                >
                  결과 보기
                </button>
              ) : (
                <span className={cn(tagShape, tone.tag)}>{tone.label}</span>
              )}
            </div>
          );
        })}
    </div>
  );
}
