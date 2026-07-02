# PlayMCP Submit

## Project Name

InternMate MCP

## Short Description

대학생과 취업 준비생이 자연어로 인턴/신입 공고를 찾으면, 사람인 채용정보 API를 조회해 2주 이내 마감 공고를 추천순으로 정리해 주는 MCP 서버입니다.

## Problem

채용 검색 조건을 직접 조합하기 어렵고, 공고 목록만으로는 지금 지원할 만한 공고인지 판단하기 어렵습니다. InternMate MCP는 직무, 지역, 고용 형태, 마감일을 바탕으로 대학생 관점의 추천 이유를 제공합니다.

## Core Features

- 자연어 기반 인턴/신입 공고 검색
- 기본 14일 이내 마감 공고 우선 추천
- 대학생 관점 추천 이유 제공
- 공고 상세 요약
- 지원 준비 체크리스트 생성

## Tools

- `health_check`
- `search_entry_jobs`
- `get_job_detail`
- `make_application_brief`

## Data Source

사람인 채용정보 API

## Environment

```text
SARAMIN_ACCESS_KEY=...
SARAMIN_API_BASE_URL=https://oapi.saramin.co.kr
```

## Demo Prompt

```text
IT 기업 인턴 공고 찾아줘
```

Follow-up:

```text
1번 공고 자세히 알려줘
```
