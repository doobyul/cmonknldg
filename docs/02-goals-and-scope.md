## 목표 및 범위 (Goals & Scope)

### 핵심 목표
- 수험서(엑셀) 데이터를 구조화하여 트리(Book → Chapter → Section → Item)로 저장 및 시각화
- 항목 단위 학습 화면 제공 및 항목별 진척도 관리
- 비로그인 상태는 로컬(IndexedDB/LocalStorage) 저장, 로그인 시 클라우드 동기화

### 범위 (In-Scope)
- 엑셀 → JSON 변환 스크립트 작성
- Next.js(Typescript, App Router) 기반 웹앱 골격 구현
- `/book` 트리 뷰와 `/item/[id]` 항목 학습 화면의 기본 UI
- 로컬 진척도 저장 및 불러오기(비로그인 MVP)

### 범위 외 (Out-of-Scope, 초기)
- OAuth 연동 및 서버 기반 동기화 (Phase 2에서 구현)
- 고급 통계·대시보드 및 추천 알고리즘 (Phase 4)

### MVP 산출물
- `data/` 폴더에 엑셀 변환 결과(JSON)
- Next.js 프로젝트 초기화와 라우트(`/`, `/book`, `/item/[id]`) 스켈레톤
- 로컬 스토리지 기반 진척도 저장 기능과 간단한 UI

### 수용 기준 (Acceptance Criteria)
- 엑셀 파일을 JSON으로 변환해 `data/books.json` 생성 가능
- 트리 뷰에서 항목을 클릭하면 항목 페이지로 이동함
- 항목별 진척도를 로컬에 저장하고 재방문 시 복원됨

### 다음 작업(우선순위)
1. `README.md` 초안 작성 (프로젝트 목적, 개발 환경, 빠른 시작)
2. Next.js 프로젝트 스캐폴드 생성
3. 엑셀→JSON 변환 스크립트 템플릿 추가
