"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brand,
  Bubble,
  Button,
  Desc,
  FloatingCta,
  Heading,
  Modal,
  ModalActions,
  Orb,
  OrbStage,
  Screen,
} from "@identity-os/design-system";
import { AXES } from "@identity-os/identity-core";
import type { ChronicleEntry } from "@identity-os/identity-core";
import {
  JourneyDrawer,
  JourneyMenuButton,
} from "./_components/JourneyMenu";
import { ResumeBanner } from "./_components/ResumeBanner";
import { loadChronicle } from "./_lib/keepsake";
import {
  axisStore,
  forgetAll,
  loadResume,
  type Resume,
} from "./_lib/progress";

/**
 * 인트로 — 문득 묻는 것에서 여정이 시작된다.
 * 계정도, 서버 저장도 없다. 시작 전 confirm에서 "이렇게 당신을 알아볼게요"를 안내하고,
 * 확인하면 발자국을 이 브라우저에만 기억해둔다 (닫았다 와도 걷던 길 그대로).
 */
export default function IntroPage() {
  const router = useRouter();
  // 여정은 언제나 첫 축에서 시작한다 — 순서가 곧 의존이므로
  const first = AXES[0];
  const store = useMemo(() => axisStore(first), [first]);
  const [resume, setResume] = useState<Resume | null>(null);
  /** 끝까지 걸었던 판들 — 하나라도 있으면 재방문이다 */
  const [chronicle, setChronicle] = useState<ChronicleEntry[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  /** 손잡이가 새로 생겼다는 것을 한 번은 알린다 — 열어보면 할 일을 다한 말이다 */
  const [hinted, setHinted] = useState(true);

  // 기억은 브라우저에만 있으므로 화면이 그려진 뒤에 되짚는다
  useEffect(() => {
    setResume(loadResume());
    setChronicle(loadChronicle());
  }, []);

  const confirmStart = () => {
    forgetAll();
    store.save([]);
    router.push(`/${first.id}`);
  };

  return (
    <Screen>
      {/* 손잡이는 머리표 줄 오른쪽 끝에 — 완주한 판이 있는 사람에게만 놓인다 */}
      <div className="relative">
        <Brand>IDENTITY OS</Brand>
        {chronicle.length > 0 && (
          <div className="absolute -top-2 right-0">
            <JourneyMenuButton
              hinted={hinted && !menuOpen}
              onOpen={() => {
                setMenuOpen(true);
                setHinted(false);
              }}
              onDismissHint={() => setHinted(false)}
            />
          </div>
        )}
      </div>

      <OrbStage className="mt-8.5 mb-4.5">
        <Orb />
      </OrbStage>

      <Heading>
        문득 궁금해요,
        <br />
        나는 어떤 사람일까요?
      </Heading>

      <Desc>
        나를 이루는 요소들에 이름 붙여가며
        <br />
        나를 가다듬는 여정에 함께해요.
      </Desc>

      <Bubble>
        정답도, 점수도, 판정도 없어요
        <br />
        여정의 끝에 남는 것은 <strong>나의 문장</strong>입니다.
      </Bubble>

      {resume && (
        <ResumeBanner
          steps={resume.steps}
          onResume={() => router.push(resume.href)}
          onForget={() => {
            forgetAll();
            setResume(null);
          }}
        />
      )}

      <FloatingCta>
        <Button onClick={() => setConfirmOpen(true)}>여정 시작하기</Button>
      </FloatingCta>

      {/* 서랍은 떠오르지 않는 층에 둔다 — 변형이 걸린 조상 아래면 붙박이의 기준이 어긋난다 */}
      {menuOpen && (
        <JourneyDrawer
          entries={chronicle}
          onClose={() => setMenuOpen(false)}
          // 서랍을 먼저 닫는다 — 스크롤 잠금이 풀린 뒤에 새 화면이 그려지도록
          onOpenRun={(entry) => {
            setMenuOpen(false);
            router.push(`/guide?${entry.query}`);
          }}
        />
      )}

      {confirmOpen && (
        <Modal onClose={() => setConfirmOpen(false)}>
          <p className="mt-4.5 text-body">
            회원가입은 필요 없어요.
            <br />
            걸어온 길은 이 브라우저에만 저장할게요.
            <br />
            <br />
            <b className="text-accent">확인</b>을 누르면 여정이 시작돼요.
          </p>
          <ModalActions>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              다음에요
            </Button>
            <Button onClick={confirmStart}>확인</Button>
          </ModalActions>
        </Modal>
      )}
    </Screen>
  );
}
