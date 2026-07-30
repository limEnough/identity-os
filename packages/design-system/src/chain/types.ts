/**
 * 여정 한 걸음의 겉모습 — 어느 축(Identity·Style)에서 왔는지는 묻지 않는다.
 *
 * identity-core의 IdentityStep·StyleStep이 그대로 들어맞는 구조적 타입이다.
 * 디자인 시스템이 도메인을 몰라도 두 체인을 같은 골격으로 그릴 수 있게 하는 접점.
 */
export interface ChainOptionView {
  emoji?: string;
  title: string;
  sub?: string;
  /** 시퀀스에 기록할 값 */
  choice: number;
}

export interface ChainStepView {
  /** 명명 단계는 코치가 말한다 — 그 밖은 화면이 묻는다 */
  kind: string;
  title: string;
  sub?: string;
  coachLines?: string[];
  options: ChainOptionView[];
  skippable: boolean;
  skipLabel?: string;
}
