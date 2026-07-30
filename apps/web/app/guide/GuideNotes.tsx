"use client";

import { useState, type ReactNode } from "react";
import {
  Button,
  cn,
  iconSlot,
  Modal,
  ModalActions,
  NoteIcon,
  Overline,
  surface,
  surfaceLift,
} from "@identity-os/design-system";

export interface GuideNote {
  key: string;
  label: string;
  hint: string;
  body: ReactNode;
}

/**
 * 오늘 완성된 것들 — 화면에 늘어놓지 않고 쪽지로 접어둔다.
 * 가이드북은 목차이지 낭독이 아니다: 읽는 건 펼쳐본 사람의 몫.
 */
export function NoteShelf({ notes }: { notes: GuideNote[] }) {
  /** 펼쳐본 쪽지의 key — 접혀 있으면 null */
  const [openKey, setOpenKey] = useState<string | null>(null);
  const opened = notes.find((note) => note.key === openKey) ?? null;

  return (
    <div className="mt-8.5">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        {notes.map((note) => (
          <button
            key={note.key}
            type="button"
            className={cn(
              surface,
              surfaceLift,
              "flex animate-rise flex-col items-center gap-2.25 rounded-tile px-4 pt-5 pb-4.5",
            )}
            onClick={() => setOpenKey(note.key)}
          >
            <span className={cn(iconSlot, "text-[44px]")}>
              <NoteIcon aria-hidden />
            </span>
            <span className="text-body font-semibold">{note.label}</span>
            <span className="text-center text-caption text-sub">
              {note.hint}
            </span>
          </button>
        ))}
      </div>

      {opened && (
        <Modal variant="note" onClose={() => setOpenKey(null)}>
          <Overline className="text-center">{opened.label}</Overline>
          {/* 무드 카드처럼 긴 쪽지는 팝업 안에서만 스크롤된다 */}
          <div className="mt-5 max-h-[62vh] overflow-y-auto text-body">
            {opened.body}
          </div>
          <ModalActions>
            <Button variant="ghost" onClick={() => setOpenKey(null)}>
              접어두기
            </Button>
          </ModalActions>
        </Modal>
      )}
    </div>
  );
}

/**
 * 한 쪽지 안의 둘째 칸 — 문장에서 나온 실천, 무드에서 나온 표현.
 * 가로줄 하나로만 나눈다: 같은 쪽지에 담긴 이유가 '이어진 것'이라서.
 */
export function NoteAside({
  when,
  action,
  caption,
}: {
  when: string;
  action: string;
  caption: string;
}) {
  return (
    <div className="mt-5.5 border-t border-line pt-5">
      <Overline tight className="mb-2.75">
        {when}
      </Overline>
      <p>
        {action}
        <span className="mt-1.5 block text-caption text-sub">{caption}</span>
      </p>
    </div>
  );
}
