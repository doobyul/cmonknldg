CmonKnldg – Project Overview

1. 프로젝트 개요
CmonKnldg는 수험서 기반 학습을 체계적으로 관리하기 위한 웹앱이다.
    이 앱의 목적은:
    - 수험서를 DB화하여 구조적으로 정리하고
    - 챕터/섹션/항목 단위로 학습 진척도를 관리하며
    - 로그인 여부에 따라 진척도를 로컬 또는 계정에 저장하는 것

2. 핵심 목표
2.1 수험서 트리 구조 시각화
2.2 항목 단위 학습 화면 제공
2.3 항목별 진척도 관리
2.4 로그인 기반 클라우드 동기화
2.5 비로그인 상태에서는 로컬 저장 지원

3. 전체 시스템 구조
    사용자 브라우저
         ↓
    Next.js 웹앱 (Vercel 배포)
         ↓
    PostgreSQL DB (Supabase 등)

    코드 저장소:
    GitHub ← 프로젝트 코드 저장
    Vercel ← GitHub와 연동되어 자동 배포

4. 데이터 구조 개요
4.1 교재 구조 (정적 데이터)
    트리 구조:
    Book
     └─ Chapter
         └─ Section
             └─ Item
                 ├─ ItemContent (여러 개 가능)
                 └─ ItemReference (여러 개 가능)
4.2 엑셀 원본 구조
    엑셀 컬럼:
    - 챕터번호
    - 챕터명
    - 섹션번호
    - 섹션명
    - 항목번호
    - 항목명
    - 항목내용1~6
    - 참조명1~6
    - 참조내용1~6
    특징:
    - 챕터~항목명, 항목내용1은 필수
    - 항목내용은 여러 칸에 분산
    - 동일 항목번호가 여러 행으로 확장될 수 있음
4.3 DB 변환 원칙
    - (chapterNo, sectionNo, itemNo)를 하나의 Item으로 간주
    - 동일 itemNo가 여러 행이면 Item은 1개만 생성
    - 항목내용은 ItemContent로 누적 저장
    - 참조는 ItemReference로 누적 저장
    - 항목내용 개수 제한 없음

5. 진척도 저장 전략
5.1 비로그인 상태
    - 브라우저 LocalStorage 또는 IndexedDB에 저장
    - 다른 기기와 동기화 불가
5.2 로그인 상태 (Google OAuth 예정)
    - 사용자 ID 기준으로 DB에 저장
    - 여러 기기에서 동기화 가능
5.3 로그인 시 마이그레이션
    - 로컬에 저장된 진척도를 서버 DB로 업로드
    - 충돌 발생 시 최신 데이터 우선

6. 개발 단계 로드맵
Phase 1 – 로컬 MVP
    - Next.js 프로젝트 생성
    - 엑셀 → JSON 변환
    - 트리 UI 구현
    - 항목 상세 페이지 구현
    - 진척도 LocalStorage 저장
Phase 2 – 로그인 기능 추가
    - Google OAuth 연동
    - 사용자 테이블 추가
    - 로그인 시 서버 저장 활성화
Phase 3 – DB 연동
    - PostgreSQL 연결
    - 진척도 서버 저장
    - API Route 구현
Phase 4 – 대시보드 & 통계
    - 전체 진척도 계산
    - 최근 학습 기록
    - 미완료 항목 추천

7. 기술 스택 (예정)
    - Frontend & Backend: Next.js (App Router)
    - Language: TypeScript
    - Database: PostgreSQL
    - ORM: Prisma
    - Auth: Google OAuth (NextAuth 또는 Supabase Auth)
    - Deployment: Vercel
    - Version Control: Git + GitHub

8. 초기 화면 구성
8.1 / – 메인 페이지
8.2 /book – 교재 트리
8.3 /item/[id] – 항목 학습 화면
8.4 /dashboard – 진척도 대시보드
8.5 /settings – 로그인 및 데이터 설정

9. 현재 개발 환경
    - Windows
    - VSCode
    - Excel (데이터 정리용)
    - Node.js (설치 예정)
    - GitHub 계정 필요

10. 향후 확장 가능 기능
    - 북마크
    - 개인 메모
    - 오답 관리
    - 시험 D-Day 기반 학습 계획
    - 검색 기능
    - 모바일 UI 최적화

11. 요약
CmonKnldg는:
    - 엑셀 기반 수험서 데이터를 DB로 변환
    - 트리 구조로 탐색
    - 항목 단위 학습
    - 로그인 시 클라우드 저장
    - 비로그인 시 로컬 저장
    을 목표로 하는 학습 관리 웹앱이다.