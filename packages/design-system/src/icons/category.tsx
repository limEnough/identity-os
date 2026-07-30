/**
 * 무드 카테고리 아이콘 넷 — 옷차림·공간·말과 태도·곁에 두는 것.
 * 그리는 문법은 svg-base.tsx에 모여 있다.
 */

import type { FC } from "react";
import { auraStops, blurs, glowStops, root, specStops, type IconProps } from "./svg-base";

/** 아이콘 이름 — identity-core의 MoodCategory.icon이 이 키를 가리킨다 */
export type CategoryIconName = "coat" | "window" | "chat" | "box";

const COAT_CLIP =
  "M100 44 C86 44 74 47 66 53 C50 61 38 78 32 100 C29 110 30 120 36 126 C44 132 54 130 58 122 C56 140 54 154 54 162 C54 168 58 172 64 172 L136 172 C142 172 146 168 146 162 C146 154 144 140 142 122 C146 130 156 132 164 126 C170 120 171 110 168 100 C162 78 150 61 134 53 C126 47 114 44 100 44 Z";

/** 옷차림 */
export const CoatIcon: FC<IconProps> = (props) => (
  <svg {...root} aria-label="coat" {...props}>
    <defs>
      <radialGradient id="coat-aura" cx="50%" cy="46%" r="52%">
        {auraStops()}
      </radialGradient>
      <radialGradient id="coat-g0" cx="26%" cy="16%" r="96%">
        <stop offset="0%" stopColor="var(--em-c1, #BFFDFF)" />
        <stop offset="48%" stopColor="var(--em-c2, #66DDF8)" />
        <stop offset="100%" stopColor="var(--em-c3, #4B85F2)" />
      </radialGradient>
      <radialGradient id="coat-g1" cx="22%" cy="14%" r="110%">
        <stop offset="0%" stopColor="var(--em-c2, #66DDF8)" />
        <stop offset="50%" stopColor="var(--em-c3, #4B85F2)" />
        <stop offset="100%" stopColor="var(--em-c4, #7A55E4)" />
      </radialGradient>
      <radialGradient id="coat-g2" cx="20%" cy="10%" r="120%">
        <stop offset="0%" stopColor="var(--em-c3, #4B85F2)" />
        <stop offset="48%" stopColor="var(--em-c4, #7A55E4)" />
        <stop offset="100%" stopColor="var(--em-c5, #5731B4)" />
      </radialGradient>
      <radialGradient id="coat-g3" cx="50%" cy="6%" r="110%">
        <stop offset="0%" stopColor="var(--em-c3, #4B85F2)" />
        <stop offset="48%" stopColor="var(--em-c4, #7A55E4)" />
        <stop offset="100%" stopColor="var(--em-c5, #5731B4)" />
      </radialGradient>
      <radialGradient id="coat-core" cx="50%" cy="50%" r="50%">
        {glowStops()}
      </radialGradient>
      <radialGradient id="coat-spec" cx="50%" cy="50%" r="50%">
        {specStops()}
      </radialGradient>
      {blurs("coat")}
      <clipPath id="coat-clip">
        <path d={COAT_CLIP} />
      </clipPath>
    </defs>

    {/* 1. 크게 블러된 오라 */}
    <ellipse
      cx="100"
      cy="106"
      rx="72"
      ry="72"
      fill="url(#coat-aura)"
      filter="url(#coat-auraBlur)"
    />

    {/* 2. 면 — 각 면마다 다른 톤의 라디얼 그라데이션 */}
    <g filter="url(#coat-faceBlur)">
      <path
        d="M100 46 C86 46 74 49 66 55 C58 70 56 94 56 118 C56 140 54 154 54 162 C54 168 58 172 64 172 L136 172 C142 172 146 168 146 162 C146 154 144 140 144 118 C144 94 142 70 134 55 C126 49 114 46 100 46 Z"
        fill="url(#coat-g0)"
      />
      <path
        d="M66 55 C50 62 38 78 32 100 C29 110 30 120 36 126 C44 132 54 130 58 122 C57 100 59 76 66 55 Z"
        fill="url(#coat-g1)"
      />
      <path
        d="M134 55 C150 62 162 78 168 100 C171 110 170 120 164 126 C156 132 146 132 142 122 C143 100 141 76 134 55 Z"
        fill="url(#coat-g2)"
      />
      <path
        d="M72 50 C80 72 89 88 100 100 C111 88 120 72 128 50 C119 46 110 44 100 44 C90 44 81 46 72 50 Z"
        fill="url(#coat-g3)"
      />
    </g>

    <g clipPath="url(#coat-clip)">
      {/* 3. 속빛 */}
      <ellipse
        cx="84"
        cy="92"
        rx="50"
        ry="50"
        fill="url(#coat-core)"
        filter="url(#coat-softBlur)"
      />
      {/* 4. 스페큘러 */}
      <ellipse
        cx="62"
        cy="68"
        rx="15"
        ry="30"
        fill="url(#coat-spec)"
        filter="url(#coat-softBlur)"
        transform="rotate(-28 62 68)"
        opacity=".55"
      />
    </g>
  </svg>
);

