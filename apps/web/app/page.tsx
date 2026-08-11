"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brand,
  Bubble,
  Button,
  CtaRow,
  Desc,
  FloatingCta,
  Heading,
  Modal,
  ModalActions,
  Orb,
  OrbStage,
  Screen,
  Tooltip,
} from "@identity-os/design-system";
import { AXES } from "@identity-os/identity-core";
import type { ChronicleEntry } from "@identity-os/identity-core";
import {
  JourneyDrawer,
  JourneyMenuButton,
} from "./_components/JourneyMenu";
import { loadSealedRuns } from "./_lib/keepsake";
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
  /** 끝까지 걸은 판들 — 하나라도 있으면 재방문이다 */
  const [runs, setRuns] = useState<ChronicleEntry[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  /** 손잡이가 새로 생겼다는 것을 한 번은 알린다 — 열어보면 할 일을 다한 말이다 */
  const [hinted, setHinted] = useState(true);
  /** 남은 발자국을 알리는 말 — 눌러서 접을 수 있다 */
  const [noted, setNoted] = useState(true);

  // 기억은 브라우저에만 있으므로 화면이 그려진 뒤에 되짚는다
  useEffect(() => {
    setResume(loadResume());
    setRuns(loadSealedRuns());
  }, []);

  const confirmStart = () => {
    forgetAll();
    store.save([]);
    router.push(`/${first.id}`);
  };

  /**
   * 손잡이는 **끝까지 걸은 판이 있을 때만** 놓인다.
   * 걷다 만 판은 하단 CTA가 맡는다 — 서랍을 열어야 이어 걸을 수 있으면 한 걸음이 는다.
   */
  const hasRuns = runs.length > 0;

  return (
    <Screen>
      {/* 손잡이는 머리표 줄 오른쪽 끝에 — 완주한 판이 있는 사람에게만 놓인다 */}
      <div className="relative">
        <Brand>IDENTITY OS</Brand>
        {hasRuns && (
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

      {/**
       * 걷다 만 판이 있으면 **갈래 둘**을 나란히 놓는다.
       * 세로로 쌓으면 위가 먼저인 것처럼 읽히지만, 이어 걷기와 새로 떠나기는
       * 순서가 아니라 둘 중 하나다.
       *
       * 발자국을 알리는 말은 **누를 버튼 바로 위**에 붙는다. 한때 화면 한가운데
       * 배너로 놓았는데, 알리는 자리와 고르는 자리가 멀어 눈이 두 번 움직였다 —
       * 무엇이 남아 있는지와 그래서 무엇을 누르면 되는지는 한자리에 있어야 한다.
       */}
      <FloatingCta>
        {resume ? (
          <CtaRow>
            <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
              새로 떠나기
            </Button>
            <span className="relative">
              {noted && (
                <Tooltip placement="above" onDismiss={() => setNoted(false)}>
                  지난 여정의 발자국이 남아 있어요 — {resume.steps}걸음까지
                  걸어왔네요.
                  {resume.axisName
                    ? ` 다음은 ${resume.axisName}이에요.`
                    : " 여덟 축을 모두 걸었어요."}
                </Tooltip>
              )}
              <Button onClick={() => router.push(resume.href)}>
                이어서 걷기
              </Button>
            </span>
          </CtaRow>
        ) : (
          <Button onClick={() => setConfirmOpen(true)}>여정 시작하기</Button>
        )}
      </FloatingCta>

      {/* 서랍은 떠오르지 않는 층에 둔다 — 변형이 걸린 조상 아래면 붙박이의 기준이 어긋난다 */}
      {menuOpen && (
        <JourneyDrawer
          runs={runs}
          resume={resume}
          onClose={() => setMenuOpen(false)}
          // 서랍을 먼저 닫는다 — 스크롤 잠금이 풀린 뒤에 새 화면이 그려지도록
          onOpenRun={(entry) => {
            setMenuOpen(false);
            router.push(`/guide?${entry.query}`);
          }}
          onResume={() => {
            setMenuOpen(false);
            if (resume) router.push(resume.href);
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
            {/* 되돌릴 수 없는 것은 미리 말한다 — 완주한 판은 지워지지 않는다 */}
            {resume ? (
              <>
                새로 떠나면 <b>걷던 {resume.steps}걸음은 지워져요.</b>
                <br />
                끝까지 걸었던 판은 그대로 남아요.
              </>
            ) : (
              <>
                <b className="text-accent">확인</b>을 누르면 여정이 시작돼요.
              </>
            )}
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
