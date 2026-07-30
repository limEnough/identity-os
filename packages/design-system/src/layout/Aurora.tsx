/**
 * 오로라 배경 — 화면 전체에 은은히 번지는 세 덩이의 빛.
 * 레이아웃에 한 번만 놓는다.
 */
export function Aurora() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      {/* blur는 래스터화가 비싸다. will-change로 자체 레이어에 올려두면 스크롤할 때마다
          다시 그리지 않고 컴포지터가 합성만 한다 — 없으면 스크롤 중 프레임이 튄다. */}
      <i className="absolute -top-35 -left-30 size-105 rounded-full bg-aurora1 opacity-55 blur-[70px] will-change-transform" />
      <i className="absolute top-[30%] -right-35 size-90 animate-drift rounded-full bg-aurora2 opacity-55 blur-[70px] will-change-transform" />
      <i className="absolute -bottom-40 left-[10%] size-95 animate-drift-back rounded-full bg-aurora3 opacity-55 blur-[70px] will-change-transform" />
    </div>
  );
}