const WINDOW_FRAME =
  "M46 34 H154 A20 20 0 0 1 174 54 V146 A20 20 0 0 1 154 166 H46 A20 20 0 0 1 26 146 V54 A20 20 0 0 1 46 34 Z";

/** 공간 */
export const WindowIcon: FC<IconProps> = (props) => (
  <svg {...root} aria-label="window" {...props}>
    <defs>
      <radialGradient id="window-aura" cx="50%" cy="46%" r="52%">
        {auraStops()}
      </radialGradient>
      <radialGradient id="window-g0" cx="20%" cy="14%" r="105%">
        <stop offset="0%" stopColor="var(--em-c3, #4B85F2)" />
        <stop offset="48%" stopColor="var(--em-c4, #7A55E4)" />
        <stop offset="100%" stopColor="var(--em-c5, #5731B4)" />
      </radialGradient>
      <radialGradient id="window-g1" cx="22%" cy="18%" r="130%">
        <stop offset="0%" stopColor="var(--em-c1, #BFFDFF)" />
        <stop offset="48%" stopColor="var(--em-c2, #66DDF8)" />
        <stop offset="100%" stopColor="var(--em-c3, #4B85F2)" />
      </radialGradient>
      <radialGradient id="window-g2" cx="18%" cy="16%" r="130%">
        <stop offset="0%" stopColor="var(--em-c1, #BFFDFF)" />
        <stop offset="48%" stopColor="var(--em-c2, #66DDF8)" />
        <stop offset="100%" stopColor="var(--em-c3, #4B85F2)" />
      </radialGradient>
      <radialGradient id="window-g3" cx="22%" cy="14%" r="130%">
        <stop offset="0%" stopColor="var(--em-c1, #BFFDFF)" />
        <stop offset="48%" stopColor="var(--em-c2, #66DDF8)" />
        <stop offset="100%" stopColor="var(--em-c3, #4B85F2)" />
      </radialGradient>
      <radialGradient id="window-g4" cx="18%" cy="14%" r="130%">
        <stop offset="0%" stopColor="var(--em-c2, #66DDF8)" />
        <stop offset="50%" stopColor="var(--em-c3, #4B85F2)" />
        <stop offset="100%" stopColor="var(--em-c4, #7A55E4)" />
      </radialGradient>
      <radialGradient id="window-core" cx="50%" cy="50%" r="50%">
        {glowStops()}
      </radialGradient>
      <radialGradient id="window-spec" cx="50%" cy="50%" r="50%">
        {specStops()}
      </radialGradient>
      {blurs("window")}
      <clipPath id="window-clip">
        <path d={WINDOW_FRAME} />
      </clipPath>
    </defs>

    {/* 1. 크게 블러된 오라 */}
    <ellipse
      cx="100"
      cy="100"
      rx="74"
      ry="70"
      fill="url(#window-aura)"
      filter="url(#window-auraBlur)"
    />

    {/* 2. 면 — 창틀 하나와 네 장의 유리 */}
    <g filter="url(#window-faceBlur)">
      <path d={WINDOW_FRAME} fill="url(#window-g0)" />
      <path
        d="M49 50 H89 A7 7 0 0 1 96 57 V85 A7 7 0 0 1 89 92 H49 A7 7 0 0 1 42 85 V57 A7 7 0 0 1 49 50 Z"
        fill="url(#window-g1)"
      />
      <path
        d="M111 50 H151 A7 7 0 0 1 158 57 V85 A7 7 0 0 1 151 92 H111 A7 7 0 0 1 104 85 V57 A7 7 0 0 1 111 50 Z"
        fill="url(#window-g2)"
      />
      <path
        d="M49 108 H89 A7 7 0 0 1 96 115 V143 A7 7 0 0 1 89 150 H49 A7 7 0 0 1 42 143 V115 A7 7 0 0 1 49 108 Z"
        fill="url(#window-g3)"
      />
      <path
        d="M111 108 H151 A7 7 0 0 1 158 115 V143 A7 7 0 0 1 151 150 H111 A7 7 0 0 1 104 143 V115 A7 7 0 0 1 111 108 Z"
        fill="url(#window-g4)"
      />
    </g>

    <g clipPath="url(#window-clip)">
      {/* 3. 속빛 */}
      <ellipse
        cx="80"
        cy="84"
        rx="46"
        ry="46"
        fill="url(#window-core)"
        filter="url(#window-softBlur)"
      />
      {/* 4. 스페큘러 */}
      <ellipse
        cx="56"
        cy="58"
        rx="13"
        ry="26"
        fill="url(#window-spec)"
        filter="url(#window-softBlur)"
        transform="rotate(-28 56 58)"
        opacity=".55"
      />
    </g>
  </svg>
);

