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
  SkipLink,
  surface,
} from "@identity-os/design-system";
import {
  codeCoords,
  codeName,
  flipCode,
  SHELF_CAPACITY,
  shiftNote,
} from "@identity-os/identity-core";
import type {
  ChronicleEntry,
  Code,
  Gift,
  ShelfItem,
} from "@identity-os/identity-core";

/**
 * 간직되는 것들 — 네 글자 · 결 서재 · 결 연표.
 *
 * 셋 다 축 하나의 결과가 아니라 **여정 전체**에서 나온다. 그래서 축의 쪽지들보다 앞에
 * 놓이고, 판을 새로 걸어도(발자국이 지워져도) 서재와 연표는 남는다.
 */

/* ── 나의 네 글자 ── */

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
      <p className="mt-5.5 text-center text-[18px] font-semibold">
        「{code.name}」
      </p>
      <p className="mt-1.5 text-center text-support text-sub">{code.summary}</p>

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

/* ── 결 서재 ── */

export function ShelfNote({
  gift,
  shelf,
  ready,
  onTake,
}: {
  /** 오늘 꽂힐 꾸러미 — 이미 받았으면 null */
  gift: Gift | null;
  shelf: Array<ShelfItem & Gift>;
  ready: boolean;
  onTake: () => void;
}) {
  return (
    <>
      {ready && gift ? (
        <div>
          <Overline tight className="mb-3">
            오늘의 꾸러미
          </Overline>
          <GiftBody gift={gift} />
          <Button className="mt-6 w-full" onClick={onTake}>
            서재에 꽂아둘게요
          </Button>
        </div>
      ) : (
        <Note className="mb-1">
          오늘의 꾸러미는 이미 꽂혔어요. 내일 하나가 더 놓일 거예요.
        </Note>
      )}

      {shelf.length > 0 && (
        <div className={cn(ready && gift ? "mt-8 border-t border-line pt-6" : "mt-6")}>
          <Overline tight className="mb-3.5">
            서재 {shelf.length} / {SHELF_CAPACITY}칸
          </Overline>
          <div className="grid gap-4.5">
            {shelf.map((item) => (
              <div key={item.at + item.passageId} className={cn(surface, "rounded-tile px-5 py-4.5")}>
                <p className="mb-2.5 text-label font-semibold text-sub">
                  {new Date(item.at).toLocaleDateString("ko-KR")}
                </p>
                <GiftBody gift={item} compact />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * 꾸러미 하나 — 「한 구절, 그리고 그것이 온 곳」과 노래 하나.
 *
 * 링크는 없다. 제목만 복사해 간다 — 바깥으로 나가는 문을 만들면 선물이 광고가 된다.
 */
function GiftBody({ gift, compact = false }: { gift: Gift; compact?: boolean }) {
  const { passage, track } = gift;
  return (
    <>
      <blockquote className={quoteBar}>
        <p className={compact ? "text-support" : "text-body"}>{passage.text}</p>
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

      <div className={cn("border-t border-line", compact ? "mt-4.5 pt-4" : "mt-5.5 pt-5")}>
        <p className={compact ? "text-support font-semibold" : "text-body font-semibold"}>
          {track.title}
          <span className="ml-2 font-normal text-sub">{track.artist}</span>
        </p>
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
