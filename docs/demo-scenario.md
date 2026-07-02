# Demo Scenario: InternMate MCP

## Goal

Agentic Player 10 MCP 테스트 환경에서 사용자가 자연어 질문만으로 대학생에게 적합한 인턴/신입 공고를 찾는 흐름을 보여준다.

## Demo Flow 1: IT 인턴 추천

### User

```text
IT 기업 인턴 공고 찾아줘.
```

### Tool Call

```text
search_entry_jobs
```

Arguments:

```json
{
  "keywords": "IT 기업 인턴",
  "job_category": "it",
  "employment_type": "intern",
  "deadline_within_days": 14,
  "limit": 5
}
```

### Expected Answer

```text
오늘 기준 2주 안에 마감되는 IT 인턴/신입 공고를 추천드릴게요.

1. ABC테크 - 백엔드 개발 인턴
- 마감: 2026.07.12
- 지역: 서울 강남구
- 경력: 신입/경력무관
- 추천 이유: IT 직무 키워드와 일치하고 마감까지 준비 시간이 있습니다.
- 링크: https://...

2. 데이터랩 - 데이터 분석 인턴
- 마감: 2026.07.15
- 지역: 경기 성남시
- 경력: 인턴
- 추천 이유: 데이터 직무 관심자에게 적합합니다.
- 링크: https://...
```

## Demo Flow 2: 상세 조회

### User

```text
1번 공고 자세히 알려줘.
```

### Tool Call

```text
get_job_detail
```

Arguments:

```json
{
  "job_id": "12345678",
  "include_application_brief": true
}
```

### Expected Answer

```text
ABC테크 - 백엔드 개발 인턴

- 마감: 2026.07.12
- 지역: 서울 강남구
- 경력: 신입/경력무관
- 근무형태: 인턴
- 주요 키워드: Java, Spring, API

준비할 것
- 이력서 최신화
- GitHub 또는 포트폴리오 링크
- 백엔드 프로젝트 경험 1~2개 정리

링크: https://...
```

## Demo Flow 3: 조건 검색

### User

```text
서울에서 지원 가능한 마케팅 신입 공고 추천해줘.
```

### Tool Call

```text
search_entry_jobs
```

Arguments:

```json
{
  "keywords": "마케팅 신입",
  "job_category": "marketing",
  "location": "서울",
  "employment_type": "newcomer",
  "deadline_within_days": 14,
  "limit": 5
}
```

## Demo Notes

- 실제 데모에서는 사람인 API key가 필요하다.
- API key가 준비되지 않은 경우 mock fixture 기반 응답으로 flow를 검증할 수 있다.
- 최종 답변은 긴 리포트보다 카카오톡에서 읽기 쉬운 bullet 중심으로 구성한다.

