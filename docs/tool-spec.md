# Tool Spec: InternMate MCP

사용자는 JSON을 직접 입력하지 않고 자연어로 질문합니다. 아래 Input은 MCP `tools/call` arguments 형식입니다.

## health_check

서버 상태 확인용 도구입니다.

Input:

```json
{}
```

Output:

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

## search_entry_jobs

사람인 채용정보 API에서 대학생이 지원해볼 만한 인턴/신입/경력무관 공고를 검색하고 추천순으로 정리합니다.

Input:

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

Fields:

- `keywords` required: 검색 키워드
- `job_category` optional: 직무 카테고리 힌트
- `location` optional: 선호 지역
- `employment_type` optional: `intern`, `newcomer`, `entry`, `any`; default `entry`
- `deadline_within_days` optional: default `14`
- `limit` optional: default `5`
- `student_profile` optional: 전공, 관심사, 선호 지역

Error cases:

- `keywords` 없음: `찾고 싶은 직무나 키워드를 입력해 주세요.`
- API key 없음: `사람인 API 키가 설정되지 않았습니다.`
- API 실패: `채용 공고를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.`
- 빈 결과: 조건 완화 제안 메시지 반환

## get_job_detail

공고 ID 또는 URL로 상세 정보를 요약합니다.

Input:

```json
{
  "job_id": "12345678",
  "job_url": "https://www.saramin.co.kr/...",
  "include_application_brief": false
}
```

Fields:

- `job_id` optional
- `job_url` optional
- `include_application_brief` optional: default `false`

`job_id` 또는 `job_url` 중 하나는 필요합니다.

Error cases:

- 식별자 없음: `상세 조회할 공고 ID 또는 URL이 필요합니다.`
- API key 없음: `사람인 API 키가 설정되지 않았습니다.`
- 공고 없음: `공고를 찾지 못했습니다. 마감되었거나 URL이 변경되었을 수 있습니다.`

## make_application_brief

선택한 공고에 지원하기 위한 준비 체크리스트를 만듭니다.

Input:

```json
{
  "job": {
    "title": "백엔드 개발 인턴",
    "company": "ABC테크",
    "deadline": "2026-07-12",
    "requirements": ["Java 경험 우대", "신입/경력무관"],
    "url": "https://..."
  },
  "student_profile": {
    "major": "컴퓨터공학",
    "portfolio_ready": false
  }
}
```

Error cases:

- `job` 없음: `체크리스트를 만들 공고 정보가 필요합니다.`
- `job.title` 없음: `공고명이 필요합니다.`

Notes:

- 실제 지원 제출은 하지 않습니다.
- 합격 가능성을 예측하지 않습니다.
- 조건이 불확실하면 원문 확인을 안내합니다.
