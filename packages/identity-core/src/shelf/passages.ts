import { canon } from '../axis/canon';
import type { Canon } from '../axis/canon';

/**
 * 결 서재의 구절들 — 「한 구절, 그리고 그것이 온 곳」.
 *
 * 추천이 아니라 **선물**이다. 그래서 형태가 "당신에게 이 책을 권합니다"가 아니라
 * "이 구절이 당신의 결과 같은 곳을 짚어요, 그리고 이건 그 구절이 온 책이에요"다 —
 * 판정도 처방도 하지 않는다는 불변식이 이 형태 하나로 지켜진다.
 *
 * 고르는 방식은 축과 같다: 구절마다 결(Canon)을 적어두고, 걸어온 사람의 누적 결에
 * 가장 가까운 것을 고른다. **그래서 서재를 넓히는 일은 화면 작업이 아니라 여기에
 * 줄을 더하는 데이터 작업이다.**
 *
 * 여기 실린 것은 널리 알려진 짧은 인용과 그 출처뿐이다. 본문을 싣지 않고, 링크도 두지
 * 않는다 — 제목은 복사해 갈 수 있게만 한다. 줄을 더할 때는 출처를 반드시 확인할 것.
 */
export interface Passage {
  id: string;
  /** 한 구절 — 짧게 */
  text: string;
  /** 그것이 온 곳 */
  source: string;
  author: string;
  /** 이 구절이 서 있는 자리 */
  canon: Canon;
}

