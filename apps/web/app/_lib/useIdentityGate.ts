"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 불변식 "Identity → Style"이 강제되는 지점.
 *
 * Identity를 완주하지 않은 발자국으로는 무드 체인도 가이드북도 열리지 않고
 * 인트로로 되돌아간다. 문서가 아니라 라우트에서 막는다 —
 * 어떤 기능이 들어와도 잠금 순서는 불변식이므로.
 *
 * @param done Identity 발자국이 완주 상태인지
 * @returns 되돌리는 중이면 true — 화면은 아무것도 그리지 않는다
 */
export function useIdentityGate(done: boolean): boolean {
  const router = useRouter();

  useEffect(() => {
    if (!done) router.replace("/");
  }, [done, router]);

  return !done;
}
