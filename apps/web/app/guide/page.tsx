"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  buildStatement,
  decodeSeq,
  encodeSeq,
  eul,
  replayIdentity,
  replayStyle,
  styleAxes,
} from "@identity-os/identity-core";
import {
  Brand,
  Button,
  Desc,
  FloatingCta,
  Heading,
  Lines,
  Note,
  Orb,
  OrbStage,
  Screen,
  Serif,
  SkipLink,
} from "@identity-os/design-system";
import { MoodCard } from "@identity-os/feature-style";
import { forgetAll, styleStore } from "../_lib/progress";
import { useIdentityGate } from "../_lib/useIdentityGate";
import { GuideSections, type GuideSection } from "./GuideSections";
import { NoteAside, NoteShelf, type GuideNote } from "./GuideNotes";

/** 아직 걷지 않은 여섯 축 — 순서와 한 줄 설명만 미리 정해져 있다 */
const UPCOMING: Array<[no: string, name: string, body: string]> = [
  ["02", "Mindset", "어떻게 생각하는 사람인가 — 다음 탐색"],
  ["03", "Communication", "어떻게 관계 맺는가 — 다음 탐색"],
  ["04", "Lifestyle", "이상적인 하루의 설계 — 다음 탐색"],
  ["05", "Taste", "무엇에 끌리는 사람인가 — 다음 탐색"],
  ["07", "Health", "몸이 곧 삶이다 — 다음 탐색"],
  ["08", "Career", "어떻게 성장하는 사람인가 — 다음 탐색"],
];

const locked = (
  [no, name, body]: (typeof UPCOMING)[number],
): GuideSection => ({ no, name, body, tone: "locked" });

/**
 * My Life Guide — /guide?i=Identity발자국&s=무드발자국
 * 여정의 종착지이자, 계속 고쳐 쓰게 될 문서의 첫 페이지.
 * Style 섹션은 Identity가 정의된 뒤에야 열린다 (불변식: Identity → Style).
 */
function GuideRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identitySeq = searchParams.get("i") ?? "";
  const styleSeq = searchParams.get("s") ?? "";

  const identity = useMemo(
    () => replayIdentity(decodeSeq(identitySeq)),
    [identitySeq],
  );
  const style = useMemo(() => replayStyle(decodeSeq(styleSeq)), [styleSeq]);

  /**
   * 주소에 무드 발자국이 없어도 기억에 남아 있으면 되살린다.
   * Identity 쪽으로만 돌아 들어오면 s가 떨어져 나가는데, 그대로 두면
   * 이미 걸은 무드가 아직 안 걸은 것처럼 보인다 — 가이드북은 걸어온 만큼을 보여야 한다.
   */
  useEffect(() => {
    if (styleSeq || !identity.done) return;
    const saved = styleStore().load();
    if (saved.length === 0) return;
    router.replace(`/guide?i=${identitySeq}&s=${encodeSeq(saved)}`, {
      scroll: false,
    });
  }, [styleSeq, identity.done, identitySeq, router]);

  const redirecting = useIdentityGate(identity.done);
  if (redirecting) return null;

  const state = identity.state;
  const value = state.value ?? "";
  const styleState = style.state;
  // 무드는 명명까지 끝나야 가이드북에 오른다 — 표현 단계는 실천 카드에만 쓰인다
  const mood = style.valid && styleState.mood ? styleState.mood : null;
  const moodName = styleState.moodName ?? "";
  const statement = buildStatement(state, mood ? moodName : undefined);

  /** 걷다 만 무드가 있으면 그 자리에서 이어 걷는다 */
  const goStyle = () =>
    router.push(`/style?i=${identitySeq}${styleSeq ? `&s=${styleSeq}` : ""}`);

  /** 무드만 처음부터 — 발자국을 지워야 완주 시퀀스가 리플레이돼 되튕기지 않는다 */
  const rewalkStyle = () => {
    styleStore().clear();
    router.push(`/style?i=${identitySeq}`);
  };

  const restart = () => {
    forgetAll();
    router.push("/");
  };

  const sections: GuideSection[] = [
    {
      no: "01",
      name: "Identity",
      tone: "filled",
      body: `${state.envy?.short}${eul(state.envy?.short ?? "")} 동경 · 핵심 가치 「${value}」${state.origin ? ` · 근원: ${state.origin.phrase}` : ""}`,
    },
    ...UPCOMING.slice(0, 4).map(locked),
    // 완주한 섹션은 Identity와 마찬가지로 눌리지 않는다 — 다시 걷기는 쪽지 안의 링크로
    mood
      ? {
          no: "06",
          name: "Style",
          tone: "filled" as const,
          body: `「${moodName}」 — ${mood.tag}`,
        }
      : {
          no: "06",
          name: "Style",
          tone: "open" as const,
          body: `이제 열렸어요 — 「${value}」${eul(value)} 겉으로 표현하는 방법을 함께 찾아요`,
          onOpen: goStyle,
        },
    ...UPCOMING.slice(4).map(locked),
  ];

  /**
   * 쪽지는 결과가 아니라 출처로 나뉜다 — 실천은 문장에서 나왔으니 문장 쪽지에,
   * 표현은 무드에서 나왔으니 무드 쪽지에. 따로 떼면 무엇에서 비롯됐는지가 지워진다.
   */
  const notes: GuideNote[] = [
    {
      key: "statement",
      label: "나의 문장",
      hint: state.practice ? "첫 문장과 이번 주의 실천" : "오늘 쓰인 첫 문장",
      body: (
        <>
          <Serif className="text-center">
            <Lines of={statement} />
          </Serif>
          {state.practice && (
            <NoteAside
              when="이번 주의 실천"
              action={state.practice.action}
              caption={state.practice.caption}
            />
          )}
        </>
      ),
    },
  ];

  if (mood) {
    notes.push({
      key: "mood",
      label: "나의 무드",
      hint: `「${moodName}」${styleState.tentative ? " · 아직 임시로" : ""}`,
      body: (
        <>
          <MoodCard
            mood={mood}
            moodName={moodName}
            axes={styleAxes(styleState)}
          />
          {styleState.expression && (
            <NoteAside
              when="이번 주의 표현"
              action={styleState.expression.action}
              caption={styleState.expression.caption}
            />
          )}
          <SkipLink className="mt-8.5 mb-1" onClick={rewalkStyle}>
            무드를 다시 찾아볼래요
          </SkipLink>
        </>
      ),
    });
  }

  return (
    <Screen>
      <Brand>MY LIFE GUIDE</Brand>
      <Heading as="h2">
        「{value}」{eul(value)} 아는 사람의
        <br />
        가이드북
      </Heading>
      <Desc>걸어온 길목을 쪽지에 적어두었어요.</Desc>

      <NoteShelf notes={notes} />
      <GuideSections sections={sections} />

      <OrbStage className="mt-8.5 mb-4.5">
        <Orb size={72} mood="rest" />
      </OrbStage>
      <Note className="mt-2.5">여정을 마칠 때까지 조용히 기다릴게요.</Note>

      <FloatingCta>
        {/* 다시 걷기는 형태 없는 텍스트로 — 주 버튼 위에 함께 떠 있되 앞서지 않는다 */}
        <SkipLink onClick={restart}>처음부터 다시 걷기</SkipLink>
        {!mood && <Button onClick={goStyle}>Style 여정 시작하기</Button>}
      </FloatingCta>
    </Screen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <GuideRoute />
    </Suspense>
  );
}
