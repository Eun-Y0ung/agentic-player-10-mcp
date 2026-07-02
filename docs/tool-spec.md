# Tool Spec: InternMate MCP

이 문서는 대학생 인턴/신입 공고 탐색 지원 MCP 서버의 tool 명세이다.

## Chat-based execution model

사용자는 JSON을 직접 입력하지 않는다. 사용자는 카카오톡형 AI 채팅창에 자연어로 질문한다.

```text
사용자:
IT 기업 인턴 공고 찾아줘.

AI 내부 tool 호출:
search_entry_jobs

최종 답변:
오늘 기준 2주 안에 마감되는 IT 인턴/신입 공고를 추천드릴게요.
...
```

이 문서의 `Input`은 MCP `tools/call`의 `arguments` 형식이다.

## health_check

### Purpose

MCP 서버가 정상적으로 실행 중인지 확인한다.

### When to use

서버 연결 상태 확인 또는 개발 중 smoke test에 사용한다.

### Input

```json
{}
```

### Input fields

| Field | Type | Required | Description |
|---|---|---:|---|
| N/A | N/A | No | 입력값이 없다. |

### Output

```json
{
  "content": [
    {
      "type": "text",
      "text": "Agentic Player 10 MCP server is running."
    }
  ]
}
```

### Success example

Request:

```json
{}
```

Response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Agentic Player 10 MCP server is running."
    }
  ]
}
```

### Error cases

| Case | Condition | Expected behavior |
|---|---|---|
| Server internal error | 서버 초기화 또는 transport 연결 실패 | MCP error로 반환한다. |

### Notes

- 사용자 기능과 분리한다.

## search_entry_jobs

### Purpose

사람인 채용정보 API에서 대학생이 지원할 만한 인턴/신입/경력무관 공고를 검색하고 추천순으로 정리한다.

### When to use

사용자가 "IT 기업 인턴 공고 찾아줘", "서울 마케팅 신입 추천해줘", "이번 주 마감인 데이터 인턴 알려줘"처럼 공고 탐색을 요청할 때 사용한다.

### Input

```json
{
  "keywords": "IT 인턴",
  "job_category": "it",
  "location": "서울",
  "employment_type": "intern",
  "deadline_within_days": 14,
  "limit": 5,
  "student_profile": {
    "major": "컴퓨터공학",
    "interests": ["백엔드", "데이터", "AI"],
    "preferred_locations": ["서울", "경기"]
  }
}
```

### Input fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `keywords` | string | Yes | 검색 키워드. 예: `IT 인턴`, `마케팅 신입`, `데이터 분석`. |
| `job_category` | string | No | 직무 카테고리. 예: `it`, `marketing`, `design`, `business`, `data`. |
| `location` | string | No | 선호 근무 지역. 예: `서울`, `경기`, `부산`, `원격`. |
| `employment_type` | `"intern" \| "newcomer" \| "entry" \| "any"` | No | 인턴/신입 우선 조건. 기본값은 `entry`. |
| `deadline_within_days` | number | No | 오늘부터 며칠 이내 마감 공고를 볼지. 기본값은 14. |
| `limit` | number | No | 반환할 최대 공고 수. 기본값은 5. |
| `student_profile` | object | No | 전공, 관심사, 선호 지역 등 추천 이유 보강용 정보. |

### Output

```json
{
  "content": [
    {
      "type": "text",
      "text": "오늘 기준 2주 안에 마감되는 IT 인턴/신입 공고를 추천드릴게요.\n\n1. ABC테크 - 백엔드 개발 인턴\n- 마감: 2026.07.12\n- 지역: 서울 강남구\n- 경력: 신입/경력무관\n- 추천 이유: IT 직무 키워드와 일치하고 마감까지 준비 시간이 있습니다.\n- 링크: https://..."
    }
  ]
}
```

### Success example

Request:

```json
{
  "keywords": "IT 기업 인턴",
  "job_category": "it",
  "employment_type": "intern",
  "deadline_within_days": 14,
  "limit": 5
}
```

Response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "오늘 기준 2주 안에 마감되는 IT 인턴/신입 공고를 추천드릴게요.\n\n1. ABC테크 - 백엔드 개발 인턴\n- 마감: 2026.07.12\n- 지역: 서울 강남구\n- 경력: 신입/경력무관\n- 추천 이유: IT 키워드와 일치하고 인턴 조건에 가깝습니다.\n- 링크: https://..."
    }
  ]
}
```

