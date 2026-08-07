"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  buildCode,
  codeName,
  guideHref,
  isCodeKey,
  overlayCodes,
  walkJourney,
} from "@identity-os/identity-core";
import {
  Brand,
  Bubble,
  Button,
  cn,
  CopyButton,
  Desc,
  FloatingCta,
  Heading,
  Note,
  Orb,
  OrbStage,
  Overline,
  quoteBar,
  Screen,
  SkipLink,
  surface,
} from "@identity-os/design-system";
import { loadFootprints } from "../_lib/progress";
import { lastSealedCode } from "../_lib/keepsake";

/**
 * 겹쳐보기 — /together?me=QSRI 로 초대를 만들고, /together?with=QSRI 로 받는다.
 *
 * **점수도 궁합도 없다.** 사람을 견주는 순간 이 제품은 판정기가 되므로, 산출물은
 * 등급이 아니라 질문이다. 겹친 갈래는 겹쳤다고 적고, 갈린 갈래에는 서로에게 물어볼
 * 말 하나를 놓는다 — 결과가 대화의 시작이 되도록.
 *
 * 오가는 것은 네 글자뿐이다. 발자국도 이름도 링크에 싣지 않는다.
 */
function TogetherRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const invited = searchParams.get("with");
  const asked = searchParams.get("me");
  const yours = isCodeKey(invited) ? invited : null;

  const [mine, setMine] = useState<string | null>(
    isCodeKey(asked) ? asked : null,
  );
  const [footprints, setFootprints] = useState({});
  const [origin, setOrigin] = useState("");

  /** 주소에 내 네 글자가 없으면 이 브라우저에서 찾는다 */
  useEffect(() => {
    const stored = loadFootprints();
    setFootprints(stored);
    setOrigin(window.location.origin);
    setMine((current) => {
      if (current) return current;
      const code = buildCode(walkJourney(stored).profile);
      return code.walked > 0 ? code.key : lastSealedCode();
    });
  }, []);

  const overlay = useMemo(() => overlayCodes(mine, yours), [mine, yours]);
  const invite = mine ? `${origin}/together?with=${mine}` : "";

  return (
    <Screen>
      <Brand>TOGETHER</Brand>

      {/* ① 아직 상대가 없다 — 초대를 만드는 화면 */}
      {!yours && (
        <>
          <Heading as="h2">결 겹쳐보기</Heading>
          <Desc>
            내 네 글자를 건네면, 상대의 것과 나란히 놓아 드려요.
            <br />
            점수도 궁합도 매기지 않아요 — 남는 건 질문 하나예요.
          </Desc>

          {mine ? (
            <>
              <div className={cn(surface, "mt-9.5 rounded-card px-5.5 py-6 text-center")}>
                <Overline tight className="mb-3">
                  내 네 글자
                </Overline>
                <p className="text-[26px] font-extrabold tracking-[0.14em] text-chip">
                  {mine}
                </p>
                <p className="mt-2.5 text-body font-semibold">
                  「{codeName(mine).name}」
                </p>
                <p className="mt-1.5 text-support text-sub">
                  {codeName(mine).summary}
                </p>
                <div className="mt-6 flex justify-center">
                  <CopyButton value={invite} label="초대 링크 복사" />
                </div>
              </div>
              <Note className="mt-5">
                링크에는 네 글자만 실려요. 걸어온 자국도, 축의 이름도 넘어가지 않아요.
              </Note>
            </>
          ) : (
            <>
              <OrbStage className="mt-9.5 mb-4.5">
                <Orb size={72} />
              </OrbStage>
              <Bubble>
                아직 겹쳐볼 것이 없어요.
                <br />
                한 축이라도 걸으면 네 글자가 생겨요.
              </Bubble>
            </>
          )}
        </>
      )}

      {/* ② 상대는 왔는데 내 것이 없다 */}
      {yours && !mine && (
        <>
          <Heading as="h2">누군가 네 글자를 보내왔어요</Heading>
          <Desc>
            {yours} 「{codeName(yours).name}」 — {codeName(yours).summary}
          </Desc>
          <OrbStage className="mt-9.5 mb-4.5">
            <Orb size={72} />
          </OrbStage>
          <Bubble>
            겹쳐보려면 당신의 네 글자도 필요해요.
            <br />첫 축만 걸어도 한 자리가 생겨요.
          </Bubble>
        </>
      )}

      {/* ③ 둘 다 있다 — 겹친다 */}
      {overlay && (
        <>
          <Heading as="h2">{overlay.headline}</Heading>
          <Desc>
            {overlay.mine} 「{overlay.mineName}」 · {overlay.yours} 「
            {overlay.yoursName}」
          </Desc>

          <div className={cn(surface, "mt-9.5 rounded-card px-5.5 py-5.5")}>
            <Overline tight className="mb-3">
              오늘 서로에게 건넬 질문
            </Overline>
            <blockquote className={quoteBar}>
              <p className="text-body">{overlay.question}</p>
            </blockquote>
          </div>

          {overlay.parted.length > 0 && (
            <div className="mt-8.5">
              <Overline tight className="mb-3.5">
                갈린 갈래 {overlay.parted.length}
              </Overline>
              <div className="grid gap-2.5">
                {overlay.parted.map((facet) => (
                  <div
                    key={facet.title}
                    className={cn(surface, "rounded-tile px-5 py-4.5")}
                  >
                    <p className="text-label font-semibold text-sub">
                      {facet.title}
                    </p>
                    <p className="mt-2 text-body font-semibold">
                      나 {facet.mine.pole}
                      <span className="mx-2 font-normal text-sub">↔</span>
                      상대 {facet.yours.pole}
                    </p>
                    <p className="mt-2 text-caption text-sub">{facet.question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {overlay.shared.length > 0 && (
            <div className="mt-8.5">
              <Overline tight className="mb-3.5">
                겹친 갈래 {overlay.shared.length}
              </Overline>
              <div className="grid gap-2.5">
                {overlay.shared.map((facet) => (
                  <div
                    key={facet.title}
                    className={cn(surface, "rounded-tile px-5 py-4.5")}
                  >
                    <p className="text-label font-semibold text-sub">
                      {facet.title}
                    </p>
                    <p className="mt-2 text-body font-semibold">
                      둘 다 {facet.pole.pole}
                    </p>
                    <p className="mt-2 text-caption text-sub">{facet.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Note className="mt-8.5">
            더 잘 맞는 조합 같은 건 없어요. 갈린 자리는 틀린 자리가 아니라,
            아직 물어보지 않은 자리예요.
          </Note>
        </>
      )}

      <FloatingCta>
        {mine && yours && (
          <SkipLink onClick={() => router.push(`/together?me=${mine}`)}>
            내 초대 링크 만들기
          </SkipLink>
        )}
        {mine ? (
          <Button
            variant="ghost"
            onClick={() => router.push(guideHref(footprints))}
          >
            가이드북으로 돌아가기
          </Button>
        ) : (
          <Button onClick={() => router.push("/")}>여정 시작하기</Button>
        )}
      </FloatingCta>
    </Screen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <TogetherRoute />
    </Suspense>
  );
}