const CHAT_BUBBLE =
  "M100 36 C56 36 32 60 32 93 C32 120 48 141 74 149 C72 159 65 168 54 175 C74 176 93 167 103 152 C146 150 168 125 168 93 C168 60 144 36 100 36 Z";

/** 말과 태도 */
export const ChatIcon: FC<IconProps> = (props) => (
  <svg {...root} aria-label="chat" {...props}>
    <defs>
      <radialGradient id="chat-aura" cx="50%" cy="46%" r="52%">
        {auraStops()}
      </radialGradient>
      <radialGradient id="chat-g0" cx="28%" cy="20%" r="92%">
        <stop offset="0%" stopColor="var(--em-c1, #BFFDFF)" />
        <stop offset="28%" stopColor="var(--em-c2, #66DDF8)" />
        <stop offset="62%" stopColor="var(--em-c3, #4B85F2)" />
        <stop offset="100%" stopColor="var(--em-c4, #7A55E4)" />
      </radialGradient>
      <radialGradient id="chat-core" cx="50%" cy="50%" r="50%">
        {glowStops()}
      </radialGradient>
      <radialGradient id="chat-spec" cx="50%" cy="50%" r="50%">
        {specStops()}
      </radialGradient>
      {blurs("chat")}
      <clipPath id="chat-clip">
        <path d={CHAT_BUBBLE} />
      </clipPath>
    </defs>

    {/* 1. 크게 블러된 오라 */}
    <ellipse
      cx="100"
      cy="96"
      rx="74"
      ry="68"
      fill="url(#chat-aura)"
      filter="url(#chat-auraBlur)"
    />

    {/* 2. 면 — 말풍선 한 장 */}
    <g filter="url(#chat-faceBlur)">
      <path d={CHAT_BUBBLE} fill="url(#chat-g0)" />
    </g>

    <g clipPath="url(#chat-clip)">
      {/* 3. 속빛 */}
      <ellipse
        cx="82"
        cy="82"
        rx="52"
        ry="48"
        fill="url(#chat-core)"
        filter="url(#chat-softBlur)"
      />
      {/* 4. 스페큘러 */}
      <ellipse
        cx="62"
        cy="60"
        rx="16"
        ry="30"
        fill="url(#chat-spec)"
        filter="url(#chat-softBlur)"
        transform="rotate(-28 62 60)"
        opacity=".55"
      />
    </g>
  </svg>
);

const BOX_CLIP =
  "M115.60 38.98 L150.40 59.02 Q166.00 68.00 166.00 86.00 L166.00 118.00 Q166.00 136.00 150.40 144.98 L115.60 165.02 Q100.00 174.00 84.40 165.02 L49.60 144.98 Q34.00 136.00 34.00 118.00 L34.00 86.00 Q34.00 68.00 49.60 59.02 L84.40 38.98 Q100.00 30.00 115.60 38.98 Z";

