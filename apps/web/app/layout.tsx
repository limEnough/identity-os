import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppShell, Aurora, SerifFontGate } from "@identity-os/design-system";
import { NavProvider } from "./_components/Navigating";
import "@identity-os/design-system/styles.css";

export const metadata: Metadata = {
  title: "Identity OS — 나는 어떤 사람인가요?",
  description:
    "내 안에는 어떤 요소들이 있는지 선택하고 이름 붙여가며 나를 가다듬는 여정",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* 나눔손글씨 '달의궤도' — '나의 문장' 전용 서체 */}
        <link
          rel="stylesheet"
          href="https://hangeul.pstatic.net/hangeul_static/css/NanumDarEuiGweDo.css"
        />
        {/* 폴백: 마루 부리 */}
        <link
          rel="stylesheet"
          href="https://hangeul.pstatic.net/hangeul_static/css/maru-buri.css"
        />
      </head>
      <body>
        {/* 여정 초입에 손글씨 서체를 미리 받아둔다 — 문장이 쓰이는 건 한참 뒤이므로 */}
        <SerifFontGate />
        <Aurora />
        {/* 가림막은 AppShell 밖에 — 폭에 갇히지 않고 화면을 통째로 덮어야 하므로 */}
        <NavProvider>
          <AppShell>{children}</AppShell>
        </NavProvider>
      </body>
    </html>
  );
}
