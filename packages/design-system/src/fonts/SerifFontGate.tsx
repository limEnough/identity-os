"use client";

import { useEffect } from "react";

/** 손글씨 서체가 준비되면 html에 붙는 표식 — 그 전까지 <Serif />는 그려지지 않는다 */
const SERIF_READY = "serif-ready";
/** 서체가 끝내 오지 않아도 문장은 읽혀야 한다 — 이만큼 기다렸으면 폴백으로라도 내보낸다 */
const SERIF_TIMEOUT = 6000;
/** 첫 화면 렌더와 3MB 다운로드가 대역폭을 두고 다투지 않도록 잠시 뒤에 시작한다 */
const SERIF_DELAY = 1200;

/**
 * 손글씨 서체의 등장 시점을 붙잡아 두는 문지기 — 레이아웃에 한 번만 놓는다.
 *
 * '나의 문장' 서체(나눔손글씨 달의궤도)는 woff2 없이 3MB짜리 woff 한 벌뿐이다.
 * 게다가 웹폰트는 그 글자가 실제로 그려질 때에야 받아오기 시작한다 —
 * 그래서 아무것도 안 하면 폴백으로 한 번 조판됐다가 손글씨로 갈아끼워지는
 * 장면이 사용자에게 그대로 보인다.
 *
 * 여기서 미리 받아두고, 다 받은 뒤에야 문장을 내보낸다(스타일은 serif-ready 변이 쪽에).
 */
export function SerifFontGate() {
  useEffect(() => {
    const root = document.documentElement;
    const reveal = () => root.classList.add(SERIF_READY);

    if (!document.fonts) {
      reveal();
      return;
    }

    // 어떤 서체를 기다릴지는 디자인 토큰이 정한다 — 목록이 바뀌어도 여기는 그대로
    const stack =
      getComputedStyle(root).getPropertyValue("--font-serif").trim() || "serif";

    const timer = window.setTimeout(reveal, SERIF_TIMEOUT);
    const kickoff = window.setTimeout(() => {
      document.fonts
        .load(`1em ${stack}`, "가")
        .catch(() => {})
        .finally(() => {
          window.clearTimeout(timer);
          reveal();
        });
    }, SERIF_DELAY);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(kickoff);
    };
  }, []);

  return null;
}
