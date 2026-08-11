"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Orb } from "@identity-os/design-system";

/**
 * 화면이 바뀌는 동안 덮이는 가림막.
 *
 * 여정의 화면들은 서로 모양이 아주 달라서(물음 하나짜리 선택 화면과 목차·쪽지가
 * 쌓인 가이드북) 뼈대(skeleton)를 미리 그려두면 실제와 어긋난 그림이 먼저 보인다.
 * 그래서 자리를 흉내 내는 대신 **기다리는 중이라는 사실 하나만** 보여준다 —
 * 이미 이 앱의 얼굴인 오브가 숨 쉬는 것으로.
 *
 * 두 가지를 지킨다.
 *  1. **빠른 전환에는 뜨지 않는다.** 곧바로 바뀌는 화면에 가림막이 한 번 깜빡이면
 *     느려 보이지 않던 것도 느려 보인다. 문턱(`GRACE`)을 넘겨야 나타난다.
 *  2. **누르는 것을 막는다.** 전환 중의 두 번째 누름은 대개 같은 버튼을 다시 누르는
 *     것이라, 막지 않으면 뒤로 가기에 같은 화면이 두 번 쌓인다.
 */

/** 이 시간 안에 끝나는 전환에는 가림막을 띄우지 않는다 */
const GRACE = 180;

const GoContext = createContext<(href: string) => void>(() => {});

/** 화면을 옮기는 유일한 통로 — 주소만 바꾸는 replace는 여기를 지나지 않는다 */
export const useGo = () => useContext(GoContext);

export function NavProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const go = useCallback(
    (href: string) => {
      startTransition(() => router.push(href));
    },
    [router],
  );

  return (
    <GoContext.Provider value={go}>
      {children}
      {pending && <Veil />}
    </GoContext.Provider>
  );
}

function Veil() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShown(true), GRACE);
    return () => clearTimeout(timer);
  }, []);

  if (!shown) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[60] flex animate-appear-fast items-center justify-center bg-bg/92 backdrop-blur-[3px]"
    >
      <Orb size={64} />
      <span className="sr-only">화면을 여는 중이에요</span>
    </div>
  );
}
