"use client";

import type { ReactNode } from "react";
import {
  Drawer,
  MenuIcon,
  Note,
  Overline,
  Tooltip,
  cn,
  iconSlot,
  surface,
  surfaceLift,
} from "@identity-os/design-system";
import type { ChronicleEntry } from "@identity-os/identity-core";
import type { Resume } from "../_lib/progress";

/**
 * 지난 여정으로 들어가는 손잡이와 서랍.
 *
 * 서랍 안에는 **성격이 다른 둘**이 있고, 섞이면 안 된다.
 *   · 걷고 있는 판 — 하나뿐이고, 누르면 **멈춘 다음 걸음**으로 이어 걷는다.
 *   · 끝까지 걸은 판 — 여럿일 수 있고, 누르면 그때의 가이드북이 펼쳐진다.
 * 한때 둘을 한 목록에 담았더니 걷다 만 판이 완주로 세어졌다 — "2판을 끝까지
 * 걸었어요"인데 실제로는 하나만 끝난 것. 세는 것은 완주한 판뿐이다.
 *
 * 끝까지 걸은 판은 발자국(`query`)째로 연표에 남아 있어서(§chronicle) 다시
 * 계산할 것이 없다 — 그 주소로 가이드북을 열면 그때의 결과가 그대로 펼쳐진다.
 *
 * 손잡이와 서랍이 따로 나가는 이유는 붙박이(fixed) 때문이다. 서랍은 화면을 통째로
 * 덮으므로 변형(transform)이 걸린 조상 아래 있으면 기준이 뷰포트에서 그 조상으로
 * 바뀐다 — 그래서 서랍은 언제나 `Screen`의 바로 아래, 떠오르지 않는 층에 둔다.
 */

/** 머리표 곁의 손잡이 — 여기서 여는 일만 한다 */
export function JourneyMenuButton({
  hinted,
  onOpen,
  onDismissHint,
}: {
  /** 손잡이가 새로 생겼다는 것을 아직 알리지 않았는지 */
  hinted: boolean;
  onOpen: () => void;
  onDismissHint: () => void;
}) {
  return (
    <span className="relative flex-none">
      <button
        type="button"
        aria-label="지난 여정 열기"
        aria-haspopup="dialog"
        className={cn(
          "flex size-9 cursor-pointer items-center justify-center rounded-btn",
          "border border-line bg-card text-ink shadow-soft",
          "transition-colors hover:border-edge hover:text-accent",
        )}
        onClick={onOpen}
      >
        <span className={cn(iconSlot, "text-[20px]")}>
          <MenuIcon aria-hidden />
        </span>
      </button>

      {hinted && (
        <Tooltip onDismiss={onDismissHint}>완주 기록이 있어요</Tooltip>
      )}
    </span>
  );
}

/** 서랍 속의 한 칸 — 걷던 판이든 끝낸 판이든 모양은 같다 */
function Card({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        surface,
        surfaceLift,
        "w-full rounded-tile px-4.5 py-4 text-left",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** 열린 서랍 — 걷던 판이 위, 끝낸 판이 아래 */
export function JourneyDrawer({
  runs,
  resume,
  onOpenRun,
  onResume,
  onClose,
}: {
  /** 끝까지 걸은 판들 — 오래된 것이 앞 */
  runs: ChronicleEntry[];
  /** 걷다 만 판 — 없으면 null */
  resume: Resume | null;
  onOpenRun: (entry: ChronicleEntry) => void;
  onResume: () => void;
  onClose: () => void;
}) {
  // 최근 판이 위로 — 돌아온 사람이 찾는 것은 대개 방금 끝낸 판이다
  const recent = [...runs].reverse();

  return (
    <Drawer title="지난 여정" onClose={onClose}>
      {resume && (
        <section className="mb-7">
          <Overline tight className="mb-2.75 tracking-[0.22em]">
            걷고 있는 여정
          </Overline>
          <Card onClick={onResume}>
            <p className="text-body font-semibold">
              {resume.steps}걸음까지 걸어왔어요
            </p>
            <p className="mt-1.5 text-caption text-sub">
              {resume.axisName
                ? `다음은 ${resume.axisName}이에요`
                : "여덟 축을 다 걸었어요"}
            </p>
            <p className="mt-3 text-caption font-semibold text-chip">
              멈춘 자리에서 이어 걷기 →
            </p>
          </Card>
        </section>
      )}

      <section>
        <Overline tight className="mb-2.75 tracking-[0.22em]">
          완주 기록
        </Overline>
        {runs.length === 0 ? (
          <p className="text-support text-sub">
            아직 끝까지 걸은 판이 없어요. 여덟 축을 다 걸으면 그날의 가이드북이
            여기 남아요.
          </p>
        ) : (
          <>
            <p className="text-support text-sub">
              {runs.length}판을 끝까지 걸었어요. 그때의 가이드북을 그대로
              펼쳐볼 수 있어요.
            </p>
            <div className="mt-3.5 grid gap-2.5">
              {recent.map((entry) => (
                <Card key={entry.at} onClick={() => onOpenRun(entry)}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-label font-semibold text-sub">
                      {new Date(entry.at).toLocaleDateString("ko-KR")}
                    </span>
                    <span className="text-body font-extrabold tracking-[0.12em] text-chip">
                      {entry.code}
                    </span>
                  </div>
                  <p className="mt-2 text-body font-semibold">
                    「{entry.codeName}」
                  </p>
                  {/* 네 글자보다 먼저 기억나는 것은 첫 축에서 고른 가치다 */}
                  {entry.value && (
                    <p className="mt-1.5 text-caption text-sub">
                      가치 — 「{entry.value}」
                    </p>
                  )}
                  <p className="mt-3 text-caption font-semibold text-chip">
                    이전 여정 확인하기 →
                  </p>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

      <Note className="mt-6">지난 판은 새 여정을 시작해도 지워지지 않아요.</Note>
    </Drawer>
  );
}
