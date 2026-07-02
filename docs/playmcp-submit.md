# PlayMCP Submit

## Project Name

InternMate MCP

## Short Description

대학생이 자연어로 인턴/신입 공고를 찾으면 사람인 채용정보 API를 조회해 2주 이내 마감 공고를 추천순으로 정리해주는 MCP 서버입니다.

## Problem

대학생은 인턴과 신입 공고를 찾을 때 직무, 지역, 경력 조건, 마감일을 직접 조합해야 합니다. 채용 검색 결과는 많지만 지금 지원할 만한 공고를 빠르게 고르기는 어렵습니다.

## Core Features

- 자연어 기반 인턴/신입 공고 검색
- 기본 14일 이내 마감 공고 우선 추천
- 대학생 관점 추천 이유 제공
- 공고 상세 요약
- 지원 준비 체크리스트 생성

## Demo Prompt

```text
IT 기업 인턴 공고 찾아줘.
```

Follow-up:

```text
1번 공고 자세히 알려줘.
```

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

## Submission Checklist

- [ ] README 업데이트
- [ ] tool spec 완료
- [ ] demo scenario 완료
- [ ] 사람인 API key 설정 확인
- [ ] API mock 또는 fixture 테스트 준비
- [ ] 실행 영상 또는 스크린샷 준비

