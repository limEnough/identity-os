"use client";

import { useEffect } from "react";

/**
 * 팝업이 떠 있는 동안 뒤 페이지를 붙잡아 둔다.
 *
 * overflow:hidden만으로는 iOS Safari에서 터치 스크롤이 그대로 샌다.
 * body를 붙박이(fixed)로 만들고 스크롤 위치를 top에 옮겨 담았다가,
 * 풀 때 그 자리로 되돌려 놓는 방식이라 어디서든 확실하게 멈춘다.
 *
 * 스크롤바가 사라지며 생기는 가로 밀림은 html의 scrollbar-gutter가 막는다.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const { body } = document;
    const y = window.scrollY;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
    };

    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = "0";
    body.style.right = "0";

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      window.scrollTo(0, y);
    };
  }, [locked]);
}
