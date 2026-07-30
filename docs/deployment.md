# 배포 가이드 — Vercel

Identity OS ver1은 서버 코드가 없는 **완전 정적 Next.js 앱**이므로 Vercel 배포가 가장 단순한 경우에 해당한다.

## 1. 저장소 준비

```bash
cd identity-os
git init
git add -A
git commit -m "feat: Identity OS ver1"
# GitHub에 저장소를 만들고 push
git remote add origin git@github.com:<you>/identity-os.git
git push -u origin main
```

## 2. Vercel 프로젝트 생성

1. [vercel.com/new](https://vercel.com/new) → GitHub 저장소 `identity-os` 임포트
2. **Root Directory**를 `apps/web`으로 지정 (모노레포이므로 필수)
   - "Include source files outside of the Root Directory" 옵션은 켠 상태 유지 — `packages/*`를 참조하기 위해 필요
3. Framework Preset: **Next.js** (자동 감지됨)
4. Install Command: 기본값 (`npm install`) — Vercel이 워크스페이스 루트를 자동 인식한다
5. 환경 변수: **없음** (ver1)
6. Deploy

CLI를 선호하면:

```bash
npm i -g vercel
cd apps/web
vercel          # 프리뷰 배포
vercel --prod   # 프로덕션 배포
```

## 3. 모노레포에서의 빌드 동작

- `transpilePackages`(next.config.mjs)가 `@identity-os/identity-core`·`design-system`·`feature-identity`를 소스째 컴파일하므로 패키지별 사전 빌드가 필요 없다.
- 워크스페이스 패키지가 늘어나 빌드 시간이 문제가 되면 그때 Turborepo(`turbo build` + Vercel Remote Cache)를 도입한다 — 지금은 과잉이다.

## 4. MFE 승격 시나리오 (미래)

피처 패키지를 독립 배포하고 싶어지면(예: `feature-identity`의 질문 A/B 실험):

1. `apps/identity-zone` 같은 새 Next.js 앱을 만들어 해당 피처만 마운트
2. Vercel에 별도 프로젝트로 연결 (Root Directory만 다르게)
3. 메인 앱에서 [Multi-Zones](https://nextjs.org/docs/app/guides/multi-zones)로 `/identity` 경로를 해당 존으로 위임

피처가 라우팅·저장을 모르고 props만 받는 현재 규율이 지켜지는 한, 이 작업은 코드 변경이 아니라 배포 구성 변경이다.

---

# Supabase 연동 계획 (ver2 — 필요해질 때만)

## 도입 판단 기준

| 요구 | 클라이언트로 충분? | 결론 |
|---|---|---|
| Why 체인 진행·복원 | ✅ 발자국 URL + 브라우저 기억 | 불필요 |
| 나의 문장·가이드 열람 | ✅ `/guide?i=…` 리플레이 | 불필요 |
| 결과 링크 공유 (텍스트) | ✅ URL 자체 | 불필요 |
| **OG 이미지가 붙은 공유 카드** | ❌ 이미지 저장 필요 | Storage + Edge Function |
| **실천·회고 기록 (시계열)** | ❌ 기기 간 동기화·리마인드 | Auth + Postgres (RLS) |
| 가이드북 버전 히스토리 | ❌ | Postgres |

첫 도입 시점은 "실천·회고 루프"다. 그 전까지 Supabase 의존성을 추가하지 않는다.

## 확장 포인트 (이미 준비됨)

- `packages/identity-core/src/progress-store.ts`의 `ProgressStore` 인터페이스가 저장 추상화다.
  ver2에서 `createSupabaseStore(client, userId)` 구현체를 **추가**하면 되고, 피처 코드는 한 줄도 바뀌지 않는다.
- 익명→계정 승격 흐름: 로그인 시점에 `createLocalStore().load()`의 발자국을 Supabase로 밀어 넣고 로컬을 비운다.
- 환경 변수 자리는 `apps/web/.env.example`에 마련되어 있다.

## 스키마 초안 (ver2)

```sql
create table journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  seq text not null,              -- 발자국 (원본 상태)
  statement text not null,        -- 나의 문장 스냅샷
  version int not null default 1,
  created_at timestamptz default now()
);

create table reflections (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid references journeys not null,
  prompt text not null,
  answer text,
  created_at timestamptz default now()
);

alter table journeys enable row level security;
alter table reflections enable row level security;
-- 정책: 본인 행만 select/insert/update
```

주의: 내면 데이터는 민감하다 — Why 체인 원문 대신 발자국·요약만 저장, 전체 내보내기와 삭제권 UI를 계정 도입과 동시에 제공한다.