export const PASSAGES: Passage[] = [
  {
    id: 'prince',
    text: '가장 중요한 것은 눈에 보이지 않아.',
    source: '어린 왕자',
    author: '앙투안 드 생텍쥐페리',
    canon: canon(-0.5, -0.6, -0.4, -0.3),
  },
  {
    id: 'demian',
    text: '새는 알에서 나오려고 투쟁한다.',
    source: '데미안',
    author: '헤르만 헤세',
    canon: canon(0.5, 0.6, 0.2, 0.1),
  },
  {
    id: 'oldman',
    text: '인간은 파괴될 수는 있어도 패배하지는 않는다.',
    source: '노인과 바다',
    author: '어니스트 헤밍웨이',
    canon: canon(0.4, 0.8, -0.3, 0.2),
  },
  {
    id: 'walden',
    text: '내가 숲으로 간 것은, 의도적으로 살아보고 싶었기 때문이다.',
    source: '월든',
    author: '헨리 데이비드 소로',
    canon: canon(-0.6, 0.1, -0.7, -0.7),
  },
  {
    id: 'momo',
    text: '시간은 삶이며, 삶은 우리 마음속에 깃들어 있다.',
    source: '모모',
    author: '미하엘 엔데',
    canon: canon(-0.4, -0.3, -0.5, -0.2),
  },
  {
    id: 'ajar',
    text: '사람은 사랑할 사람 없이는 살 수 없다.',
    source: '자기 앞의 생',
    author: '에밀 아자르',
    canon: canon(0.1, -0.7, -0.2, 0.6),
  },
  {
    id: 'siddhartha',
    text: '지식은 전할 수 있어도, 지혜는 전할 수 없다.',
    source: '싯다르타',
    author: '헤르만 헤세',
    canon: canon(-0.5, 0.3, -0.7, -0.6),
  },
  {
    id: 'epictetus',
    text: '사람을 흔드는 것은 일어난 일이 아니라, 그 일을 두고 품은 생각이다.',
    source: '엥케이리디온',
    author: '에픽테토스',
    canon: canon(-0.3, 0.7, -0.8, -0.4),
  },
  {
    id: 'frankl',
    text: '주어진 상황에서 자기 태도를 정할 자유만은 빼앗기지 않는다.',
    source: '죽음의 수용소에서',
    author: '빅터 프랭클',
    canon: canon(-0.2, 0.8, -0.3, -0.3),
  },
  {
    id: 'sisyphus',
    text: '정상을 향한 투쟁 그 자체만으로 인간의 마음을 채우기에 충분하다.',
    source: '시지프 신화',
    author: '알베르 카뮈',
    canon: canon(0.3, 0.7, -0.4, -0.2),
  },
  {
    id: 'anne',
    text: '내일은 아직 아무 실수도 저지르지 않은 새날이라는 게 참 좋지 않나요?',
    source: '빨간 머리 앤',
    author: '루시 모드 몽고메리',
    canon: canon(0.7, -0.4, 0.4, 0.4),
  },
  {
    id: 'alice',
    text: '어제로 돌아가 봐야 소용없어. 그때 나는 다른 사람이었으니까.',
    source: '이상한 나라의 앨리스',
    author: '루이스 캐럴',
    canon: canon(0.6, -0.1, 0.4, 0.2),
  },
  {
    id: 'laozi',
    text: '가장 좋은 것은 물과 같다.',
    source: '도덕경',
    author: '노자',
    canon: canon(-0.6, -0.7, -0.9, -0.1),
  },
  {
    id: 'zhuangzi',
    text: '우물 안 개구리에게는 바다를 이야기할 수 없다.',
    source: '장자',
    author: '장자',
    canon: canon(0.3, 0.3, -0.8, 0.3),
  },
  {
    id: 'analects',
    text: '배우고 때때로 익히면 또한 기쁘지 아니한가.',
    source: '논어',
    author: '공자',
    canon: canon(0.1, 0.4, -0.9, -0.1),
  },
  {
    id: 'faust',
    text: '멈추어라, 너는 정말 아름답구나.',
    source: '파우스트',
    author: '요한 볼프강 폰 괴테',
    canon: canon(0.4, -0.3, -0.6, 0.1),
  },
  {
    id: 'yun',
    text: '죽는 날까지 하늘을 우러러 한 점 부끄럼이 없기를.',
    source: '하늘과 바람과 별과 시',
    author: '윤동주',
    canon: canon(-0.4, 0.7, -0.6, -0.5),
  },
  {
    id: 'natae',
    text: '자세히 보아야 예쁘다. 오래 보아야 사랑스럽다. 너도 그렇다.',
    source: '풀꽃',
    author: '나태주',
    canon: canon(-0.5, -0.7, -0.3, 0.2),
  },
  {
    id: 'kimsowol',
    text: '나 보기가 역겨워 가실 때에는, 말없이 고이 보내 드리오리다.',
    source: '진달래꽃',
    author: '김소월',
    canon: canon(-0.5, -0.6, -0.9, -0.1),
  },
  {
    id: 'snowcountry',
    text: '국경의 긴 터널을 빠져나오자, 눈의 고장이었다.',
    source: '설국',
    author: '가와바타 야스나리',
    canon: canon(-0.7, -0.2, -0.5, -0.4),
  },
  {
    id: 'karenina',
    text: '행복한 가정은 모두 비슷하지만, 불행한 가정은 저마다의 이유로 불행하다.',
    source: '안나 카레니나',
    author: '레프 톨스토이',
    canon: canon(0.1, 0.6, -0.7, 0.3),
  },
  {
    id: 'emerson',
    text: '질투는 무지이며, 모방은 자살이다.',
    source: '자기 신뢰',
    author: '랄프 왈도 에머슨',
    canon: canon(-0.1, 0.8, -0.4, 0.3),
  },
  {
    id: 'murakami',
    text: '고통은 피할 수 없지만, 괴로움은 선택이다.',
    source: '달리기를 말할 때 내가 하고 싶은 이야기',
    author: '무라카미 하루키',
    canon: canon(0.6, 0.5, 0.3, -0.5),
  },
  {
    id: 'totto',
    text: '너는 정말 착한 아이란다.',
    source: '창가의 토토',
    author: '구로야나기 테츠코',
    canon: canon(0.5, -0.6, 0.2, -0.3),
  },
  {
    id: 'morrie',
    text: '사랑을 주는 법과, 사랑을 받아들이는 법을 배우세요.',
    source: '모리와 함께한 화요일',
    author: '미치 앨봄',
    canon: canon(-0.2, -0.5, 0.3, 0.6),
  },
  {
    id: 'pippi',
    text: '난 한 번도 해본 적 없어. 그러니까 분명히 잘할 수 있을 거야.',
    source: '삐삐 롱스타킹',
    author: '아스트리드 린드그렌',
    canon: canon(0.8, 0.3, 0.6, 0.6),
  },
  {
    id: 'adler',
    text: '인간의 모든 고민은 인간관계에서 비롯된다.',
    source: '미움받을 용기',
    author: '기시미 이치로 · 고가 후미타케',
    canon: canon(0.2, 0.6, 0.5, 0.6),
  },
  {
    id: 'atomic',
    text: '목표를 세우는 대신, 시스템을 만든다.',
    source: '아주 작은 습관의 힘',
    author: '제임스 클리어',
    canon: canon(0.3, 0.8, 0.7, 0.1),
  },
  {
    id: 'sapiens',
    text: '우리는 그 어느 때보다 강력해졌지만, 무엇을 원해야 하는지는 여전히 모른다.',
    source: '사피엔스',
    author: '유발 하라리',
    canon: canon(0.3, 0.7, 0.9, 0.4),
  },
];
