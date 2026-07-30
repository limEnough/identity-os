"use client";

import { Suspense, useMemo } from "react";
import { Brand } from "@identity-os/design-system";
import { IdentityFlow } from "@identity-os/feature-identity";
import { identityStore } from "../_lib/progress";
import { useChainRoute } from "../_lib/useChainRoute";

/**
 * Identity 라우트 — /identity?i=발자국
 * 라우팅과 저장은 앱 셸이 맡고, 피처는 걸음만 걷는다.
 */
function IdentityRoute() {
  const store = useMemo(() => identityStore(), []);
  const chain = useChainRoute({
    store,
    param: "i",
    path: "/identity",
    donePath: "/guide",
  });

  return (
    <main>
      <Brand>IDENTITY · 나를 가다듬는 중</Brand>
      <IdentityFlow {...chain} />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <IdentityRoute />
    </Suspense>
  );
}
