import { canon } from '../canon';
import { eul, iga } from '../../josa';
import type { AxisDef, AxisOpening, AxisOption, AxisOutcome } from '../types';

/**
 * 2. Mindset — 어떻게 생각하는가.
 *
 * Identity와 함께 뿌리를 이루는 축이다. 가치가 '무엇이 중요한가'라면
 * 여기서 묻는 것은 '그 중요한 것을 어떤 머리로 붙드는가'다.
 * 그래서 이 축은 Identity의 가치 위에서 걷는다 — 같은 순간을 만나도
 * 「단단함」을 아는 사람과 「호기심」을 아는 사람은 다른 생각을 먼저 꺼낸다.
 */

const OPENINGS: AxisOpening[] = [
  {
    emoji: '🧭',
    title: '무언가를 정해야 할 때',
    sub: '고를 것이 둘 이상 남았을 때',
    label: '정해야 하는 순간',
    short: '정해야 할 때의 머리',
    shift: [0.2, 0.7, 0.1],
    children: [
      { title: '기준을 먼저 정하고 대입한다', label: '기준을 먼저 세움', shift: [-0.1, 0.8, -0.1] },
      { title: '나중에 후회할 쪽을 지운다', label: '후회를 지움', shift: [-0.3, 0.4, -0.3] },
      { title: '마음이 기우는 쪽을 믿는다', label: '기우는 쪽을 믿음', shift: [0.2, -0.7, -0.2] },
      { title: '해보고 나서 판단한다', label: '해보고 판단함', shift: [0.8, 0.2, 0.3] },
    ],
    scoped: [
      { title: '고를 것이 너무 많아졌을 때', label: '고를 게 많아짐', phrase: '고를 것이 많아진 자리', shift: [-0.2, 0.3, -0.2] },
      { title: '누가 자꾸 재촉할 때', label: '재촉받는 순간', phrase: '재촉받는 순간', shift: [0.3, 0.2, 0.4] },
      { title: '되돌릴 수 없는 결정 앞에서', label: '되돌릴 수 없는 결정', phrase: '되돌릴 수 없는 결정 앞', shift: [-0.4, 0.5, -0.3] },
      { title: '어느 쪽이든 괜찮아 보일 때', label: '둘 다 괜찮아 보임', phrase: '둘 다 괜찮아 보이는 날', shift: [0.2, -0.4, 0.1] },
    ],
  },
  {
    emoji: '🌀',
    title: '예상이 틀어졌을 때',
    sub: '계획대로 되지 않은 자리에서',
    label: '틀어진 순간',
    short: '틀어졌을 때의 머리',
    shift: [0.4, -0.2, -0.1],
    children: [
      { title: '왜 틀어졌는지 되짚는다', label: '원인을 되짚음', shift: [-0.2, 0.7, -0.3] },
      { title: '다음 수를 바로 찾는다', label: '다음 수를 찾음', shift: [0.8, 0.3, 0.3] },
      { title: '일단 마음을 가라앉힌다', label: '마음을 가라앉힘', shift: [-0.7, -0.3, -0.4] },
      { title: '이것도 길이라고 받아들인다', label: '이것도 길이라 봄', shift: [0.2, -0.6, 0.1] },
    ],
    scoped: [
      { title: '남에게 설명해야 할 때', label: '설명해야 하는 자리', phrase: '설명해야 하는 자리', shift: [0.2, 0.5, 0.7] },
      { title: '내 탓처럼 느껴질 때', label: '내 탓처럼 느껴짐', phrase: '내 탓처럼 느껴지는 날', shift: [-0.4, 0.2, -0.6] },
      { title: '시간이 얼마 없을 때', label: '시간이 없음', phrase: '시간이 없는 자리', shift: [0.7, 0.4, 0.2] },
      { title: '아무렇지 않은 척하고 있을 때', label: '아무렇지 않은 척', phrase: '아무렇지 않은 척하던 순간', shift: [-0.3, 0.3, 0.3] },
    ],
  },
  {
    emoji: '⚖️',
    title: '누군가와 생각이 다를 때',
    sub: '맞다고 믿는 것이 부딪혔을 때',
    label: '생각이 다른 순간',
    short: '부딪혔을 때의 머리',
    shift: [0.1, 0.3, 0.6],
    children: [
      { title: '왜 그렇게 보는지 먼저 묻는다', label: '먼저 물음', shift: [-0.2, -0.3, 0.6] },
      { title: '내 근거를 또렷하게 세운다', label: '근거를 세움', shift: [0.2, 0.8, 0.5] },
      { title: '틀릴 수도 있다고 열어둔다', label: '틀릴 수 있다고 둠', shift: [0.1, -0.5, -0.2] },
      { title: '굳이 겨루지 않고 물러난다', label: '겨루지 않음', shift: [-0.6, -0.2, -0.5] },
    ],
    scoped: [
      { title: '여러 사람이 보고 있을 때', label: '여러 사람 앞', phrase: '여러 사람이 보던 자리', shift: [0.3, 0.4, 0.8] },
      { title: '가까운 사람과 부딪혔을 때', label: '가까운 사람과', phrase: '가까운 사람과 부딪힌 날', shift: [-0.2, -0.4, 0.2] },
      { title: '내가 아랫사람일 때', label: '아랫자리에서', phrase: '아랫자리에 있던 순간', shift: [-0.4, 0.2, -0.3] },
      { title: '이미 결론이 정해져 있을 때', label: '결론이 정해짐', phrase: '결론이 정해져 있던 자리', shift: [-0.3, 0.5, -0.2] },
    ],
  },
  {
    emoji: '🌙',
    title: '아무 일 없는 조용한 시간에',
    sub: '할 일이 없어 생각이 흐르는 자리',
    label: '조용한 시간',
    short: '조용할 때의 머리',
    shift: [-0.7, -0.3, -0.6],
    children: [
      { title: '지나간 일을 되짚는다', label: '지나간 일을 되짚음', shift: [-0.5, 0.3, -0.6] },
      { title: '앞일을 미리 그려본다', label: '앞일을 그려봄', shift: [0.4, 0.4, -0.2] },
      { title: '떠오르는 대로 흘려둔다', label: '떠오르는 대로 둠', shift: [0.3, -0.8, -0.3] },
      { title: '아무 생각 없이 비워둔다', label: '비워둠', shift: [-0.8, -0.4, -0.4] },
    ],
    scoped: [
      { title: '잠들기 전 누웠을 때', label: '잠들기 전', phrase: '잠들기 전의 시간', shift: [-0.6, -0.2, -0.6] },
      { title: '혼자 걷거나 이동할 때', label: '혼자 이동할 때', phrase: '혼자 걷던 길', shift: [-0.2, -0.2, -0.3] },
      { title: '주말 아침에', label: '주말 아침', phrase: '주말 아침', shift: [-0.4, -0.3, 0.1] },
      { title: '일이 막 끝난 직후에', label: '일이 끝난 직후', phrase: '일이 막 끝난 자리', shift: [0.2, 0.2, 0.2] },
    ],
  },
  {
    emoji: '📚',
    title: '새로운 것을 마주할 때',
    sub: '모르는 것이 앞에 놓였을 때',
    label: '새로운 것 앞',
    short: '새로운 것 앞의 머리',
    shift: [0.7, 0.2, 0.3],
    children: [
      { title: '전체 그림부터 훑는다', label: '전체를 훑음', shift: [0.4, 0.5, 0.2] },
      { title: '작은 것부터 손으로 해본다', label: '손으로 해봄', shift: [0.7, 0.1, 0.1] },
      { title: '아는 것에 붙여 이해한다', label: '아는 것에 붙임', shift: [0.1, 0.6, -0.4] },
      { title: '잘하는 사람을 먼저 본다', label: '잘하는 사람을 봄', shift: [0.3, -0.2, 0.7] },
    ],
    scoped: [
      { title: '아무도 안 가르쳐줄 때', label: '아무도 안 가르쳐줌', phrase: '혼자 익혀야 했던 자리', shift: [0.3, 0.5, -0.5] },
      { title: '남들이 벌써 잘하고 있을 때', label: '남들이 벌써 잘함', phrase: '남들이 앞서 있던 순간', shift: [0.4, 0.2, 0.6] },
      { title: '시간이 넉넉할 때', label: '시간이 넉넉함', phrase: '시간이 넉넉했던 날', shift: [-0.4, 0.1, -0.2] },
      { title: '틀리면 곤란한 자리일 때', label: '틀리면 곤란함', phrase: '틀리면 곤란한 자리', shift: [-0.2, 0.7, 0.2] },
    ],
  },
  {
    emoji: '🪫',
    title: '잘 안 되고 있을 때',
    sub: '노력이 결과로 오지 않는 자리',
    label: '잘 안 되는 순간',
    short: '안 될 때의 머리',
    shift: [-0.2, 0.1, -0.4],
    children: [
      { title: '방법을 바꿔본다', label: '방법을 바꿈', shift: [0.7, 0.3, 0.1] },
      { title: '더 버텨본다', label: '더 버팀', shift: [-0.1, 0.6, -0.5] },
      { title: '잠깐 놓고 쉰다', label: '놓고 쉼', shift: [-0.7, -0.3, -0.2] },
      { title: '누구에게든 물어본다', label: '물어봄', shift: [0.3, -0.4, 0.8] },
    ],
    scoped: [
      { title: '남과 비교하게 될 때', label: '비교하게 됨', phrase: '비교하게 되는 순간', shift: [0.2, 0.2, 0.6] },
      { title: '노력한 시간이 아까울 때', label: '시간이 아까움', phrase: '들인 시간이 아까운 날', shift: [-0.2, 0.5, -0.3] },
      { title: '나만 모르는 것 같을 때', label: '나만 모르는 것 같음', phrase: '나만 모르는 것 같던 자리', shift: [-0.3, -0.2, 0.4] },
      { title: '기대를 받고 있을 때', label: '기대를 받음', phrase: '기대를 받던 자리', shift: [0.1, 0.4, 0.5] },
    ],
  },
];

