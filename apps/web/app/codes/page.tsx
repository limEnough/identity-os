"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useGo } from "../_components/Navigating";
import {
  buildCode,
  CODE_AXES,
  CODE_KEYS,
  codeName,
  footprintsFromQuery,
  guideHref,
  isCodeKey,
  walkJourney,
} from "@identity-os/identity-core";
import {
  Brand,
  Button,
  cn,
  Desc,
  FloatingCta,
  Heading,
  Note,
  Overline,
  Screen,
  SkipLink,
  surface,
  surfaceLift,
} from "@identity-os/design-system";
import { loadFootprints } from "../_lib/progress";
import { lastSealedCode } from "../_lib/keepsake";

/**
 * 열여섯 자리의 지도 — /codes?me=QSRI
 *
 * 내 자리 하나만 보여주면 그게 어디쯤인지 알 수 없다. 열여섯을 모두 펼쳐놓고
 * 그 안의 한 칸을 표시하면, 처음으로 **좌표 감각**이 생긴다: 내 옆칸은 무엇이고,
 * 한 갈래만 달랐다면 어디였는지.
 *
 * 다른 자리를 눌러도 판정하지 않는다 — 그저 그 자리의 이름과 뜻을 읽을 뿐이다.
 * 여기서 누구도 등급을 받지 않는다.
 */
function CodesRoute() {
  const go = useGo();
  const searchParams = useSearchParams();

  const fromQuery = searchParams.get("me");
  const [mine, setMine] = useState<string | null>(
    isCodeKey(fromQuery) ? fromQuery : null,
  );
  const [footprints, setFootprints] = useState(() =>
    footprintsFromQuery((p) => searchParams.get(p)),
  );

  /**
   * 주소에 네 글자가 없으면 이 브라우저에서 찾는다 — 걷고 있는 판이 먼저,
   * 없으면 마지막으로 봉인한 판.
   */
  useEffect(() => {
    if (mine) return;
    const stored = loadFootprints();
    setFootprints(stored);
    const journey = walkJourney(stored);
    const code = buildCode(journey.profile);
    setMine(code.walked > 0 ? code.key : lastSealedCode());
  }, [mine]);

  const [opened, setOpened] = useState<string | null>(null);
  const shown = opened ?? mine;
  const detail = useMemo(() => (shown ? codeName(shown) : null), [shown]);

  return (
    <Screen>
      <Brand>SIXTEEN PLACES</Brand>
      <Heading as="h2">열여섯 자리</Heading>
      <Desc>
        네 갈래가 갈리는 방식은 열여섯 가지예요.
        <br />
        {mine ? "그중 지금 당신이 서 있는 칸을 표시했어요." : "아직 당신의 칸은 비어 있어요."}
      </Desc>

      <div className="mt-9.5 grid grid-cols-2 gap-2.5">
        {CODE_KEYS.map((key) => {
          const isMine = key === mine;
          const isOpen = key === shown;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setOpened(key)}
              className={cn(
                "rounded-tile border px-4 py-4 text-left",
                surfaceLift,
                isMine
                  ? "border-rim bg-tint shadow-filled"
                  : cn(surface, isOpen ? "border-edge" : ""),
              )}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-body font-extrabold tracking-[0.1em] text-chip">
                  {key}
                </span>
                {isMine && (
                  <span className="text-label font-semibold text-chip">내 자리</span>
                )}
              </span>
              <span className="mt-1.5 block text-caption font-semibold">
                {codeName(key).name}
              </span>
            </button>
          );
        })}
      </div>

      {detail && shown && (
        <div className={cn(surface, "mt-6 rounded-card px-5.5 py-5.5")}>
          <Overline tight className="mb-3">
            {shown}
            {shown === mine ? " · 내 자리" : ""}
          </Overline>
          <p className="text-[17px] font-semibold">「{detail.name}」</p>
          <p className="mt-1.5 text-support text-sub">{detail.summary}</p>
          <ul className="mt-5 grid gap-1.5 border-t border-line pt-4.5 text-support text-sub">
            {CODE_AXES.map((axis, i) => {
              const pole =
                shown[i] === axis.plus.letter ? axis.plus : axis.minus;
              return (
                <li key={axis.key}>
                  <b className="font-semibold text-ink">{pole.letter}</b>{" "}
                  {pole.pole} — {pole.reads}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Note className="mt-7">
        자리는 등급이 아니에요. 어느 칸도 더 낫지 않고, 계절이 지나면 옆칸으로
        옮겨가기도 해요.
      </Note>

      <FloatingCta>
        {mine && (
          <SkipLink onClick={() => go(`/together?me=${mine}`)}>
            다른 사람과 겹쳐보기
          </SkipLink>
        )}
        <Button
          variant="ghost"
          onClick={() => go(guideHref(footprints))}
        >
          가이드북으로 돌아가기
        </Button>
      </FloatingCta>
    </Screen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <CodesRoute />
    </Suspense>
  );
}