### Error cases

| Case | Condition | Expected behavior |
|---|---|---|
| Missing keyword | `keywords`가 비어 있음 | "찾고 싶은 직무나 키워드를 입력해 주세요." 반환 |
| Missing API key | `SARAMIN_ACCESS_KEY`가 없음 | "사람인 API 키가 설정되지 않았습니다." 반환 |
| API failure | 사람인 API 요청 실패 | "채용 공고를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." 반환 |
| Empty result | 조건에 맞는 공고 없음 | 조건을 완화한 재검색 제안 반환 |
| Invalid deadline range | `deadline_within_days`가 1 미만 또는 과도하게 큼 | validation error 또는 기본값 14 적용 |
| Internal error | 예상하지 못한 서버 오류 | 짧은 내부 오류 메시지 반환 |

### Notes

- 기본 마감 범위는 14일이다.
- 인턴, 신입, 경력무관 공고를 우선한다.
- 검색 결과는 최대 5개를 기본으로 한다.
- 원문 링크를 반드시 포함한다.
- 마감일과 조건은 공고 원문에서 최종 확인하도록 안내한다.

## get_job_detail

### Purpose

특정 채용 공고의 상세 정보를 조회하고 대학생 관점에서 핵심 조건을 요약한다.

### When to use

사용자가 "1번 공고 자세히 알려줘", "이 공고 지원 조건 뭐야?", "저 회사 공고 상세 보여줘"처럼 특정 공고를 더 알고 싶어 할 때 사용한다.

### Input

```json
{
  "job_id": "12345678",
  "job_url": "https://www.saramin.co.kr/...",
  "include_application_brief": false
}
```

### Input fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `job_id` | string | No | 사람인 공고 ID. `job_id` 또는 `job_url` 중 하나는 필요하다. |
| `job_url` | string | No | 사람인 공고 URL. |
| `include_application_brief` | boolean | No | 지원 준비 요약을 함께 포함할지 여부. 기본값은 false. |

### Output

```json
{
  "content": [
    {
      "type": "text",
      "text": "ABC테크 - 백엔드 개발 인턴\n\n- 마감: 2026.07.12\n- 지역: 서울 강남구\n- 경력: 신입/경력무관\n- 학력: 대졸 예정 가능\n- 근무형태: 인턴\n- 주요 키워드: Java, Spring, API\n\n추천 포인트\n- 컴공/IT 관심 학생에게 적합합니다.\n- 마감까지 10일 남아 지원 준비 시간이 있습니다.\n\n링크: https://..."
    }
  ]
}
```

### Success example

Request:

```json
{
  "job_id": "12345678",
  "include_application_brief": true
}
```