const FLOW: AxisOption[] = [
  { emoji: '🧩', title: '한 가지를 오래 붙들고 굴린다', label: '오래 붙들고 굶', shift: [-0.4, 0.5, -0.6] },
  { emoji: '🌊', title: '이것저것으로 자꾸 번져간다', label: '자꾸 번져감', shift: [0.7, -0.4, 0.2] },
  { emoji: '✂️', title: '결론을 먼저 내고 줄여간다', label: '결론부터 줄임', shift: [0.3, 0.8, 0.2] },
  { emoji: '🫧', title: '떠올랐다 사라지게 그냥 둔다', label: '흘려보냄', shift: [-0.5, -0.7, -0.2] },
  { emoji: '🗣', title: '말이나 글로 꺼내야 정리된다', label: '꺼내야 정리됨', shift: [0.4, 0.3, 0.8] },
  { emoji: '🚶', title: '몸을 움직이면 풀린다', label: '움직이면 풀림', shift: [0.6, -0.2, 0.1] },
];

const LEAN: AxisOption[] = [
  { title: '지금까지의 경험이요', label: '나의 경험', shift: [-0.2, 0.4, -0.6] },
  { title: '숫자나 근거로 확인된 것이요', label: '확인된 근거', shift: [-0.1, 0.8, 0.2] },
  { title: '그때의 느낌이요', label: '그때의 느낌', shift: [0.2, -0.8, -0.2] },
  { title: '믿는 사람의 말이요', label: '믿는 사람의 말', shift: [-0.2, -0.4, 0.7] },
  { title: '내가 되고 싶은 모습이요', label: '되고 싶은 모습', shift: [0.6, 0.2, 0.3] },
  { title: '해봐야 안다는 쪽이요', label: '해봐야 안다', shift: [0.8, 0, 0.2] },
];

