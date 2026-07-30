import {
  createLocalStore,
  encodeSeq,
  replayIdentity,
  replayStyle,
  STORAGE_KEY,
  STYLE_STORAGE_KEY,
} from "@identity-os/identity-core";

/**
 * 발자국을 기억하는 곳 — 축마다 하나. 서버에는 아무것도 저장하지 않는다.
 * 저장 방식을 아는 것은 앱 셸뿐이고, 피처는 props로 받은 콜백만 부른다(MFE 경계).
 */
export const identityStore = () => createLocalStore(STORAGE_KEY);
export const styleStore = () => createLocalStore(STYLE_STORAGE_KEY);

/** 새로 떠날 땐 무드 발자국도 함께 지운다 — Style은 Identity 위에 얹힌 잎이므로 */
export function forgetAll() {
  identityStore().clear();
  styleStore().clear();
}

/** 지난 발자국이 실제로 닿은 자리 */
export interface Resume {
  /** 축을 통틀어 걸어온 걸음 수 */
  steps: number;
  /** 이어 걸을 주소 — 걸어온 발자국을 전부 싣고 간다 */
  href: string;
}

/** 어긋난 발자국은 어긋나기 직전까지만 살린다 — 걷는 중의 복원 규칙과 같다 */
function healed(
  seq: number[],
  replay: (s: number[]) => { applied: number },
): number[] {
  return seq.slice(0, replay(seq).applied);
}

/**
 * 이어 걸을 자리를 발자국에서 되짚는다.
 *
 * 축을 하나만 보고 되돌아가면 뒤따르던 축의 기억이 주소에서 떨어져 나가,
 * 아직 걷지 않은 것처럼 보였다가 그 축에 들어서야 되살아난다.
 * 그래서 두 축을 함께 읽어 완주 지점까지의 발자국을 통째로 실어 보낸다.
 */
export function loadResume(): Resume | null {
  const identity = healed(identityStore().load(), replayIdentity);
  if (identity.length === 0) return null;

  const i = encodeSeq(identity);
  const identityOutcome = replayIdentity(identity);
  if (!identityOutcome.done) {
    return { steps: identity.length, href: `/identity?i=${i}` };
  }

  // Identity를 완주했을 때만 무드 발자국이 있을 수 있다 (불변식: Identity → Style)
  // 그 발자국은 확정된 가치 위에서만 되짚힌다 — 무드 좌표가 거기서 출발하므로
  const value = identityOutcome.state.value ?? "";
  const replay = (seq: number[]) => replayStyle(seq, value);
  const style = healed(styleStore().load(), replay);
  const steps = identity.length + style.length;
  if (style.length === 0) return { steps, href: `/guide?i=${i}` };

  const s = encodeSeq(style);
  return {
    steps,
    href: replay(style).done ? `/guide?i=${i}&s=${s}` : `/style?i=${i}&s=${s}`,
  };
}
