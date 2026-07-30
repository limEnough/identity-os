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
import { ResumeBanner } from "./_components/ResumeBanner";
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
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 기억은 브라우저에만 있으므로 화면이 그려진 뒤에 되짚는다
  useEffect(() => {
    setResume(loadResume());
  }, []);

  const confirmStart = () => {
    forgetAll();
    store.save([]);
    router.push(`/${first.id}`);
  };

  return (
    <Screen>
      <Brand>IDENTITY OS</Brand>

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
