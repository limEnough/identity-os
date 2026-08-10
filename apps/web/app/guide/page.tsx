"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AXES,
  appendEntry,
  axisCoords,
  axisHref,
  axisNote,
  buildClosing,
  buildCode,
  daysToSeason,
  eul,
  footprintsFromQuery,
  journeyQuery,
  livingShift,
  sealRun,
  seasonReady,
  walkJourney,
} from "@identity-os/identity-core";
import type {
  AxisDef,
  AxisId,
  ChronicleEntry,
  Footprints,
  JourneyStep,
} from "@identity-os/identity-core";
import {
  Brand,
  Button,
  Desc,
  Fanfare,
  FloatingCta,
  Heading,
  Note,
  Orb,
  OrbStage,
  Screen,
  SkipLink,
} from "@identity-os/design-system";
import { OutcomeCard } from "@identity-os/feature-axis";
import { forgetAll, forgetFrom, loadFootprints } from "../_lib/progress";
import { loadChronicle, saveChronicle } from "../_lib/keepsake";
import { GuideSections, type GuideSection } from "./GuideSections";
import { NoteBoard, NoteModal, type GuideNote } from "./GuideNotes";
import {
  ChronicleNote,
  ClosingNote,
  CodeBox,
  CodeNote,
  PlayLinks,
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
  const [chronicle, setChronicle] = useState<ChronicleEntry[]>([]);
  const [now, setNow] = useState<number | null>(null);
  /** 펼쳐본 축의 결과 — 목차에서 연다 */
  const [openId, setOpenId] = useState<AxisId | null>(null);
  /** 네 글자의 더보기가 열려 있는지 */
  const [codeOpen, setCodeOpen] = useState(false);
  /** 축하 화면이 떠 있는지 — 판을 봉인하는 그 순간에만 켜진다 */
  const [cheering, setCheering] = useState(false);

  useEffect(() => {
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
   *
   * **축하 화면도 여기서 뜬다.** 봉인은 판마다 정확히 한 번 일어나므로,
   * "다 걸었는가"가 아니라 "방금 다 걸었는가"를 묻는 유일한 자리다 —
   * 완주한 가이드북을 다시 열 때마다 폭죽이 터지면 그건 축하가 아니다.
   */
  useEffect(() => {
    if (now === null || !code.sealed) return;
    const entry = sealRun(journey.profile, journeyQuery(fromUrl), now);
    if (!entry) return;
    const next = appendEntry(chronicle, entry);
    if (next === chronicle) return;
    setChronicle(next);
    saveChronicle(next);
    setCheering(true);
  }, [now, code.sealed, journey.profile, fromUrl, chronicle]);

  /** 여덟 축을 다 걸었을 때만 열리는 맺음 — 그 전에는 null */
  const closing = useMemo(
    () => buildClosing(journey.profile),
    [journey.profile],
  );

  // 뿌리가 없으면 가이드북도 없다 (불변식: Identity 먼저)
  useEffect(() => {
    if (!rooted) router.replace("/");
  }, [rooted, router]);
  if (!rooted) return null;

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
        // 걸어온 축은 예외 없이 제자리에서 결과가 열린다 — 첫 축도 마찬가지다
        onResult: replay.state.outcome ? () => setOpenId(def.id) : undefined,
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
   * 쪽지는 **다 걸었을 때만** 놓인다.
   *
   * 축의 결과는 목차의 제자리에서 열고(§GuideSections), 네 글자는 상자로 화면에
   * 두었으니, 여기 남는 것은 여정이 끝나야 생기는 둘뿐이다 — 맺음과 연표.
   *
   * 걷는 동안엔 비워둔다. 한동안 자라나는 '나의 문장'을 여기 뒀는데, 반쯤 적힌
   * 글은 읽히기보다 진행률로 읽혔다. 문장은 다 걸은 사람의 것이다.
   * 새 판을 시작하면 이 자리는 다시 비고, 그 판을 다 걸어야 돌아온다.
   */
  const notes: GuideNote[] = closing
    ? [
        {
          key: "closing",
          label: "나의 문장",
          hint: [
            "한 문장",
            // 접히지 않은 자리가 있으면 펼치기 전에 알려준다 — 이 쪽지의 무게가 달라지므로
            closing.tensions.length > 0
              ? `접히지 않은 자리 ${closing.tensions.length}`
              : null,
            `『${closing.passage.source}』`,
            closing.track.title,
          ]
            .filter(Boolean)
            .join(" · "),
          // 여덟 축을 다 걸어야 켜지는 단 하나 — 여기서만 금빛을 쓴다
          gold: true,
          body: <ClosingNote closing={closing} />,
        },
      ]
    : [];

  /**
   * 연표도 다 걸었을 때만 곁에 놓인다.
   * 판이 바뀌어도 **지워지지는 않지만**, 새 판을 걷는 중에 지난 판의 연표를 펼쳐두면
   * 아직 걷고 있는 사람에게 이미 끝난 이야기를 읽히는 셈이 된다.
   */
  if (closing && chronicle.length > 0 && now !== null) {
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

  /** 목차에서 펼쳐본 축 */
  const opened = journey.steps.find((s) => s.def.id === openId) ?? null;

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
          : "여덟 축을 모두 걸었어요. 「나의 문장」에 오늘의 한 줄이 놓였어요."}
      </Desc>

      <CodeBox code={code} onMore={() => setCodeOpen(true)} />

      <NoteBoard notes={notes} />
      <GuideSections sections={journey.steps.map(sectionOf)} />

      <OrbStage className="mt-8.5 mb-4.5">
        {/* 다 걸은 사람 앞에서 잠들어 있을 이유가 없다 — 눈이 반짝인다 */}
        <Orb size={72} mood={front ? "awake" : "spark"} />
      </OrbStage>
      <Note className="mt-2.5">
        {front
          ? `${front.name}의 문이 열려 있어요.`
          : "여덟 축을 다 걸었어요. 오늘의 나를 여기 다 적었어요."}
      </Note>

      {/* 네 글자의 더보기 — 근거와 어디서 왔는지, 그리고 함께 놀 자리 */}
      {codeOpen && (
        <NoteModal label="나의 네 글자" onClose={() => setCodeOpen(false)}>
          <CodeNote code={code} />
          <PlayLinks
            onMap={() => router.push(`/codes?me=${code.key}`)}
            onTogether={() => router.push(`/together?me=${code.key}`)}
          />
        </NoteModal>
      )}

      {/* 목차에서 연 축의 결과 — 무대는 쪽지와 같은 팝업 하나뿐이다 */}
      {opened?.replay.state.outcome && (
        <NoteModal
          label={`나의 ${opened.def.resultLabel}`}
          onClose={() => setOpenId(null)}
        >
          <OutcomeCard
            outcome={opened.replay.state.outcome}
            coords={axisCoords(opened.def, opened.replay.state, opened.profile)}
          />
          {/* 다시 걸을 수 있는 것은 가장 마지막에 확정한 축 하나뿐 */}
          {opened.editable && (
            <SkipLink
              className="mt-8.5 mb-1"
              onClick={() => rewalk(opened.def)}
            >
              {opened.def.name}을 다시 걸어볼래요
            </SkipLink>
          )}
        </NoteModal>
      )}

      {/* 판을 봉인하는 그 순간에만 — 삼 초 뒤 스스로 물러난다 */}
      {cheering && (
        <Fanfare
          title="여덟 축을 모두 걸었어요"
          sub={`${code.mark} 「${code.name}」 — ${code.summary}`}
          onDone={() => setCheering(false)}
        />
      )}

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
