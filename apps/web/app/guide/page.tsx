"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AXES,
  appendEntry,
  axisCoords,
  axisHref,
  axisNote,
  buildCode,
  buildStatement,
  daysToSeason,
  eul,
  footprintsFromQuery,
  giftReady,
  journeyQuery,
  livingShift,
  pickGift,
  resolveShelf,
  sealRun,
  seasonReady,
  walkJourney,
} from "@identity-os/identity-core";
import type {
  AxisDef,
  ChronicleEntry,
  Footprints,
  JourneyStep,
  ShelfItem,
} from "@identity-os/identity-core";
import {
  Brand,
  Button,
  CodeMark,
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
import { OutcomeCard } from "@identity-os/feature-axis";
import { forgetAll, forgetFrom, loadFootprints } from "../_lib/progress";
import {
  loadChronicle,
  loadShelf,
  saveChronicle,
  saveShelf,
} from "../_lib/keepsake";
import { GuideSections, type GuideSection } from "./GuideSections";
import { NoteAside, NoteShelf, type GuideNote } from "./GuideNotes";
import {
  ChronicleNote,
  CodeNote,
  PlayLinks,
  ShelfNote,
} from "./GuideKeepsakes";

/**
 * My Life Guide — /guide?i=…&m=…&c=…&l=…&t=…&s=…&h=…&k=…
 *
 * 여정의 종착지이자, 축을 하나 끝낼 때마다 돌아오는 자리다.
 * 여기서 **다음 축 하나만** 열린다: 걸어온 축은 채워진 채로, 다음 축은 '방금 열림'으로,
 * 그 뒤는 잠긴 채로. 순서를 그림으로 보여주는 게 아니라 순서가 여기서 집행된다.
 */
function GuideRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromUrl = useMemo<Footprints>(
    () => footprintsFromQuery((p) => searchParams.get(p)),
    [searchParams],
  );
  const journey = useMemo(() => walkJourney(fromUrl), [fromUrl]);

  /**
   * 주소에 없는 축이 기억에 남아 있으면 되살린다.
   * 앞 축으로만 돌아 들어오면 뒤 축이 주소에서 떨어져 나가는데, 그대로 두면
   * 이미 걸은 축이 아직 안 걸은 것처럼 보인다 — 가이드북은 걸어온 만큼을 보여야 한다.
   */
  useEffect(() => {
    const merged: Footprints = { ...loadFootprints(), ...fromUrl };
    const next = journeyQuery(merged);
    if (next && next !== journeyQuery(fromUrl)) {
      router.replace(`/guide?${next}`, { scroll: false });
    }
  }, [fromUrl, router]);

  /**
   * 간직되는 것들은 마운트 뒤에 읽는다 — 첫 그림은 서버에서 그려지므로
   * 브라우저의 기억을 그때 꺼내면 두 그림이 어긋난다.
   */
  const [shelf, setShelf] = useState<ShelfItem[]>([]);
  const [chronicle, setChronicle] = useState<ChronicleEntry[]>([]);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setShelf(loadShelf());
    setChronicle(loadChronicle());
    setNow(Date.now());
  }, []);

  const identity = journey.steps[0];
  const rooted = identity.status === "done";
  const code = useMemo(() => buildCode(journey.profile), [journey.profile]);

  /**
   * 여덟 축을 다 걸은 판은 연표에 봉인된다 — 같은 발자국은 한 번만.
   * 봉인은 발자국을 지우지 않는다: 지금 판의 가이드북은 그대로 남고,
   * 새 판은 사용자가 계절이 지난 뒤 직접 시작한다.
   */
  useEffect(() => {
    if (now === null || !code.sealed) return;
    const entry = sealRun(journey.profile, journeyQuery(fromUrl), now);
    if (!entry) return;
    setChronicle((entries) => {
      const next = appendEntry(entries, entry);
      if (next !== entries) saveChronicle(next);
      return next;
    });
  }, [now, code.sealed, journey.profile, fromUrl]);

  const gift = useMemo(
    () => pickGift(journey.profile, shelf),
    [journey.profile, shelf],
  );
  const canTake = now !== null && giftReady(shelf, now);

  const takeGift = useCallback(() => {
    if (!gift || now === null) return;
    const next: ShelfItem[] = [
      ...shelf,
      {
        passageId: gift.passage.id,
        trackId: gift.track.id,
        at: new Date(now).toISOString(),
      },
    ];
    setShelf(next);
    saveShelf(next);
  }, [gift, now, shelf]);

  // 뿌리가 없으면 가이드북도 없다 (불변식: Identity 먼저)
  useEffect(() => {
    if (!rooted) router.replace("/");
  }, [rooted, router]);
  if (!rooted) return null;

  const statement = buildStatement(journey.profile);
  const value = journey.profile.results[0]?.name ?? "";
  const front = journey.current;

  const goAxis = (def: AxisDef) => router.push(axisHref(def, fromUrl));

  /** 다시 걷기는 그 축부터 뒤를 지운 뒤에 — 남겨두면 근거를 잃은 결과가 남는다 */
  const rewalk = (def: AxisDef) => {
    forgetFrom(def);
    const kept: Footprints = {};
    for (const step of journey.steps) {
      if (step.def.id === def.id) break;
      if (step.seq.length > 0) kept[step.def.id] = step.seq;
    }
    router.push(axisHref(def, kept));
  };

  const restart = () => {
    forgetAll();
    router.push("/");
  };

  const sectionOf = (step: JourneyStep): GuideSection => {
    const { def, status, replay, profile } = step;
    if (status === "done") {
      return {
        no: def.no,
        name: def.name,
        tone: "filled",
        body: axisNote(def, replay.state, profile),
      };
    }
    if (status === "current") {
      return {
        no: def.no,
        name: def.name,
        tone: "open",
        body:
          replay.state.stepIndex > 0
            ? `걷다 만 자리가 있어요 — ${replay.state.stepIndex}걸음까지`
            : `이제 열렸어요 — ${def.blurb}`,
        onOpen: () => goAxis(def),
      };
    }
    const previous = AXES[AXES.indexOf(def) - 1];
    return {
      no: def.no,
      name: def.name,
      tone: "locked",
      body: `${def.blurb} — ${previous ? `${previous.name} 다음` : "다음 탐색"}`,
    };
  };

  /**
   * 쪽지는 결과가 아니라 출처로 나뉜다 — 문장은 여정 전체에서 나왔으니 첫 쪽지에,
   * 축의 결과는 그 축에서 나왔으니 각자의 쪽지에. 따로 떼면 무엇에서 비롯됐는지가 지워진다.
   */
  const notes: GuideNote[] = [
    {
      key: "statement",
      label: "나의 문장",
      hint: `${journey.profile.results.length}개 축이 적힌 글`,
      body: (
        <>
          <Serif className="text-center">
            <Lines of={statement} />
          </Serif>
          {identity.replay.state.practice && (
            <NoteAside
              when="이번 주의 실천"
              action={identity.replay.state.practice.action}
              caption={identity.replay.state.practice.caption}
            />
          )}
        </>
      ),
    },
    {
      key: "code",
      label: "나의 네 글자",
      hint: code.sealed
        ? `${code.mark} · 「${code.name}」`
        : `${code.mark} · ${code.settledCount}자리 또렷해요`,
      body: (
        <>
          <CodeNote code={code} />
          <PlayLinks
            onMap={() => router.push(`/codes?me=${code.key}`)}
            onTogether={() => router.push(`/together?me=${code.key}`)}
          />
        </>
      ),
    },
    {
      key: "shelf",
      label: "결 서재",
      hint:
        shelf.length > 0
          ? `${shelf.length}칸${canTake ? " · 오늘 하나 더" : ""}`
          : "첫 꾸러미가 기다려요",
      body: (
        <ShelfNote
          gift={gift}
          shelf={resolveShelf(shelf)}
          ready={canTake}
          onTake={takeGift}
        />
      ),
    },
  ];

  // 연표는 봉인된 판이 하나라도 있을 때만 — 빈 연표는 알려줄 것이 없다
  if (chronicle.length > 0 && now !== null) {
    notes.push({
      key: "chronicle",
      label: "결 연표",
      hint: `${chronicle.length}판${seasonReady(chronicle, now) ? " · 다음 판이 열렸어요" : ""}`,
      body: (
        <ChronicleNote
          entries={chronicle}
          code={code}
          living={livingShift(chronicle, code)}
          seasonOpen={seasonReady(chronicle, now)}
          daysLeft={daysToSeason(chronicle, now)}
          onNewRun={restart}
        />
      ),
    });
  }

  for (const step of journey.steps) {
    const { def, status, replay, profile, editable } = step;
    const { outcome, practice, tentative } = replay.state;
    // 첫 축은 문장 쪽지가 이미 말하고 있다 — 카드로 한 번 더 펼치지 않는다
    if (status !== "done" || !outcome || def.id === "identity") continue;
    notes.push({
      key: def.id,
      label: `나의 ${def.resultLabel}`,
      hint: `「${outcome.name}」${tentative ? " · 아직 임시로" : ""}`,
      body: (
        <>
          <OutcomeCard
            outcome={outcome}
            coords={axisCoords(def, replay.state, profile)}
          />
          {practice && (
            <NoteAside
              when="이번 주의 한 가지"
              action={practice.action}
              caption={practice.caption}
            />
          )}
          {/* 다시 걸을 수 있는 것은 가장 마지막에 확정한 축 하나뿐 */}
          {editable && (
            <SkipLink className="mt-8.5 mb-1" onClick={() => rewalk(def)}>
              {def.name}을 다시 걸어볼래요
            </SkipLink>
          )}
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
      <Desc>
        {front
          ? `여덟 축 중 ${journey.profile.results.length}개를 걸었어요. 다음은 ${front.name}.`
          : "여덟 축을 모두 걸었어요. 이제 고쳐 쓰는 일이 남았어요."}
      </Desc>

      {/**
       * 네 글자는 쪽지를 펼치지 않아도 보인다 — 축 하나를 끝내고 돌아왔을 때
       * 무엇이 늘었는지가 여기서 바로 읽혀야 하므로. 자세한 건 쪽지에서.
       */}
      <CodeMark
        className="mt-8.5"
        slots={code.letters.map((letter) => ({
          glyph: code.sealed || letter.settled ? letter.letter : "·",
          settled: code.sealed || letter.settled,
        }))}
      />
      <Note className="mt-3.5">
        {code.sealed
          ? `「${code.name}」 — ${code.summary}`
          : code.settledCount === 0
            ? "네 글자가 아직 비어 있어요. 걸을수록 한 자리씩 채워져요."
            : `네 글자 중 ${code.settledCount}자리가 또렷해졌어요.`}
      </Note>

      <NoteShelf notes={notes} />
      <GuideSections sections={journey.steps.map(sectionOf)} />

      <OrbStage className="mt-8.5 mb-4.5">
        <Orb size={72} mood={front ? "awake" : "rest"} />
      </OrbStage>
      <Note className="mt-2.5">
        {front
          ? `${front.name}의 문이 열려 있어요.`
          : "여정을 마칠 때까지 조용히 기다릴게요."}
      </Note>

      <FloatingCta>
        {/* 다시 걷기는 형태 없는 텍스트로 — 주 버튼 위에 함께 떠 있되 앞서지 않는다 */}
        <SkipLink onClick={restart}>처음부터 다시 걷기</SkipLink>
        {front && (
          <Button onClick={() => goAxis(front)}>{front.name} 걸어보기</Button>
        )}
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
