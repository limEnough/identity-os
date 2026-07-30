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
    label: "오늘 작성됨",
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
  "flex items-start gap-3.75 rounded-tile border bg-card px-5.25 py-4.75 text-left";

/**
 * 가이드북의 목차 — 여덟 축이 어디까지 왔는지 한눈에.
 * 낭독이 아니라 목차다: 내용은 쪽지를 펼쳐본 사람의 몫이고, 여기엔 한 줄만 둔다.
 */
export function GuideSections({ sections }: { sections: GuideSection[] }) {
  return (
    <div className="mt-9.5 grid gap-2.5">
      {sections.map((section) => {
        const tone = tones[section.tone];
        const inner = (
          <>
            <span className="w-5 flex-none pt-0.75 text-label font-semibold text-sub">
              {section.no}
            </span>
            <span className="min-w-0">
              <span className="text-body font-semibold">{section.name}</span>
              <span className={cn("mt-1.25 block text-caption", tone.body)}>
                {section.body}
              </span>
            </span>
            <span
              className={cn(
                "ml-auto flex-none rounded-lg px-2.25 py-1 text-label font-semibold tracking-[0.04em] whitespace-nowrap",
                tone.tag,
              )}
            >
              {tone.label}
            </span>
          </>
        );

        return section.onOpen ? (
          <button
            key={section.no}
            type="button"
            className={cn(shape, tone.card, surfaceLift, "w-full")}
            onClick={section.onOpen}
          >
            {inner}
          </button>
        ) : (
          <div key={section.no} className={cn(shape, tone.card)}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
