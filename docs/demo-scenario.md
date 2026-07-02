# Demo Scenario: InternMate MCP

## Demo Flow 1: IT 인턴 추천

User:

```text
IT 기업 인턴 공고 찾아줘
```

Tool:

```text
search_entry_jobs
```

Arguments:

```json
{
  "keywords": "IT 인턴",
  "job_category": "it",
  "employment_type": "intern",
  "deadline_within_days": 14,
  "limit": 5
}
```

Expected answer shape:

```text
오늘 기준 14일 안에 마감되는 IT 인턴 관련 공고를 추천드립니다.

1. ABC테크 - 백엔드 개발 인턴
- 마감: 2026.07.12
- 지역: 서울 강남구
- 경력: 신입/경력무관
- 고용형태: 인턴
- 추천 이유: 검색 키워드와 공고 내용이 맞습니다. 인턴/신입/경력무관 조건에 가깝습니다.
- 링크: https://...

마감일과 지원 조건은 공고 원문에서 최종 확인해 주세요.
```

## Demo Flow 2: 상세 조회

User:

```text
1번 공고 자세히 알려줘
```

Tool:

```text
get_job_detail
```

Arguments:

```json
{
  "job_id": "1001",
  "include_application_brief": true
}
```

## Demo Flow 3: 지원 준비

User:

```text
이 공고 지원하려면 뭐 준비해야 해?
```

Tool:

```text
make_application_brief
```

Notes:

- 실제 데모 환경에서는 `SARAMIN_ACCESS_KEY`가 필요합니다.
- 단위 테스트와 로컬 검증은 fixture/mock 기반으로 수행합니다.