Response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "ABC테크 - 백엔드 개발 인턴\n\n- 마감: 2026.07.12\n- 지역: 서울 강남구\n- 경력: 신입/경력무관\n- 근무형태: 인턴\n\n준비할 것\n- 이력서\n- 자기소개서\n- GitHub 또는 포트폴리오 링크\n- 프로젝트 경험 1~2개 정리\n\n링크: https://..."
    }
  ]
}
```

### Error cases

| Case | Condition | Expected behavior |
|---|---|---|
| Missing identifier | `job_id`, `job_url`이 모두 없음 | "상세 조회할 공고 ID 또는 URL이 필요합니다." 반환 |
| Missing API key | `SARAMIN_ACCESS_KEY`가 없음 | API 키 설정 오류 반환 |
| Not found | 해당 공고를 찾을 수 없음 | "공고를 찾지 못했습니다. 마감되었거나 URL이 변경되었을 수 있습니다." 반환 |
| API failure | 사람인 API 요청 실패 | 재시도 안내 반환 |
| Internal error | 예상하지 못한 서버 오류 | 짧은 내부 오류 메시지 반환 |

### Notes

- 사용자가 "1번"이라고 말한 경우 AI가 이전 검색 결과의 `job_id`를 연결해야 한다.
- 공고 상세 원문을 길게 복사하지 않는다.
- 지원 조건은 확정적으로 판단하지 말고 원문 확인을 안내한다.

## make_application_brief

### Purpose

선택한 인턴/신입 공고에 지원하기 위해 준비해야 할 항목을 체크리스트로 정리한다.

### When to use

사용자가 "이 공고 지원하려면 뭐 준비해야 해?", "지원 체크리스트 만들어줘", "마감 전 할 일 정리해줘"처럼 지원 준비를 요청할 때 사용한다.

### Input

```json
{
  "job": {
    "title": "백엔드 개발 인턴",
    "company": "ABC테크",
    "deadline": "2026-07-12",
    "requirements": ["신입/경력무관", "Java 경험 우대"],
    "url": "https://..."
  },
  "student_profile": {
    "major": "컴퓨터공학",
    "portfolio_ready": false
  }
}
```

### Input fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `job` | object | Yes | 공고 요약 정보. |
| `job.title` | string | Yes | 공고명. |
| `job.company` | string | No | 회사명. |
| `job.deadline` | string | No | 마감일. |
| `job.requirements` | string[] | No | 자격 요건 또는 우대사항. |
| `job.url` | string | No | 원문 링크. |
| `student_profile` | object | No | 사용자 준비 상태. |

### Output

```json
{
  "content": [
    {
      "type": "text",
      "text": "지원 준비 체크리스트\n\n- [ ] 사람인 이력서 최신화\n- [ ] 자기소개서 초안 작성\n- [ ] 관련 프로젝트 1~2개 정리\n- [ ] GitHub/포트폴리오 링크 확인\n- [ ] 마감일 하루 전 제출\n\n마감: 2026.07.12\n링크: https://..."
    }
  ]
}
```

### Success example

Request:

```json
{
  "job": {
    "title": "백엔드 개발 인턴",
    "company": "ABC테크",
    "deadline": "2026-07-12",
    "requirements": ["Java 경험 우대", "신입/경력무관"],
    "url": "https://..."
  }
}
```

Response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "ABC테크 백엔드 개발 인턴 지원 준비 체크리스트\n\n- [ ] 이력서 최신화\n- [ ] Java/Spring 관련 프로젝트 정리\n- [ ] GitHub 또는 포트폴리오 링크 확인\n- [ ] 자기소개서에서 협업 경험 정리\n- [ ] 마감 하루 전 제출\n\n마감: 2026.07.12\n링크: https://..."
    }
  ]
}
```

### Error cases

| Case | Condition | Expected behavior |
|---|---|---|
| Missing job | `job`이 없음 | "체크리스트를 만들 공고 정보가 필요합니다." 반환 |
| Missing title | `job.title`이 없음 | "공고명이 필요합니다." 반환 |
| Too little detail | 요구사항이 거의 없음 | 일반 인턴/신입 지원 체크리스트를 반환하고 원문 확인 안내 |
| Internal error | 예상하지 못한 서버 오류 | 짧은 내부 오류 메시지 반환 |

### Notes

- 실제 지원 제출은 수행하지 않는다.
- 준비물은 5~7개 정도로 제한한다.
- "합격 가능성" 같은 판단은 하지 않는다.

## Implementation Priority

| Priority | Tool | MVP | User value | Difficulty |
|---|---|---:|---|---|
| 1 | `search_entry_jobs` | Yes | Very high | Medium |
| 2 | `get_job_detail` | Yes | High | Medium |
| 3 | `make_application_brief` | Optional | Medium-high | Low |
| 4 | `health_check` | Yes | Operational | Low |

