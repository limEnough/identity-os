import { decodeSeq, encodeSeq } from './seq';

/**
 * 여정 저장 어댑터 — 서버에 아무것도 저장하지 않는다.
 * "이렇게 당신을 알아볼게요": 발자국을 이 브라우저에만 기억해둔다.
 * 사용자에게는 localStorage 같은 기술 용어를 노출하지 않는다.
 */
export interface ProgressStore {
  load(): number[];
  save(seq: number[]): void;
  clear(): void;
}

export const STORAGE_KEY = 'identity-os:v1';
/** Style 여정의 발자국 — Identity와 따로 기억한다 (Identity를 다시 걸어도 무드는 남는다) */
export const STYLE_STORAGE_KEY = 'identity-os:style:v1';

export function createLocalStore(key: string = STORAGE_KEY): ProgressStore {
  return {
    load() {
      try {
        return decodeSeq(globalThis.localStorage?.getItem(key));
      } catch {
        return [];
      }
    },
    save(seq) {
      try {
        globalThis.localStorage?.setItem(key, encodeSeq(seq));
      } catch {
        /* 저장 불가 환경(시크릿 모드 등)은 조용히 무시 — 여정은 계속된다 */
      }
    },
    clear() {
      try {
        globalThis.localStorage?.removeItem(key);
      } catch {
        /* noop */
      }
    },
  };
}