const OUTCOMES: AxisOutcome[] = [
  {
    name: '고요한 직관',
    alt: '조용한 감각',
    tag: '가라앉은 자리에서 먼저 느끼고 나중에 설명하는 머리',
    anchor: '오늘 든 느낌 하나를 한 문장으로 적어두기',
    imprint: canon(-0.5, -0.5, -0.2, -0.5),
    facets: [
      { icon: 'chat', name: '말버릇', chips: ['"뭔가 좀…"', '"느낌이 그래요"', '천천히 꺼내는 말', '침묵을 견디는 편'] },
      { icon: 'window', name: '생각이 자라는 자리', chips: ['혼자 있는 방', '늦은 밤', '창가', '걷는 길'] },
      { icon: 'coat', name: '결정할 때', chips: ['서두르지 않기', '몸의 반응 보기', '하루 재워두기', '마음이 편한 쪽'] },
      { icon: 'box', name: '막혔을 때', chips: ['일단 덮어두기', '멀리 보기', '조용한 산책', '메모 한 줄'] },
    ],
    variants: ['안으로 잠기며', '느낌을 먼저 믿고', '가라앉힌 다음에야', '말보다 먼저 알아채며'],
  },
  {
    name: '따뜻한 헤아림',
    alt: '부드러운 살핌',
    tag: '사람의 사정을 먼저 헤아리는 데서 시작하는 머리',
    anchor: '누군가의 사정을 한 번 더 헤아려 보고 한 마디 건네기',
    imprint: canon(-0.2, -0.6, -0.1, 0.6),
    facets: [
      { icon: 'chat', name: '말버릇', chips: ['"그럴 수 있죠"', '"괜찮아요?"', '되묻는 질문', '부드러운 끝말'] },
      { icon: 'window', name: '생각이 자라는 자리', chips: ['둘이 마주 앉은 자리', '대화 중간', '함께 걷는 길', '남의 이야기 속'] },
      { icon: 'coat', name: '결정할 때', chips: ['누가 힘들어질지 보기', '함께 정하기', '조율하기', '급하지 않게'] },
      { icon: 'box', name: '막혔을 때', chips: ['사람에게 묻기', '털어놓기', '같이 있어 보기', '기대 낮추기'] },
    ],
    variants: ['곁을 살피며', '사람 쪽으로 기울어', '부드럽게 감싸며', '먼저 물어보고'],
  },
  {
    name: '차분한 정리',
    alt: '조용한 분별',
    tag: '소란을 걷어내고 남은 것을 정리해 두는 머리',
    anchor: '머릿속에 걸린 것들을 종이 한 장에 다 적어보기',
    imprint: canon(-0.4, 0.5, 0, -0.3),
    facets: [
      { icon: 'chat', name: '말버릇', chips: ['"정리하면요"', '"그러니까 결국"', '군더더기 없는 말', '조용한 결론'] },
      { icon: 'window', name: '생각이 자라는 자리', chips: ['책상 앞', '이른 아침', '비어 있는 노트', '조용한 카페'] },
      { icon: 'coat', name: '결정할 때', chips: ['기준을 먼저 적기', '항목으로 나누기', '지워가기', '한 번 더 확인'] },
      { icon: 'box', name: '막혔을 때', chips: ['목록으로 쪼개기', '가장 작은 것부터', '순서 다시 짜기', '남에게 설명해 보기'] },
    ],
    variants: ['차곡차곡 정리하며', '군더더기를 덜어내고', '조용히 분별하며', '남은 것만 남기고'],
  },
  {
    name: '또렷한 설명',
    alt: '단단한 논리',
    tag: '생각을 남이 알아들을 모양으로 세워 내미는 머리',
    anchor: '오늘 생각한 것 하나를 세 문장으로 남에게 설명해 보기',
    imprint: canon(0, 0.6, 0.3, 0.6),
    facets: [
      { icon: 'chat', name: '말버릇', chips: ['"이유는 셋이에요"', '"정확히 말하면"', '또렷한 발음', '결론 먼저'] },
      { icon: 'window', name: '생각이 자라는 자리', chips: ['화이트보드 앞', '회의 자리', '누군가에게 말하는 중', '글 쓰는 창'] },
      { icon: 'coat', name: '결정할 때', chips: ['근거를 갖추기', '반박을 미리 그리기', '기록으로 남기기', '분명히 말하기'] },
      { icon: 'box', name: '막혔을 때', chips: ['남에게 설명하기', '구조를 그리기', '용어를 정의하기', '반대 입장 써보기'] },
    ],
    variants: ['또렷하게 세우며', '밖으로 설명하며', '근거를 갖추고', '알아듣게 만들며'],
  },
  {
    name: '흐르는 상상',
    alt: '자유로운 연상',
    tag: '생각이 한자리에 머물지 않고 번져가는 머리',
    anchor: '오늘 떠오른 딴생각 하나를 버리지 않고 적어두기',
    imprint: canon(0.5, -0.5, 0.2, -0.2),
    facets: [
      { icon: 'chat', name: '말버릇', chips: ['"갑자기 생각났는데"', '"이거랑 비슷한데"', '자꾸 번지는 말', '비유가 많은 편'] },
      { icon: 'window', name: '생각이 자라는 자리', chips: ['버스 창가', '샤워 중', '낯선 동네', '음악 속'] },
      { icon: 'coat', name: '결정할 때', chips: ['여러 갈래 그려보기', '재미있는 쪽 보기', '여지를 남기기', '너무 좁히지 않기'] },
      { icon: 'box', name: '막혔을 때', chips: ['다른 일로 옮기기', '엉뚱한 것 붙여보기', '산책', '아무렇게나 써보기'] },
    ],
    variants: ['옆으로 번지며', '연상을 따라', '가볍게 흐르며', '엉뚱한 쪽으로도'],
  },
  {
    name: '열린 실험',
    alt: '가벼운 시도',
    tag: '머리로 다 따지기 전에 손으로 확인해 보는 머리',
    anchor: '알아보고 싶은 것 하나를 오늘 작게 시험해 보기',
    imprint: canon(0.6, -0.2, 0.4, 0.5),
    facets: [
      { icon: 'chat', name: '말버릇', chips: ['"해보면 알죠"', '"일단 한번"', '가벼운 제안', '실패를 웃으며'] },
      { icon: 'window', name: '생각이 자라는 자리', chips: ['만드는 책상', '사람들 사이', '새로 가본 곳', '해보는 중'] },
      { icon: 'coat', name: '결정할 때', chips: ['작게 먼저 해보기', '되돌릴 수 있게', '빨리 확인하기', '틀려도 괜찮게'] },
      { icon: 'box', name: '막혔을 때', chips: ['다른 방법 하나 더', '남에게 보여주기', '규모 줄이기', '오늘 안에 시도'] },
    ],
    variants: ['해보며 알아가고', '가볍게 시험하며', '밖에서 확인하며', '작게 먼저 던지고'],
  },
  {
    name: '집요한 탐구',
    alt: '깊은 파고듦',
    tag: '끝을 볼 때까지 한 자리를 파는 머리',
    anchor: '오늘 생긴 질문 하나를 삼십 분 끝까지 파보기',
    imprint: canon(0.3, 0.5, -0.4, -0.3),
    facets: [
      { icon: 'chat', name: '말버릇', chips: ['"근데 왜요?"', '"끝까지 보면"', '되묻는 말', '자세한 설명'] },
      { icon: 'window', name: '생각이 자라는 자리', chips: ['자료 더미 앞', '늦은 밤 작업실', '한 권을 다 읽는 자리', '기록해 둔 노트'] },
      { icon: 'coat', name: '결정할 때', chips: ['끝까지 알아보기', '근거를 모으기', '예외를 확인하기', '충분히 파고 결정'] },
      { icon: 'box', name: '막혔을 때', chips: ['처음으로 돌아가기', '원문 찾기', '작게 쪼개 검증', '기록 다시 읽기'] },
    ],
    variants: ['끝까지 파며', '깊은 쪽으로', '집요하게 되물으며', '한 자리를 오래'],
  },
  {
    name: '앞서는 판단',
    alt: '빠른 결단',
    tag: '충분해지기 전에 정하고 움직여 보정하는 머리',
    anchor: '미뤄둔 판단 하나를 오늘 안에 내려버리기',
    imprint: canon(0.7, 0.5, 0.5, 0.6),
    facets: [
      { icon: 'chat', name: '말버릇', chips: ['"이렇게 갑시다"', '"지금 정하죠"', '짧은 결론', '망설임 없는 어조'] },
      { icon: 'window', name: '생각이 자라는 자리', chips: ['움직이는 중', '급한 자리', '사람들 앞', '마감 직전'] },
      { icon: 'coat', name: '결정할 때', chips: ['7할이면 정하기', '먼저 정하고 보정', '되돌릴 여지 남기기', '분명히 알리기'] },
      { icon: 'box', name: '막혔을 때', chips: ['일단 정해보기', '기한을 세우기', '한 사람에게 확인', '작게 실행'] },
    ],
    variants: ['먼저 정하며', '앞서 판단하고', '움직이며 보정하며', '빠르게 밀고'],
  },
];