/** 곁에 두는 것 */
export const BoxIcon: FC<IconProps> = (props) => (
  <svg {...root} aria-label="box" {...props}>
    <defs>
      <radialGradient id="box-aura" cx="50%" cy="46%" r="52%">
        {auraStops()}
      </radialGradient>
      <radialGradient id="box-g0" cx="32%" cy="22%" r="105%">
        <stop offset="0%" stopColor="var(--em-c1, #BFFDFF)" />
        <stop offset="48%" stopColor="var(--em-c2, #66DDF8)" />
        <stop offset="100%" stopColor="var(--em-c3, #4B85F2)" />
      </radialGradient>
      <radialGradient id="box-g1" cx="18%" cy="14%" r="115%">
        <stop offset="0%" stopColor="var(--em-c2, #66DDF8)" />
        <stop offset="50%" stopColor="var(--em-c3, #4B85F2)" />
        <stop offset="100%" stopColor="var(--em-c4, #7A55E4)" />
      </radialGradient>
      <radialGradient id="box-g2" cx="88%" cy="14%" r="120%">
        <stop offset="0%" stopColor="var(--em-c3, #4B85F2)" />
        <stop offset="48%" stopColor="var(--em-c4, #7A55E4)" />
        <stop offset="100%" stopColor="var(--em-c5, #5731B4)" />
      </radialGradient>
      <radialGradient id="box-core" cx="50%" cy="50%" r="50%">
        {glowStops()}
      </radialGradient>
      <radialGradient id="box-spec" cx="50%" cy="50%" r="50%">
        {specStops()}
      </radialGradient>
      {blurs("box")}
      <clipPath id="box-clip">
        <path d={BOX_CLIP} />
      </clipPath>
    </defs>

    {/* 1. 크게 블러된 오라 */}
    <ellipse
      cx="100"
      cy="102"
      rx="74"
      ry="74"
      fill="url(#box-aura)"
      filter="url(#box-auraBlur)"
    />

    {/* 2. 면 — 뚜껑 하나와 옆면 둘 */}
    <g filter="url(#box-faceBlur)">
      <g clipPath="url(#box-clip)">
        <path
          d="M111.27 36.49 L154.73 61.51 Q166.00 68.00 154.73 74.49 L111.27 99.51 Q100.00 106.00 88.73 99.51 L45.27 74.49 Q34.00 68.00 45.27 61.51 L88.73 36.49 Q100.00 30.00 111.27 36.49 Z"
          fill="url(#box-g0)"
        />
        <path
          d="M45.27 74.49 L88.73 99.51 Q100.00 106.00 100.00 119.00 L100.00 161.00 Q100.00 174.00 88.73 167.51 L45.27 142.49 Q34.00 136.00 34.00 123.00 L34.00 81.00 Q34.00 68.00 45.27 74.49 Z"
          fill="url(#box-g1)"
        />
        <path
          d="M166.00 81.00 L166.00 123.00 Q166.00 136.00 154.73 142.49 L111.27 167.51 Q100.00 174.00 100.00 161.00 L100.00 119.00 Q100.00 106.00 111.27 99.51 L154.73 74.49 Q166.00 68.00 166.00 81.00 Z"
          fill="url(#box-g2)"
        />
      </g>
    </g>

    <g clipPath="url(#box-clip)">
      {/* 3. 속빛 */}
      <ellipse
        cx="82"
        cy="78"
        rx="48"
        ry="44"
        fill="url(#box-core)"
        filter="url(#box-softBlur)"
      />
      {/* 4. 스페큘러 */}
      <ellipse
        cx="70"
        cy="56"
        rx="18"
        ry="32"
        fill="url(#box-spec)"
        filter="url(#box-softBlur)"
        transform="rotate(-28 70 56)"
        opacity=".55"
      />
    </g>
  </svg>
);

/** 이름 → 아이콘. MoodCategory.icon이 이 키를 들고 다닌다 */
export const CATEGORY_ICONS: Record<CategoryIconName, FC<IconProps>> = {
  coat: CoatIcon,
  window: WindowIcon,
  chat: ChatIcon,
  box: BoxIcon,
};
