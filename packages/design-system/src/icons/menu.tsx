import type { IconProps } from "./svg-base";

/**
 * 메뉴 — 세 줄.
 *
 * 카테고리 아이콘들(§category)과 달리 **오라도 속빛도 없다.** 그것들은 화면 안에
 * 놓이는 그림이라 오브와 같은 문법으로 빛나지만, 이건 화면 밖에서 길을 여는
 * 손잡이다. 손잡이가 빛나면 여정보다 먼저 눈에 들어온다.
 *
 * 색은 `currentColor`를 따른다 — 놓이는 자리의 글자색을 그대로 입는다.
 */
export function MenuIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      role="img"
      {...props}
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
