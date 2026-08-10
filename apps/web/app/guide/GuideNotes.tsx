"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Button,
  cn,
  iconSlot,
  Modal,
  ModalActions,
  NoteIcon,
  Overline,
  surface,
} from "@identity-os/design-system";

export interface GuideNote {
  key: string;
  label: string;
  hint: string;
  body: ReactNode;
  /** 맺음 하나만 — 금빛으로 켜진다 */
  gold?: boolean;
}

/**
 * 펼쳐본 것이 올라오는 무대 — 쪽지도 축의 결과도 같은 팝업 하나를 쓴다.
 * 무대가 둘이면 같은 것을 두 가지 방식으로 보게 된다.
 */
export function NoteModal({
  label,
  hint,
  gold = false,
  onClose,
  children,
}: {
  label: string;
  /** 제목 아래 한 줄 — 쪽지에서는 접혀 있던 것 */
  hint?: string;
  gold?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  /** 아래에 더 읽을 것이 남았는지 — 페이드를 켜고 끄는 유일한 조건 */
  const [more, setMore] = useState(false);

  const syncFade = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 4);
  }, []);

  // 열릴 때 한 번 재고, 창이 바뀌면 다시 잰다 — 짧은 쪽지에는 페이드가 아예 켜지지 않는다
  useEffect(() => {
    syncFade();
    window.addEventListener("resize", syncFade);
    return () => window.removeEventListener("resize", syncFade);
  }, [syncFade, children]);

  return (
    <Modal variant="note" onClose={onClose}>
      {/**
       * Overline을 그대로 쓰지 않는다 — 그 관용구가 이미 text-sub를 물고 있어서
       * text-gold를 덧대면 승자가 스타일시트 순서로 정해진다(recipes.ts의 규칙).
       * 색이 갈리는 자리에서는 색을 직접 적는다.
       */}
      <p
        className={cn(
          "text-center text-label font-semibold tracking-[0.28em]",
          gold ? "text-gold" : "text-sub",
        )}
      >
        {label}
      </p>
      {hint && <p className="mt-2 text-center text-caption text-sub">{hint}</p>}

      {/**
       * 무드 카드처럼 긴 쪽지는 팝업 안에서만 스크롤된다.
       *
       * 두 가지를 여기서 해결한다.
       *  1. **그림자가 잘리지 않게.** overflow-y를 auto로 두면 CSS가 overflow-x도
       *     함께 auto로 만들어, 안쪽 카드의 그림자가 좌우에서만 싹둑 잘린다(위아래는
       *     스크롤 여유가 있어 멀쩡하니 더 어긋나 보인다). 판을 좌우로 12px 넓히고
       *     (-mx-3) 같은 만큼 안쪽 여백을 주어(px-3) 글의 폭은 그대로 두면서
       *     그림자가 번질 자리를 만든다.
       *  2. **잘린 글이 아니라 사라지는 글로.** 아래가 더 있으면 페이드가 덮는다.
       */}
      <div className="relative -mx-3 mt-5">
        <div
          ref={scroller}
          onScroll={syncFade}
          className="max-h-[62vh] overflow-y-auto px-3 pb-3 text-body"
        >
          {children}
        </div>
        {/* 끝까지 읽었으면 걷힌다 — 마지막 줄까지 흐려두면 그건 페이드가 아니라 안개다 */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-11 bg-[linear-gradient(to_top,var(--color-card),transparent)] transition-opacity duration-200",
            more ? "opacity-100" : "opacity-0",
          )}
        />
      </div>

      <ModalActions tight>
        <Button variant="ghost" onClick={onClose}>
          접어두기
        </Button>
      </ModalActions>
    </Modal>
  );
}

/**
 * 간직할 것들이 붙는 판 — 쪽지는 **작게, 붙어 있는 것처럼** 놓인다.
 *
 * 한때 쪽지 하나가 150px짜리 카드였다. 여덟 축의 결과까지 여기 쌓였을 땐 그 크기가
 * 목록으로 읽혔지만, 여정 전체에서 나온 둘만 남기고 나니 카드 두 장이 화면 한 폭을
 * 차지했다 — 작은 것을 크게 만들면 중요해 보이는 게 아니라 비어 보인다.
 *
 * 그래서 판 하나에 압정으로 붙인 쪽지가 됐다. 살짝 기울어져 있고, 손이 닿으면
 * 반듯해진다. 무엇이 적혔는지는 여전히 펼쳐본 사람의 몫이다.
 */
export function NoteBoard({ notes }: { notes: GuideNote[] }) {
  /** 펼쳐본 쪽지의 key — 접혀 있으면 null */
  const [openKey, setOpenKey] = useState<string | null>(null);
  const opened = notes.find((note) => note.key === openKey) ?? null;

  if (notes.length === 0) return null;

  return (
    <div className="mt-8.5 rounded-card border border-line bg-tint/45 px-5 py-6">
      <Overline tight className="mb-5 text-center">
        간직할 것
      </Overline>

      <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-5">
        {notes.map((note, i) => (
          <button
            key={note.key}
            type="button"
            className="w-20 cursor-pointer text-center"
            onClick={() => setOpenKey(note.key)}
            title={note.hint}
          >
            <span
              className={cn(
                // 붙어 있는 느낌은 기울기가 만든다 — 손이 닿으면 반듯해진다
                "flex size-20 items-center justify-center rounded-tile transition-transform duration-250",
                i % 2 === 0 ? "-rotate-3" : "rotate-3",
                "hover:rotate-0 hover:-translate-y-0.5",
                note.gold
                  ? "animate-shine border border-gold-line bg-gold-tint text-gold"
                  : cn(surface, "text-chip"),
              )}
            >
              <span
                className={cn(iconSlot, "text-[38px]")}
                /* 아이콘의 다섯 빛깔은 변수로 열려 있다 — 금빛 쪽지에서는 금빛으로 */
                style={
                  note.gold
                    ? ({
                        "--em-c1": "#FFF6D4",
                        "--em-c2": "#FFE292",
                        "--em-c3": "#F3C24F",
                        "--em-c4": "#D99C22",
                        "--em-c5": "#A9791A",
                      } as CSSProperties)
                    : undefined
                }
              >
                {/* 금빛 쪽지는 제 그라데이션을 따로 가져야 한다 — 안 그러면 옆 쪽지까지 물든다 */}
                <NoteIcon idPrefix={`note-${note.key}`} aria-hidden />
              </span>
            </span>
            <span
              className={cn(
                "mt-2.5 block text-caption font-semibold",
                note.gold ? "text-gold" : "text-sub",
              )}
            >
              {note.label}
            </span>
          </button>
        ))}
      </div>

      {opened && (
        <NoteModal
          label={opened.label}
          hint={opened.hint}
          gold={opened.gold}
          onClose={() => setOpenKey(null)}
        >
          {opened.body}
        </NoteModal>
      )}
    </div>
  );
}
