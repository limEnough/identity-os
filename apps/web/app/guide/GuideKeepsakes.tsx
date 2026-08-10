"use client";

import {
  AxisBars,
  Button,
  Chip,
  ChipRow,
  CodeMark,
  CopyButton,
  cn,
  Note,
  Overline,
  quoteBar,
  Serif,
  SkipLink,
  surface,
} from "@identity-os/design-system";
import { codeCoords, codeName, flipCode, shiftNote } from "@identity-os/identity-core";
import type { ChronicleEntry, Closing, Code } from "@identity-os/identity-core";

/**
 * 여정 전체에서 나오는 것들 — 네 글자 · 맺음 · 결 연표.
 *
 * 셋 다 축 하나의 결과가 아니라 **여정 전체**에서 나온다. 그래서 축의 쪽지들보다 앞에
 * 놓인다. 다만 수명은 다르다: 네 글자와 맺음은 지금 판의 발자국에서 매번 다시
 * 계산되고, 연표만 판이 바뀌어도 남는다.
 */

/* ── 나의 네 글자 ── */

/**
 * 화면에 늘 놓이는 한 상자 — 표식과 이름, 그리고 더보기.
 *
 * 축 하나를 끝내고 돌아왔을 때 무엇이 늘었는지는 여기서 바로 읽혀야 하므로
 * 접어두지 않는다. 다만 상자 안에 다 펼치면 그것만으로 화면이 가득 차므로,
 * 근거(축 막대·네 갈래·어디서 왔나요)는 더보기 뒤에 둔다.
 */
export function CodeBox({ code, onMore }: { code: Code; onMore: () => void }) {
  return (
    <div className={cn(surface, "mt-8.5 rounded-card px-5.5 pt-6 pb-2")}>
      <Overline tight className="mb-5 text-center">
        나의 네 글자
      </Overline>

      <CodeMark
        slots={code.letters.map((letter) => ({
          glyph: code.sealed || letter.settled ? letter.letter : "·",
          settled: code.sealed || letter.settled,
        }))}
      />

      {/* 이름은 봉인된 뒤에만 불린다 — 아직 얻지 않은 이름을 선언하지 않는다 */}
      {code.sealed ? (
        <>
          <p className="mt-5.5 text-center text-[18px] font-semibold">
            「{code.name}」
          </p>
          <p className="mt-1.5 text-center text-support text-sub">
            {code.summary}
          </p>
        </>
      ) : (
        <p className="mt-5.5 text-center text-support text-sub">
          {code.settledCount === 0
            ? "네 글자가 아직 비어 있어요. 걸을수록 한 자리씩 채워져요."
            : `네 글자 중 ${code.settledCount}자리가 또렷해졌어요.`}
        </p>
      )}

      <button
        type="button"
        className="mt-5.5 w-full cursor-pointer border-t border-line pt-4 pb-3 text-caption font-semibold text-chip transition-colors hover:text-accent"
        onClick={onMore}
      >
        더보기
      </button>
    </div>
  );
}

