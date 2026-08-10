import { canon } from '../axis/canon';
import type { Canon } from '../axis/canon';

/**
 * 맺음의 노래들 — 읽는 것 옆에 놓이는 듣는 것.
 *
 * 가사는 싣지 않는다(권리 문제이기도 하고, 구절의 자리는 이미 책이 갖고 있으므로).
 * 노래가 갖는 것은 제목·부른 이, 그리고 **왜 이 결에 놓였는지 우리가 적은 한 줄**이다.
 * 링크도 두지 않는다 — 제목을 복사해 가서 각자 듣던 곳에서 듣는다.
 *
 * 구절과 마찬가지로, 넓히는 일은 여기에 줄을 더하는 데이터 작업이다.
 */
export interface Track {
  id: string;
  title: string;
  artist: string;
  /** 이 곡이 왜 이 결에 놓였는지 — 우리가 적는 한 줄 (가사가 아니다) */
  note: string;
  canon: Canon;
}

export const TRACKS: Track[] = [
  {
    id: 'nightletter',
    title: '밤편지',
    artist: '아이유',
    note: '잠들기 전, 마음을 한 칸 낮추는 자리',
    canon: canon(-0.7, -0.7, 0.2, -0.5),
  },
  {
    id: 'lovepoem',
    title: 'Love poem',
    artist: '아이유',
    note: '가라앉은 날에 곁을 지켜주는 곡',
    canon: canon(-0.6, -0.4, 0.1, 0.1),
  },
  {
    id: 'goodday',
    title: '좋은 날',
    artist: '아이유',
    note: '마음이 먼저 들뜨는 날의 곡',
    canon: canon(0.7, -0.2, 0, 0.6),
  },
  {
    id: 'youth',
    title: '청춘',
    artist: '산울림',
    note: '지나간 시간을 조용히 되짚는 곡',
    canon: canon(-0.4, -0.4, -0.9, -0.3),
  },
  {
    id: 'myworld',
    title: '그것만이 내 세상',
    artist: '들국화',
    note: '밀고 나갈 힘이 필요할 때',
    canon: canon(0.8, 0.7, -0.7, 0.6),
  },
  {
    id: 'everyday',
    title: '매일 그대와',
    artist: '들국화',
    note: '익숙한 사이가 더 좋아지는 곡',
    canon: canon(0.6, -0.4, -0.8, 0.5),
  },
  {
    id: 'ordinary',
    title: '보편적인 노래',
    artist: '언니네 이발관',
    note: '혼자 걷는 밤에 어울리는 곡',
    canon: canon(-0.3, -0.2, -0.5, -0.7),
  },
  {
    id: 'springday',
    title: '봄날',
    artist: '방탄소년단',
    note: '그리움을 오래 데우는 곡',
    canon: canon(-0.2, -0.4, -0.2, -0.2),
  },
  {
    id: 'dynamite',
    title: 'Dynamite',
    artist: '방탄소년단',
    note: '이유 없이 밝아지고 싶은 날',
    canon: canon(0.9, 0.2, 0.7, 0.8),
  },
  {
    id: 'ditto',
    title: 'Ditto',
    artist: 'NewJeans',
    note: '지금의 감각이 그대로 흐르는 곡',
    canon: canon(0.3, -0.5, 0.9, -0.2),
  },
  {
    id: 'supershy',
    title: 'Super Shy',
    artist: 'NewJeans',
    note: '설레지만 티내지 않는 마음',
    canon: canon(0.6, -0.5, 0.9, -0.4),
  },
  {
    id: 'antifragile',
    title: 'ANTIFRAGILE',
    artist: 'LE SSERAFIM',
    note: '버티기로 마음먹은 날',
    canon: canon(0.9, 0.9, 0.8, 0.8),
  },
  {
    id: 'yanggaeng',
    title: '밤양갱',
    artist: '비비',
    note: '담담하게 마음을 접는 곡',
    canon: canon(0.1, -0.5, 0.6, -0.3),
  },
  {
    id: 'noworry',
    title: '걱정말아요 그대',
    artist: '전인권',
    note: '지나온 것을 다독이는 곡',
    canon: canon(-0.3, -0.6, -0.8, 0.4),
  },
  {
    id: 'sogyeokdong',
    title: '소격동',
    artist: '서태지',
    note: '오래된 골목의 공기가 남은 곡',
    canon: canon(-0.5, -0.1, -0.7, -0.4),
  },
  {
    id: 'someonesdream',
    title: '어떤이의 꿈',
    artist: '봄여름가을겨울',
    note: '각자의 속도를 인정하게 하는 곡',
    canon: canon(0.2, 0.1, -0.7, 0.3),
  },
  {
    id: 'adolescence',
    title: '나의 사춘기에게',
    artist: '볼빨간사춘기',
    note: '지난 나에게 건네는 곡',
    canon: canon(0.3, -0.4, 0.2, -0.2),
  },
  {
    id: 'gymnopedie',
    title: 'Gymnopédie No.1',
    artist: '에릭 사티',
    note: '생각을 방해하지 않는 곡',
    canon: canon(-0.9, -0.5, -0.8, -0.7),
  },
  {
    id: 'clairdelune',
    title: 'Clair de Lune',
    artist: '클로드 드뷔시',
    note: '혼자 있는 밤을 넓히는 곡',
    canon: canon(-0.8, -0.4, -0.7, -0.6),
  },
  {
    id: 'nocturne',
    title: 'Nocturne Op.9 No.2',
    artist: '프레데리크 쇼팽',
    note: '느리게 흐르는 시간을 위한 곡',
    canon: canon(-0.8, -0.3, -0.9, -0.5),
  },
  {
    id: 'takefive',
    title: 'Take Five',
    artist: '데이브 브루벡',
    note: '정확한 리듬이 주는 쾌감',
    canon: canon(0.5, 0.7, -0.8, 0.3),
  },
  {
    id: 'time',
    title: 'Time',
    artist: '한스 짐머',
    note: '조용히 결심할 때 어울리는 곡',
    canon: canon(-0.4, 0.8, 0.4, -0.5),
  },
  {
    id: 'vivalavida',
    title: 'Viva La Vida',
    artist: 'Coldplay',
    note: '무너진 자리에서 다시 서는 곡',
    canon: canon(0.8, 0.6, 0.1, 0.7),
  },
  {
    id: 'flymetothemoon',
    title: 'Fly Me to the Moon',
    artist: 'Frank Sinatra',
    note: '가볍게 들뜨는, 오래된 곡',
    canon: canon(0.4, -0.2, -0.9, 0.5),
  },
  {
    id: 'goldenhour',
    title: 'Golden Hour',
    artist: 'JVKE',
    note: '지금이 좋은 순간이라는 감각',
    canon: canon(0.4, -0.4, 0.9, 0.3),
  },
  {
    id: 'weightless',
    title: 'Weightless',
    artist: 'Marconi Union',
    note: '숨을 고르기 위한 곡',
    canon: canon(-0.9, -0.6, 0.3, -0.8),
  },
  {
    id: 'anysong',
    title: '아무노래',
    artist: '지코',
    note: '생각을 멈추고 몸을 먼저 움직이는 곡',
    canon: canon(0.9, -0.1, 0.8, 0.9),
  },
  {
    id: 'hallelujah',
    title: 'Hallelujah',
    artist: '레너드 코헨',
    note: '기도처럼 낮게 읊조리는 곡',
    canon: canon(-0.5, 0.5, -0.8, 0.3),
  },
  {
    id: 'rightplace',
    title: 'Everything In Its Right Place',
    artist: 'Radiohead',
    note: '정돈되지 않은 마음을 정돈하는 곡',
    canon: canon(-0.4, 0.7, 0.6, -0.6),
  },
  {
    id: 'experience',
    title: 'Experience',
    artist: '루도비코 에이나우디',
    note: '천천히, 그러나 확실히 커지는 곡',
    canon: canon(-0.3, 0.4, 0.5, -0.3),
  },
];
