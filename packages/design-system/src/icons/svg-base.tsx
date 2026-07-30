/**
 * 아이콘들이 함께 쓰는 뿌리 — 오브와 같은 문법으로 그린다:
 *   1) 크게 블러된 오라 → 2) 면 → 3) 속빛 → 4) 스페큘러
 *
 * 색은 var(--em-*)로 열어두고 폴백을 박아뒀다 — 변수를 정의하면 무드마다 다른 톤으로 물든다.
 * 인라인 SVG인 이유가 그것이다: <img>로 부르면 CSS 변수가 문서 경계를 넘지 못한다.
 */

import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

/** 모든 아이콘이 공유하는 뿌리 속성 — 크기는 font-size(1em)가 정한다 */
export const root = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 200 200",
  width: "1em",
  height: "1em",
  fill: "none",
  role: "img",
} as const;

/** 아이콘마다 다른 것은 id 접두사뿐인 공통 그라데이션 — 오라·속빛·스페큘러 */
export function auraStops() {
  return (
    <>
      <stop offset="0%" stopColor="var(--em-a1, #7DF9FF)" stopOpacity=".80" />
      <stop offset="42%" stopColor="var(--em-a2, #6FA8FF)" stopOpacity=".50" />
      <stop offset="100%" stopColor="var(--em-a3, #C0A8FF)" stopOpacity="0" />
    </>
  );
}

export function glowStops() {
  return (
    <>
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity=".40" />
      <stop offset="55%" stopColor="#EAFBFF" stopOpacity=".15" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
    </>
  );
}

export function specStops() {
  return (
    <>
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity=".85" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
    </>
  );
}

/** 블러 삼종 — 오라(15) · 면(1.5) · 속빛(5) */
export function blurs(p: string) {
  return (
    <>
      <filter
        id={`${p}-auraBlur`}
        x="-60%"
        y="-60%"
        width="220%"
        height="220%"
        colorInterpolationFilters="sRGB"
      >
        <feGaussianBlur stdDeviation="15" />
      </filter>
      <filter
        id={`${p}-faceBlur`}
        x="-25%"
        y="-25%"
        width="150%"
        height="150%"
        colorInterpolationFilters="sRGB"
      >
        <feGaussianBlur stdDeviation="1.5" />
      </filter>
      <filter
        id={`${p}-softBlur`}
        x="-40%"
        y="-40%"
        width="180%"
        height="180%"
        colorInterpolationFilters="sRGB"
      >
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </>
  );
}