export const mindsetAxis: AxisDef = {
  id: 'mindset',
  no: '02',
  name: 'Mindset',
  blurb: '어떻게 생각하는 사람인가',
  brand: 'MINDSET · 생각의 결을 찾는 중',
  resultLabel: '생각의 결',
  chipLabels: ['순간', '먼저 하는 일', '자리', '흐름', '기대는 곳'],
  param: 'm',
  storageKey: 'identity-os:mindset:v1',
  poles: [
    { left: '머무는 생각', right: '움직이는 생각' },
    { left: '느낌으로', right: '따져서' },
    { left: '안에서', right: '밖에서' },
  ],
  projection: [
    { from: 'vivid', sign: 1 },
    { from: 'sharp', sign: 1 },
    { from: 'outward', sign: 1 },
  ],
  openings: OPENINGS,
  openingProbe: {
    title: '{root}이 가장 크게 시험되는\n순간은 언제인가요?',
    sub: '생각의 결은 편안할 때가 아니라 걸릴 때 드러나요.',
  },
  childProbe: {
    title: '그 순간, 당신이\n먼저 하는 일은?',
    sub: '옳은 방법이 아니라 실제로 먼저 하는 것으로.',
  },
  probes: [
    {
      title: '그 순간은 주로\n어떤 자리였나요?',
      sub: '같은 순간도 자리가 다르면 다른 머리를 쓰게 돼요.',
      skipLabel: '딱히 정해진 자리는 없어요 — 넘어갈래요',
      options: 'scoped',
    },
    {
      title: '당신의 생각은\n어떻게 흐르나요?',
      sub: '좋은 방식을 고르는 게 아니에요. 실제 모양에 가까운 쪽으로.',
      skipLabel: '잘 모르겠어요 — 넘어갈래요',
      options: FLOW,
    },
    {
      title: '결국 무엇에\n기대어 정하나요?',
      sub: '마지막 순간에 손을 얹는 곳이요.',
      skipLabel: '그때그때 달라요 — 넘어갈래요',
      options: LEAN,
    },
  ],
  outcomes: OUTCOMES,
  naming: 'octant',
  practiceProbe: {
    title: '생각의 결을 하루 속의\n작은 습관 하나로',
    sub: '머리를 바꾸는 게 아니에요. 이번 주에 한 번 알아차리기만.',
  },
  practices: ({ name, outcome, state, profile }) => {
    const root = profile.results[0];
    const options = [
      { action: outcome.anchor, caption: '생각은 적어야 보여요' },
      {
        action: `「${name}」${iga(name)} 잘 안 통했던 순간을 하루 끝에 한 줄로 적기`,
        caption: '판단 없이, 기록만',
      },
      {
        action: state.probes[0]?.phrase
          ? `${state.probes[0].phrase}에서 한 번은 반대 방식으로 생각해 보기`
          : '오늘 한 번은 평소와 반대 방식으로 생각해 보기',
        caption: '결은 뒤집어 봐야 자기 것이 돼요',
      },
    ];
    if (root) {
      options.push({
        action: `${root.resultLabel} 「${root.name}」${eul(root.name)} 「${name}」으로 설명해 보기 — 한 문장`,
        caption: '뿌리와 머리를 한 줄로 잇기',
      });
    }
    return options;
  },
};
