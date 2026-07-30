import {
  AXES,
  createLocalStore,
  resumeHref,
  walkJourney,
} from "@identity-os/identity-core";
import type {
  AxisDef,
  Footprints,
  ProgressStore,
} from "@identity-os/identity-core";

/**
 * 발자국을 기억하는 곳 — 축마다 하나. 서버에는 아무것도 저장하지 않는다.
 * 저장 방식을 아는 것은 앱 셸뿐이고, 피처는 props로 받은 콜백만 부른다(MFE 경계).
 */
export const axisStore = (def: AxisDef): ProgressStore =>
  createLocalStore(def.storageKey);

/** 브라우저 기억에서 여덟 축의 발자국을 한 번에 읽는다 */
export function loadFootprints(): Footprints {
  const footprints: Footprints = {};
  for (const def of AXES) {
    const seq = axisStore(def).load();
    if (seq.length > 0) footprints[def.id] = seq;
  }
  return footprints;
}

/** 새로 떠날 땐 여덟 축을 모두 지운다 — 뒤 축은 앞 축 위에 얹혀 있으므로 */
export function forgetAll() {
  for (const def of AXES) axisStore(def).clear();
}

/**
 * 이 축부터 뒤를 모두 지운다.
 * 축을 다시 걸으면 그 위에 얹혀 있던 것들은 근거를 잃는다 — 남겨두면 거짓이 된다.
 */
export function forgetFrom(def: AxisDef) {
  const from = AXES.findIndex((a) => a.id === def.id);
  for (const later of AXES.slice(from)) axisStore(later).clear();
}

/** 지난 발자국이 실제로 닿은 자리 */
export interface Resume {
  /** 여덟 축을 통틀어 걸어온 걸음 수 */
  steps: number;
  /** 이어 걸을 주소 — 걸어온 발자국을 전부 싣고 간다 */
  href: string;
  /** 지금 걸어야 할 축의 이름 (여덟 축을 다 걸었으면 없다) */
  axisName?: string;
}

/**
 * 이어 걸을 자리를 발자국에서 되짚는다.
 *
 * 축 하나만 보고 되돌아가면 뒤따르던 축의 기억이 주소에서 떨어져 나가,
 * 아직 걷지 않은 것처럼 보였다가 그 축에 들어서야 되살아난다.
 * 그래서 여덟 축을 함께 읽어 걸어온 발자국을 통째로 실어 보낸다.
 */
export function loadResume(): Resume | null {
  const footprints = loadFootprints();
  const journey = walkJourney(footprints);
  if (journey.walked === 0) return null;
  return {
    steps: journey.walked,
    href: resumeHref(footprints),
    axisName: journey.current?.name,
  };
}
