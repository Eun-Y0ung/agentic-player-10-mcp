# PRD: InternMate MCP

## Product Summary

InternMate MCP는 대학생과 취업 준비생이 자연어로 인턴/신입/경력무관 공고를 찾도록 돕는 TypeScript MCP 서버입니다. 사용자가 "IT 기업 인턴 공고 찾아줘"처럼 질문하면 사람인 채용정보 API를 조회하고, 기본적으로 오늘 기준 14일 안에 마감되는 공고를 추천순으로 정리합니다.

## One-line Pitch

사람인 채용정보 API를 기반으로 대학생이 지금 지원해볼 만한 인턴/신입 공고를 자연어로 찾아주고 추천 이유까지 정리하는 MCP 서버.

## Target Users

- 인턴을 찾는 대학생
- 신입 공고를 찾는 졸업 예정자
- 경력무관 공고를 찾는 취업 준비생
- 취업 동아리, 스터디, 멘토링 환경

## Problem

채용 사이트 검색 조건은 복잡하고, 공고 목록만으로는 대학생이 지금 지원할 만한지 판단하기 어렵습니다. InternMate MCP는 직무, 키워드, 지역, 고용 형태, 마감 범위를 구조화해 공고를 추천하고, 왜 추천하는지 짧게 설명합니다.

## Data Source

1차 데이터 소스는 사람인 채용정보 API입니다.

- API key는 `SARAMIN_ACCESS_KEY` 환경 변수에서 읽습니다.
- API base URL은 `SARAMIN_API_BASE_URL`을 사용하고, 없으면 `https://oapi.saramin.co.kr`를 기본값으로 사용합니다.
- 단위 테스트에서는 실제 API를 호출하지 않고 fixture/mock을 사용합니다.

## MVP Scope

Must-have:

- `search_entry_jobs`: 자연어 조건 기반 인턴/신입/경력무관 공고 검색
- `get_job_detail`: 공고 ID 또는 URL 기반 상세 요약
- 기본 마감 범위 14일
- 기본 추천 개수 5개
- 카카오톡에서 읽기 쉬운 텍스트 응답
- API key 누락, API 실패, 빈 결과 처리

Nice-to-have:

- `make_application_brief`: 선택 공고 지원 준비 체크리스트 생성

## Ranking Criteria

- 키워드 매칭
- 인턴/신입/경력무관 적합도
- 14일 이내 마감 여부
- 너무 촉박하지 않은 마감일
- 지역 조건 일치
- 전공/관심사와의 연결성

## Non-goals

- 실제 지원 제출
- 합격 가능성 예측
- 사용자 이력서나 개인정보 저장
- 사람인 외 전체 채용 사이트 통합 검색

## Acceptance Criteria

- MCP 응답은 `content` 배열의 텍스트로 반환한다.
- `search_entry_jobs`는 기본값으로 14일 이내 마감 공고를 추천한다.
- `get_job_detail`은 공고 ID 또는 URL 기반 상세 요약을 반환한다.
- API key가 없으면 명확하고 안전한 오류 메시지를 반환한다.
- 상세 조건이 불확실하면 원문 링크 확인을 안내한다.
- 테스트는 mock 또는 fixture를 사용한다.
