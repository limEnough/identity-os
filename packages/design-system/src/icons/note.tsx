/**
 * 접어둔 쪽지 — 완성된 결과 하나를 품고 있다.
 * 그리는 문법은 svg-base.tsx에 모여 있다.
 */

import type { FC } from "react";
import { auraStops, blurs, glowStops, root, specStops, type IconProps } from "./svg-base";

const NOTE_CLIP =
  "M71.00 32.00 L129.00 32.00 Q142.00 32.00 142.00 45.00 L142.00 99.00 Q142.00 112.00 129.00 112.00 L71.00 112.00 Q58.00 112.00 58.00 99.00 L58.00 45.00 Q58.00 32.00 71.00 32.00 Z M81.00 92.00 L101.00 92.00 Q112.00 92.00 118.97 100.51 L159.03 149.49 Q166.00 158.00 155.00 158.00 L135.00 158.00 Q124.00 158.00 117.03 149.49 L76.97 100.51 Q70.00 92.00 81.00 92.00 Z M99.00 92.00 L119.00 92.00 Q130.00 92.00 123.03 100.51 L82.97 149.49 Q76.00 158.00 65.00 158.00 L45.00 158.00 Q34.00 158.00 40.97 149.49 L81.03 100.51 Q88.00 92.00 99.00 92.00 Z";

/**
 * 접어둔 쪽지 — 완성된 결과 하나를 품고 있다.
 *
 * @param idPrefix 한 화면에 **서로 다른 색**의 쪽지를 둘 이상 놓을 때 반드시 갈라 준다.
 *   SVG의 `url(#…)`는 문서에서 처음 만난 id를 쓰므로, 같은 접두사를 쓰는 두 아이콘은
 *   앞선 것의 그라데이션(과 그 위에 얹힌 --em-* 변수)을 함께 뒤집어쓴다.
 */
export const NoteIcon: FC<IconProps & { idPrefix?: string }> = ({
  idPrefix: p = "note",
  ...props
}) => (
  <svg {...root} aria-label="note" {...props}>
    <defs>
      <radialGradient id={`${p}-aura`} cx="50%" cy="46%" r="52%">
        {auraStops()}
      </radialGradient>
      <radialGradient id={`${p}-g0`} cx="18%" cy="4%" r="130%">
        <stop offset="0%" stopColor="var(--em-c3, #4B85F2)" />
        <stop offset="48%" stopColor="var(--em-c4, #7A55E4)" />
        <stop offset="100%" stopColor="var(--em-c5, #5731B4)" />
      </radialGradient>
      <radialGradient id={`${p}-g1`} cx="30%" cy="4%" r="125%">
        <stop offset="0%" stopColor="var(--em-c2, #66DDF8)" />
        <stop offset="50%" stopColor="var(--em-c3, #4B85F2)" />
        <stop offset="100%" stopColor="var(--em-c4, #7A55E4)" />
      </radialGradient>
      <radialGradient id={`${p}-g2`} cx="30%" cy="30%" r="120%">
        <stop offset="0%" stopColor="var(--em-c1, #BFFDFF)" />
        <stop offset="48%" stopColor="var(--em-c2, #66DDF8)" />
        <stop offset="100%" stopColor="var(--em-c3, #4B85F2)" />
      </radialGradient>
      <radialGradient id={`${p}-g3`} cx="90%" cy="20%" r="130%">
        <stop offset="0%" stopColor="var(--em-c2, #66DDF8)" />
        <stop offset="50%" stopColor="var(--em-c3, #4B85F2)" />
        <stop offset="100%" stopColor="var(--em-c4, #7A55E4)" />
      </radialGradient>
      <radialGradient id={`${p}-g4`} cx="40%" cy="90%" r="130%">
        <stop offset="0%" stopColor="var(--em-c3, #4B85F2)" />
        <stop offset="48%" stopColor="var(--em-c4, #7A55E4)" />
        <stop offset="100%" stopColor="var(--em-c5, #5731B4)" />
      </radialGradient>
      <radialGradient id={`${p}-g5`} cx="10%" cy="26%" r="130%">
        <stop offset="0%" stopColor="var(--em-c2, #66DDF8)" />
        <stop offset="50%" stopColor="var(--em-c3, #4B85F2)" />
        <stop offset="100%" stopColor="var(--em-c4, #7A55E4)" />
      </radialGradient>
      <radialGradient id={`${p}-core`} cx="50%" cy="50%" r="50%">
        {glowStops()}
      </radialGradient>
      <radialGradient id={`${p}-spec`} cx="50%" cy="50%" r="50%">
        {specStops()}
      </radialGradient>
      {blurs(p)}
      <clipPath id={`${p}-clip`}>
        <path d={NOTE_CLIP} />
      </clipPath>
    </defs>

    {/* 1. 크게 블러된 오라 */}
    <ellipse
      cx="100"
      cy="96"
      rx="74"
      ry="74"
      fill={`url(#${p}-aura)`}
      filter={`url(#${p}-auraBlur)`}
    />

    {/* 2. 면 — 접힌 자국 넷과 리본 다리 둘 */}
    <g filter={`url(#${p}-faceBlur)`}>
      <g clipPath={`url(#${p}-clip)`}>
        <path
          d="M81.00 92.00 L101.00 92.00 Q112.00 92.00 118.97 100.51 L159.03 149.49 Q166.00 158.00 155.00 158.00 L135.00 158.00 Q124.00 158.00 117.03 149.49 L76.97 100.51 Q70.00 92.00 81.00 92.00 Z"
          fill={`url(#${p}-g0)`}
        />
        <path
          d="M99.00 92.00 L119.00 92.00 Q130.00 92.00 123.03 100.51 L82.97 149.49 Q76.00 158.00 65.00 158.00 L45.00 158.00 Q34.00 158.00 40.97 149.49 L81.03 100.51 Q88.00 92.00 99.00 92.00 Z"
          fill={`url(#${p}-g1)`}
        />
        <path d="M58 32 L142 32 L100 72 Z" fill={`url(#${p}-g2)`} />
        <path d="M142 32 L142 112 L100 72 Z" fill={`url(#${p}-g3)`} />
        <path d="M142 112 L58 112 L100 72 Z" fill={`url(#${p}-g4)`} />
        <path d="M58 112 L58 32 L100 72 Z" fill={`url(#${p}-g5)`} />
      </g>
    </g>

    <g clipPath={`url(#${p}-clip)`}>
      {/* 3. 속빛 */}
      <ellipse
        cx="80"
        cy="62"
        rx="46"
        ry="44"
        fill={`url(#${p}-core)`}
        filter={`url(#${p}-softBlur)`}
      />
      {/* 4. 스페큘러 */}
      <ellipse
        cx="70"
        cy="44"
        rx="15"
        ry="26"
        fill={`url(#${p}-spec)`}
        filter={`url(#${p}-softBlur)`}
        transform="rotate(-28 70 44)"
        opacity=".55"
      />
    </g>
  </svg>
);
