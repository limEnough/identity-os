"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { decodeSeq, replayIdentity } from "@identity-os/identity-core";
import { Brand } from "@identity-os/design-system";
import { StyleFlow } from "@identity-os/feature-style";
import { styleStore } from "../_lib/progress";
import { useChainRoute } from "../_lib/useChainRoute";
import { useIdentityGate } from "../_lib/useIdentityGate";

/**
 * Style 라우트 — /style?i=Identity발자국&s=무드발자국
 *
 * 불변식 "Identity → Style"이 강제되는 지점: Identity가 완주되지 않은 발자국으로는
 * 이 화면이 열리지 않는다(useIdentityGate). 스키마가 아니라 라우트에서 막는다.
 */
function StyleRoute() {
  const searchParams = useSearchParams();
  const identitySeq = searchParams.get("i") ?? "";
  const identity = useMemo(
    () => replayIdentity(decodeSeq(identitySeq)),
    [identitySeq],
  );

  const store = useMemo(() => styleStore(), []);
  const chain = useChainRoute({
    store,
    param: "s",
    path: "/style",
    donePath: "/guide",
    carry: `i=${identitySeq}`,
  });

  const redirecting = useIdentityGate(identity.done);
  if (redirecting) return null;

  return (
    <main>
      <Brand>STYLE · 겉으로 드러내는 중</Brand>
      <StyleFlow value={identity.state.value ?? ""} {...chain} />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <StyleRoute />
    </Suspense>
  );
}
