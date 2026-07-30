"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  decodeSeq,
  encodeSeq,
  type ProgressStore,
} from "@identity-os/identity-core";

/**
 * 여정 한 축의 라우트 배선 — Identity·Style이 똑같이 쓴다.
 *
 * 원본 상태는 발자국 시퀀스 하나다. 걸음마다 URL(새로고침·공유)과
 * 브라우저 기억(재방문 이어걷기)에 같은 발자국을 이중 기록한다.
 * 걷는 중에는 replace로 덮어써 뒤로 가기가 걸음마다 쌓이지 않게 하고,
 * 완주 지점에서만 push로 한 칸 쌓는다.
 *
 * 주소 조각은 전부 문자열로 받는다 — 콜백의 정체성이 렌더마다 바뀌면
 * 완주 이펙트가 되풀이 실행되기 때문이다.
 *
 * @param param URL에서 이 축의 발자국을 담는 이름 — Identity는 i, Style은 s
 * @param carry 함께 실어 보내는 앞선 축의 발자국 (Style은 Identity의 i를 늘 들고 다닌다)
 */
export function useChainRoute({
  store,
  param,
  path,
  donePath,
  carry = "",
}: {
  store: ProgressStore;
  param: "i" | "s";
  path: string;
  donePath: string;
  carry?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSeq = useMemo(() => {
    const fromUrl = decodeSeq(searchParams.get(param));
    return fromUrl.length > 0 ? fromUrl : store.load();
    // 최초 마운트 시점만 필요 — 이후는 피처가 내부에서 이어간다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const query = useCallback(
    (seq: number[]) =>
      `${carry ? `${carry}&` : ""}${param}=${encodeSeq(seq)}`,
    [carry, param],
  );

  const onSeqChange = useCallback(
    (seq: number[]) => {
      store.save(seq);
      router.replace(`${path}?${query(seq)}`, { scroll: false });
    },
    [path, query, router, store],
  );

  const onComplete = useCallback(
    (seq: number[]) => {
      store.save(seq);
      router.push(`${donePath}?${query(seq)}`);
    },
    [donePath, query, router, store],
  );

  return { initialSeq, onSeqChange, onComplete };
}
