/**
 * 여러 곳에서 똑같이 되풀이되는 유틸리티 조합 — 디자인 시스템의 문장 단위.
 *
 * CSS 클래스를 새로 만드는 대신 조합에 이름만 붙인다. 토큰(@theme)이 낱말이라면
 * 이쪽은 관용구다: "표면 한 겹", "손이 닿으면 떠오르는 것", "칩".
 *
 * 두 가지를 지킨다.
 *  1) 문자열은 정적으로 — Tailwind가 파일을 훑어 유틸리티를 만들기 때문.
 *  2) 굴곡·여백은 넣지 않는다 — 같은 속성의 유틸리티가 겹치면 승자는 문자열 순서가
 *     아니라 스타일시트 순서로 정해진다. 자리마다 다른 값은 쓰는 곳에서 적는다.
 */

/** 카드 한 겹 — 흰 면·얇은 테두리·낮게 퍼지는 그림자 (굴곡은 쓰는 곳에서) */
export const surface = "border border-line bg-card shadow-card";

/** 눌러 들어가는 표면 — 손이 닿으면 살짝 떠오른다 */
export const surfaceLift =
  "cursor-pointer transition-[transform,box-shadow,border-color] duration-250 hover:-translate-y-0.5 hover:border-edge hover:shadow-lift";

/** 강조 그라데이션 — 버튼·걸음 점·축 손잡이가 함께 쓴다 */
export const accentFill =
  "bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent2))]";

/** 알약 모양의 작은 라벨 */
export const chipBase =
  "rounded-full bg-tint px-3 py-1.5 text-caption font-semibold text-chip";

/** 아주 작은 라벨 — 자간을 벌려 조용히 말한다 */
export const overline = "text-label font-semibold text-sub";

/** 인용 막대 — 실천·표현처럼 '내가 하기로 한 것'을 왼쪽 선으로 묶는다 */
export const quoteBar = "border-l-[2.5px] border-rim py-0.5 pl-4.5";

/** 아이콘 자리 — 크기는 font-size(1em)가 정한다 */
export const iconSlot = "inline-flex flex-none leading-none";
