"use client";

import { Suspense, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  axisById,
  axisHref,
  canWalk,
  footprintsFromQuery,
  guideHref,
  journeyQuery,
  journeyStep,
  walkJourney,
} from "@identity-os/identity-core";
import type { AxisDef, AxisId, Footprints } from "@identity-os/identity-core";
import { Brand } from "@identity-os/design-system";
import { AxisFlow } from "@identity-os/feature-axis";
import { axisStore, loadFootprints } from "./progress";

/**
 * 축 하나의 라우트 — 여덟 축이 이 컴포넌트 하나를 함께 쓴다.
 * (`/identity`, `/mindset`, … `/career` — 주소는 축 id 그대로)
 *
 * 여기가 **여정의 순서가 강제되는 지점**이다. 앞선 축이 완주되지 않았거나
 * 이미 뒤 축이 얹혀 있는 축을 다시 걸으려 하면 열리지 않고 이어 걸을 자리로 되돌린다.
 * 문서가 아니라 라우트에서 막는다 — 어떤 기능이 들어와도 순서는 불변식이므로.
 *
 * 원본 상태는 축마다 발자국 하나다. 걸음마다 URL(새로고침·공유)과
 * 브라우저 기억(재방문 이어걷기)에 이중 기록하고, 걷는 중에는 replace로 덮어써
 * 뒤로 가기가 걸음마다 쌓이지 않게 한다. 완주 지점에서만 push로 한 칸 쌓는다.
 */
function AxisScreen({ def }: { def: AxisDef }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /** 주소에 실려온 발자국이 우선, 없으면 브라우저 기억에서 */
  const footprints = useMemo<Footprints>(() => {
    const fromUrl = footprintsFromQuery((p) => searchParams.get(p));
    return Object.keys(fromUrl).length > 0 ? fromUrl : loadFootprints();
    // 최초 마운트 시점만 필요 — 이후는 피처가 내부에서 이어간다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const journey = useMemo(() => walkJourney(footprints), [footprints]);
  const step = journeyStep(journey, def.id);
  const allowed = canWalk(journey, def.id);

  // 순서를 어긴 채로 들어왔으면 이어 걸을 자리로 되돌린다
  useEffect(() => {
    if (allowed) return;
    const front = journey.current;
    router.replace(
      front ? axisHref(front, footprints) : guideHref(footprints),
    );
  }, [allowed, journey.current, footprints, router]);

  /** 이 축의 새 발자국을 얹은 채, 걸어온 축 전부를 주소에 싣는다 */
  const query = useCallback(
    (seq: number[]) => journeyQuery({ ...footprints, [def.id]: seq }),
    [footprints, def.id],
  );

  const store = useMemo(() => axisStore(def), [def]);

  const onSeqChange = useCallback(
    (seq: number[]) => {
      store.save(seq);
      router.replace(`/${def.id}?${query(seq)}`, { scroll: false });
    },
    [def.id, query, router, store],
  );

  const onComplete = useCallback(
    (seq: number[]) => {
      store.save(seq);
      // 축을 끝내면 가이드북으로 — 다음 축은 거기서 열린다(여정의 순서)
      router.push(`/guide?${query(seq)}`);
    },
    [query, router, store],
  );

  if (!allowed) return null;

  return (
    <main>
      <Brand>{def.brand}</Brand>
      <AxisFlow
        def={def}
        profile={step.profile}
        initialSeq={step.seq}
        onSeqChange={onSeqChange}
        onComplete={onComplete}
        // 걸음마다 이미 브라우저에 적혀 있으므로(onSeqChange) 나가기만 하면 된다 —
        // 인트로가 발자국을 되짚어 「이어서 걷기」를 내민다
        onPause={() => router.push("/")}
      />
    </main>
  );
}

/**
 * 축은 **id로만** 건너온다 — 축 데이터에는 함수(코치 발화 빌더)가 들어 있어서
 * 서버 컴포넌트에서 그대로 넘기면 직렬화되지 않는다. 라우트 파일은 이름만 알려주고,
 * 데이터는 클라이언트 경계 안에서 찾는다.
 */
export function AxisRoute({ id }: { id: AxisId }) {
  const def = axisById(id);
  if (!def) return null;
  return (
    <Suspense>
      <AxisScreen def={def} />
    </Suspense>
  );
}
