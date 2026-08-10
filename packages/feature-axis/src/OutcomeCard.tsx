"use client";

import type { AxisCoord, NamedOutcome } from "@identity-os/identity-core";
import {
  AxisBars,
  CATEGORY_ICONS,
  Chip,
  ChipRow,
  cn,
  iconSlot,
  surface,
} from "@identity-os/design-system";
import type { CategoryIconName } from "@identity-os/design-system";

export interface OutcomeCardProps {
  outcome: NamedOutcome;
  coords: AxisCoord[];
  /** 표현 언어 네 갈래까지 펼칠지 */
  showFacets?: boolean;
}

/**
 * 축 하나의 결과 카드 — 이름·결·좌표로 지금의 나를 눈에 보이게 한다.
 *
 * 판정이 아니라 거울이다: 축 막대는 "당신은 이렇다"가 아니라
 * "당신이 고른 것들이 여기 있다". 변주는 같은 8분면 안에서도 걸어온 길이
 * 달랐다는 표시다 — 뒤 축일수록 이 자리가 세밀해진다.
 *
 * 쪽지 안에서는 카드가 한 겹 더 겹치지 않는다 — 무대는 팝업 하나뿐이므로.
 */
export function OutcomeCard({
  outcome,
  coords,
  showFacets = true,
}: OutcomeCardProps) {
  return (
    <>
      <div className="text-center">
        <p className="text-[18px] font-semibold">「{outcome.name}」</p>
        {/* 이름은 혼자 놓이지 않는다 — 뜻은 언제나 쉬운 한 줄이 전한다 */}
        <p className="mt-1.5 text-support text-sub">{outcome.summary}</p>
        {outcome.variant && (
          <p className="mt-1 text-caption text-chip">{outcome.variant}</p>
        )}
        {coords.length > 0 && <AxisBars axes={coords} className="mt-6.5" />}
      </div>

      {/**
       * 잘 통하는 자리와 나를 힘들게 하는 자리.
       * 걷는 중에는 보여주지 않는다 — 자기 통보는 본인이 열어봤을 때만 안전하므로,
       * 가이드북의 쪽지를 펼쳐본 사람에게만 놓인다.
       */}
      {(outcome.fits.length > 0 || outcome.strains.length > 0) && (
        <div className="mt-8.5 grid gap-3">
          {outcome.fits.length > 0 && (
            <div className={cn(surface, "rounded-tile px-5 py-4.5")}>
              <p className="mb-2.5 text-body font-semibold">
                이런 자리에서 잘 통해요
              </p>
              <ul className="grid gap-1.5 text-support text-sub">
                {outcome.fits.map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
            </div>
          )}
          {outcome.strains.length > 0 && (
            <div className={cn(surface, "rounded-tile px-5 py-4.5")}>
              <p className="mb-2.5 text-body font-semibold">
                이런 자리에서는 힘들어져요
              </p>
              <ul className="grid gap-1.5 text-support text-sub">
                {outcome.strains.map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {showFacets && outcome.facets.length > 0 && (
        <div className="mt-8.5 grid gap-3">
          {outcome.facets.map((facet) => {
            // const Icon = CATEGORY_ICONS[facet.icon as CategoryIconName];
            return (
              <div
                className={cn(surface, "rounded-tile px-5 py-4.5")}
                key={facet.name}
              >
                <div className="mb-2.5 flex items-center gap-2.5">
                  {/* {Icon && (
                    <span className={cn(iconSlot, "text-[28px]")}>
                      <Icon aria-hidden />
                    </span>
                  )} */}
                  <span className="text-body font-semibold">{facet.name}</span>
                </div>
                <ChipRow>
                  {facet.chips.map((chip) => (
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
