import { CODE_AXES, codeName, isCodeKey } from './axis/code';
import type { CodePole } from './axis/code';

/**
 * 겹쳐보기 — 두 사람의 네 글자를 나란히 놓는 자리.
 *
 * **점수도 궁합도 없다.** 사람을 견주기 시작하면 그 순간 이 제품은 판정기가 된다.
 * 그래서 산출물은 등급이 아니라 **질문**이다: 겹친 갈래는 겹쳤다고 적고,
 * 갈린 갈래에는 서로에게 물어볼 말 하나를 놓는다. 결과가 대화의 시작이 되도록.
 *
 * 오가는 것은 네 글자뿐이다 — 발자국도 이름도 넘기지 않는다. 내면의 기록은
 * 각자의 브라우저에 남고, 링크에는 결의 방향만 실린다.
 */

/** 갈래 하나가 갈렸을 때 서로에게 물어볼 말 */
const QUESTIONS: Record<string, string> = {
  reach:
    '한 가지를 오래 붙드는 편인지, 여러 갈래로 뻗는 편인지 서로 물어보세요.',
  form: '무언가를 시작할 때 계획을 먼저 세우는지, 하면서 정하는지 물어보세요.',
  modern:
    '요즘 가장 자주 꺼내 보는 것과, 가장 최근에 새로 시작한 것을 서로 말해보세요.',
  outward: '고민이 생겼을 때 가장 먼저 하는 일이 무엇인지 서로 물어보세요.',
};

/** 같은 쪽이라서 오히려 놓치기 쉬운 것 */
const BLINDSPOTS: Record<string, string> = {
  reach:
    '둘 다 같은 폭으로 움직여요. 반대쪽 사람과 있을 때 어땠는지 이야기해보세요.',
  form: '둘 다 같은 방식으로 시작해요. 그 방식이 통하지 않았던 때를 꺼내보세요.',
  modern: '둘 다 같은 시간을 보고 있어요. 반대쪽에 무엇이 있을지 함께 말해보세요.',
  outward: '둘 다 같은 방향으로 정리해요. 그래서 놓친 것이 있는지 물어보세요.',
};

export interface SharedFacet {
  title: string;
  pole: CodePole;
  note: string;
}

export interface PartedFacet {
  title: string;
  mine: CodePole;
  yours: CodePole;
  question: string;
}

export interface Overlay {
  mine: string;
  yours: string;
  mineName: string;
  yoursName: string;
  shared: SharedFacet[];
  parted: PartedFacet[];
  /** 오늘 서로에게 건넬 질문 하나 — 갈린 갈래가 있으면 거기서, 없으면 겹친 데서 */
  question: string;
  /** 한 줄 요약 — 등급이 아니라 사실만 */
  headline: string;
}

/** 두 네 글자를 나란히 놓는다. 열쇠가 성립하지 않으면 null. */
export function overlayCodes(
  mine: string | null | undefined,
  yours: string | null | undefined,
): Overlay | null {
  if (!isCodeKey(mine) || !isCodeKey(yours)) return null;

  const shared: SharedFacet[] = [];
  const parted: PartedFacet[] = [];

  CODE_AXES.forEach((axis, i) => {
    const poleOf = (key: string) =>
      key[i] === axis.plus.letter ? axis.plus : axis.minus;
    if (mine[i] === yours[i]) {
      shared.push({
        title: axis.title,
        pole: poleOf(mine),
        note: BLINDSPOTS[axis.key],
      });
    } else {
      parted.push({
        title: axis.title,
        mine: poleOf(mine),
        yours: poleOf(yours),
        question: QUESTIONS[axis.key],
      });
    }
  });

  const headline =
    parted.length === 0
      ? '네 갈래가 모두 같아요'
      : shared.length === 0
        ? '네 갈래가 모두 갈렸어요'
        : `${shared.length}개는 같고, ${parted.length}개는 갈렸어요`;

  return {
    mine,
    yours,
    mineName: codeName(mine).name,
    yoursName: codeName(yours).name,
    shared,
    parted,
    // 갈린 자리가 대화를 열기 가장 쉬운 자리다 — 없으면 겹친 자리의 사각을 묻는다
    question: parted[0]?.question ?? shared[0].note,
    headline,
  };
}