/** 더보기 안의 상세 — 네 갈래의 근거와 어디서 왔는지 */
export function CodeNote({ code }: { code: Code }) {
  // 가장 아슬아슬했던 갈래를 뒤집은 옆칸 — 경계에서 좁히는 자리(축의 '이웃'과 같은 뜻)
  const weakest = code.letters.reduce(
    (best, letter, i) =>
      letter.strength < code.letters[best].strength ? i : best,
    0,
  );
  const neighbor = codeName(flipCode(code.key, weakest));

  return (
    <>
      <CodeMark
        slots={code.letters.map((letter) => ({
          glyph: code.sealed || letter.settled ? letter.letter : "·",
          settled: code.sealed || letter.settled,
        }))}
      />
      {/**
       * 이름은 봉인된 뒤에만 불린다.
       * 쪽지 안에 접혀 있을 땐 걷는 중에 이름을 보여도 '펼쳐본 사람의 몫'이었지만,
       * 화면에 그대로 놓이는 지금은 아직 얻지 않은 이름을 선언하는 꼴이 된다.
       */}
      {code.sealed ? (
        <>
          <p className="mt-5.5 text-center text-[18px] font-semibold">
            「{code.name}」
          </p>
          <p className="mt-1.5 text-center text-support text-sub">
            {code.summary}
          </p>
        </>
      ) : (
        <p className="mt-5.5 text-center text-support text-sub">
          {code.settledCount === 0
            ? "네 글자가 아직 비어 있어요. 걸을수록 한 자리씩 채워져요."
            : `네 글자 중 ${code.settledCount}자리가 또렷해졌어요.`}
        </p>
      )}

      <AxisBars axes={codeCoords(code)} className="mt-7" />

      <div className="mt-7 grid gap-2.5">
        {code.letters.map((letter) => (
          <div
            key={letter.key}
            className={cn(surface, "flex items-center gap-3.5 rounded-tile px-4.5 py-3.5")}
          >
            <span
              className={cn(
                "inline-flex size-8 flex-none items-center justify-center rounded-lg text-body font-extrabold",
                letter.settled ? "bg-tint text-chip" : "border border-dashed border-line text-sub/70",
              )}
            >
              {code.sealed || letter.settled ? letter.letter : "·"}
            </span>
            <span className="min-w-0">
              <span className="text-body font-semibold">{letter.pole}</span>
              <span className="mt-0.75 block text-caption text-sub">
                {letter.settled
                  ? letter.reads
                  : `아직 반반이에요 — ${letter.other.pole} 쪽으로도 열려 있어요`}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-7 border-t border-line pt-5.5">
        <Overline tight className="mb-2.75">
          어디서 왔나요
        </Overline>
        <p className="text-support text-sub">
          {code.walked}개 축에서 고른 것들이 남긴 결이에요. 문항을 채점한 결과가 아니라,
          걸어온 자국이 모여 이렇게 놓였어요.
          {code.sealed && code.wobbly.length > 0 && (
            <>
              {" "}
              다만 {code.wobbly.map((w) => w.title).join(" · ")} 갈래는 거의
              반반이었어요 — 조금만 달랐다면 「{neighbor.name}」이었을 거예요.
            </>
          )}
          {!code.sealed && " 남은 축을 걸으면 비어 있는 자리가 채워져요."}
        </p>
      </div>
    </>
  );
}

/* ── 맺음 ── */

/**
 * 여정의 맺음 — 문장 하나, 책 한 권, 노래 하나. 그게 전부다.
 *
 * 여덟 축을 다 걸어야 열린다. 링크는 없다: 제목만 복사해 간다 —
 * 바깥으로 나가는 문을 만들면 선물이 광고가 된다.
 */
export function ClosingNote({ closing }: { closing: Closing }) {
  const { line, passage, track } = closing;
  return (
    <>
      <Serif className="text-center">{line}</Serif>

      <div className="mt-8 border-t border-line pt-6">
        <Overline tight className="mb-3">
          한 구절, 그리고 그것이 온 곳
        </Overline>
        <blockquote className={quoteBar}>
          <p className="text-body">{passage.text}</p>
          <p className="mt-2.5 text-caption text-sub">
            『{passage.source}』 · {passage.author}
          </p>
        </blockquote>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton
            value={`${passage.source} ${passage.author}`}
            label="책 제목 복사"
          />
        </div>
      </div>

      <div className="mt-7 border-t border-line pt-5.5">
        <Overline tight className="mb-3">
          곁에 둘 노래 하나
        </Overline>
        <p className="text-body font-semibold">
          {track.title}
          <span className="ml-2 font-normal text-sub">{track.artist}</span>
        </p>
        {/* 가사는 싣지 않는다 — 왜 이 결에 놓였는지 우리가 적은 한 줄만 */}
        <p className="mt-1.5 text-caption text-sub">{track.note}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton
            value={`${track.title} ${track.artist}`}
            label="노래 제목 복사"
          />
        </div>
      </div>
    </>
  );
}

/* ── 결 연표 ── */

export function ChronicleNote({
  entries,
  code,
  living,
  seasonOpen,
  daysLeft,
  onNewRun,
}: {
  entries: ChronicleEntry[];
  code: Code;
  /** 지난 판과 견준 지금 — 봉인 전에도 볼 수 있다 */
  living: Array<{ title: string; from: string; to: string }>;
  seasonOpen: boolean;
  daysLeft: number;
  onNewRun: () => void;
}) {
  const last = entries[entries.length - 1];
  const livingIsNew = last && last.code !== code.key;

  return (
    <>
      <div className="grid gap-2.5">
        {entries.map((entry, i) => {
          const { shifts, note } = shiftNote(entries, i);
          return (
            <div key={entry.at} className={cn(surface, "rounded-tile px-5 py-4.5")}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-label font-semibold text-sub">
                  {new Date(entry.at).toLocaleDateString("ko-KR")}
                </span>
                <span className="text-body font-extrabold tracking-[0.12em] text-chip">
                  {entry.code}
                </span>
              </div>
              <p className="mt-2 text-body font-semibold">「{entry.codeName}」</p>
              <p className="mt-1.5 text-caption text-sub">{note}</p>
              {shifts.length > 0 && (
                <ChipRow className="mt-2.5">
                  {shifts.map((shift) => (
                    <Chip key={shift.title}>
                      {shift.from} → {shift.to}
                    </Chip>
                  ))}
                </ChipRow>
              )}
            </div>
          );
        })}
      </div>

      {/* 지금 걷는 판은 아직 봉인 전이라 연표에 없다 — 그래도 어디쯤인지는 보여준다 */}
      {last && (
        <div className="mt-6 border-t border-line pt-5.5">
          <Overline tight className="mb-2.75">
            지금 걷는 판
          </Overline>
          <p className="text-support text-sub">
            {livingIsNew
              ? `지난 판은 ${last.code}였어요. 지금은 ${code.mark} — ${living.map((s) => `${s.title.split(" ↔ ")[0]}/${s.title.split(" ↔ ")[1]} 갈래가 ${s.from}에서 ${s.to}으로`).join(", ")} 움직이는 중이에요.`
              : `지난 판과 같은 자리에 있어요 — ${last.code} 「${last.codeName}」.`}
          </p>
        </div>
      )}

      <div className="mt-7 border-t border-line pt-5.5 text-center">
        {seasonOpen ? (
          <>
            <p className="text-support text-sub">
              마지막 판을 봉인한 지 한 계절이 지났어요. 지금의 나로 다시 한 바퀴
              걸어볼까요? 지난 판은 지워지지 않고 여기 남아요.
            </p>
            <Button className="mt-5 w-full" onClick={onNewRun}>
              새 판 걸어보기
            </Button>
          </>
        ) : (
          <Note>
            다음 판은 {daysLeft}일 뒤에 권해드릴게요. 그때의 네 글자가 지금과 같을지
            달라질지는 그때 알 수 있어요.
          </Note>
        )}
      </div>
    </>
  );
}

/* ── 함께 놀기 ── */

export function PlayLinks({
  onMap,
  onTogether,
}: {
  onMap: () => void;
  onTogether: () => void;
}) {
  return (
    <div className="mt-6 grid gap-2.5 border-t border-line pt-5.5">
      <SkipLink onClick={onMap}>열여섯 자리의 지도에서 내 자리 보기</SkipLink>
      <SkipLink onClick={onTogether}>다른 사람과 결 겹쳐보기</SkipLink>
    </div>
  );
}
