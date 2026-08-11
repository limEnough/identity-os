"use client";

import {
  Drawer,
  MenuIcon,
  Note,
  Tooltip,
  cn,
  iconSlot,
  surface,
  surfaceLift,
} from "@identity-os/design-system";
import type { ChronicleEntry } from "@identity-os/identity-core";

/**
 * 지난 판으로 들어가는 손잡이와 서랍 — **완주한 판이 있는 사람에게만** 놓인다.
 *
 * 처음 온 사람의 화면에는 없다. 여정을 시작하기도 전에 메뉴가 있으면 "어디부터
 * 봐야 하지"가 먼저 생기는데, 인트로가 하는 일은 물음 하나를 건네는 것뿐이므로.
 * 한 판을 끝내고 돌아온 사람에게만, 돌아갈 자리가 생겼다는 표시로 나타난다.
 *
 * 지난 판은 발자국(`query`)째로 연표에 남아 있어서(§chronicle) 다시 계산할 것이
 * 없다 — 그 주소로 가이드북을 열면 그때의 결과가 그대로 펼쳐진다.
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

/** 열린 서랍 — 봉인된 판들이 최근 것부터 쌓여 있다 */
export function JourneyDrawer({
  entries,
  onOpenRun,
  onClose,
}: {
  /** 봉인된 판들 — 오래된 것이 앞 */
  entries: ChronicleEntry[];
  onOpenRun: (entry: ChronicleEntry) => void;
  onClose: () => void;
}) {
  // 최근 판이 위로 — 돌아온 사람이 찾는 것은 대개 방금 끝낸 판이다
  const recent = [...entries].reverse();

  return (
    <Drawer title="지난 여정" onClose={onClose}>
      <p className="text-support text-sub">
        {entries.length}판을 끝까지 걸었어요. 그때의 가이드북을 그대로 펼쳐볼 수
        있어요.
      </p>

      <div className="mt-5 grid gap-2.5">
        {recent.map((entry) => (
          <button
            key={entry.at}
            type="button"
            className={cn(
              surface,
              surfaceLift,
              "w-full rounded-tile px-4.5 py-4 text-left",
            )}
            onClick={() => onOpenRun(entry)}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-label font-semibold text-sub">
                {new Date(entry.at).toLocaleDateString("ko-KR")}
              </span>
              <span className="text-body font-extrabold tracking-[0.12em] text-chip">
                {entry.code}
              </span>
            </div>
            <p className="mt-2 text-body font-semibold">「{entry.codeName}」</p>
            {/* 네 글자보다 먼저 기억나는 것은 첫 축에서 고른 가치다 */}
            {entry.value && (
              <p className="mt-1.5 text-caption text-sub">
                가치 — 「{entry.value}」
              </p>
            )}
            <p className="mt-3 text-caption font-semibold text-chip">
              이전 여정 확인하기 →
            </p>
          </button>
        ))}
      </div>

      <Note className="mt-6">지난 판은 새 여정을 시작해도 지워지지 않아요.</Note>
    </Drawer>
  );
}
