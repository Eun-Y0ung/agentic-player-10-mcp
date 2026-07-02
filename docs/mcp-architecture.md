# MCP Architecture: InternMate MCP

## 1. Goal

InternMate MCP는 사람인 채용정보 API를 사용해 대학생이 지원할 만한 인턴/신입 공고를 자연어로 검색하고, 추천 이유와 상세 정보를 카카오톡형 채팅 답변으로 제공하는 MCP 서버이다.

## 2. Proposed Structure

```text
src/
  server.ts
  tools/
    index.ts
    health.ts
    search-entry-jobs.ts
    get-job-detail.ts
    make-application-brief.ts
  services/
    saramin-client.ts
    job-query-service.ts
    job-ranking-service.ts
    job-detail-service.ts
    application-brief-service.ts
  schemas/
    index.ts
    common.ts
    jobs.ts
  utils/
    dates.ts
    format.ts
    errors.ts
tests/
  fixtures/
    saramin-jobs.ts
  services/
    job-query-service.test.ts
    job-ranking-service.test.ts
    job-detail-service.test.ts
  tools/
    search-entry-jobs.test.ts
    get-job-detail.test.ts
```

## 3. File Responsibilities

### `src/server.ts`

- MCP 서버 진입점이다.
- `McpServer`를 생성한다.
- `registerTools(server)`를 호출한다.
- `StdioServerTransport`를 연결한다.
- 사람인 API 호출, 추천 로직, 포맷팅 로직을 직접 포함하지 않는다.

### `src/tools/`

MCP tool registration과 handler를 둔다.

Recommended tools:

- `health.ts`: `health_check`
- `search-entry-jobs.ts`: `search_entry_jobs`
- `get-job-detail.ts`: `get_job_detail`
- `make-application-brief.ts`: `make_application_brief`
- `index.ts`: 모든 tool 등록

Tool handler responsibilities:

- 입력 schema 검증
- service 호출
- service 결과를 MCP `content` 배열로 변환
- 사용자 친화 오류 메시지 반환

### `src/services/`

비즈니스 로직을 둔다.

- `saramin-client.ts`: 사람인 API HTTP client, access key 처리, query parameter 구성
- `job-query-service.ts`: 자연어 조건을 검색 파라미터로 변환
- `job-ranking-service.ts`: 대학생 관점 추천 점수 계산
- `job-detail-service.ts`: 공고 상세 정보 정규화
- `application-brief-service.ts`: 지원 준비 체크리스트 생성

### `src/schemas/`

Zod input schema와 TypeScript type을 둔다.

- `common.ts`: 공통 enum, limit, date range, location
- `jobs.ts`: job search/detail/brief 관련 schema
- `index.ts`: schema export

Core schemas:

- `SearchEntryJobsInputSchema`
- `GetJobDetailInputSchema`
- `MakeApplicationBriefInputSchema`

### `src/utils/`

작고 재사용 가능한 유틸만 둔다.

- `dates.ts`: 오늘 기준 14일 마감 범위 계산, 날짜 포맷
- `format.ts`: 카카오톡형 bullet 응답, 링크 표시
- `errors.ts`: API key 누락, API 실패, 빈 결과 오류 변환

## 4. Data Flow

```text
사용자 자연어 질문
→ AI가 search_entry_jobs 호출
→ MCP 서버가 검색 조건을 구조화
→ 사람인 API 호출
→ 검색 결과 정규화
→ 대학생 관점 추천 점수 계산
→ 카카오톡형 텍스트 응답 반환
```

상세 조회 흐름:

```text
사용자: 1번 공고 자세히 알려줘
→ AI가 이전 결과의 job_id로 get_job_detail 호출
→ 사람인 API 상세 조회
→ 핵심 조건 요약 반환
```

## 5. Environment Variables

```text
SARAMIN_ACCESS_KEY=...
SARAMIN_API_BASE_URL=https://oapi.saramin.co.kr
```

Rules:

- API key는 코드에 하드코딩하지 않는다.
- API key가 없으면 tool은 명확한 설정 오류를 반환한다.
- 테스트에서는 실제 API key를 사용하지 않고 mock 또는 fixture를 사용한다.

## 6. MVP Tools

| Tool | MVP | Purpose |
|---|---:|---|
| `health_check` | Yes | 서버 상태 확인 |
| `search_entry_jobs` | Yes | 인턴/신입 공고 검색과 추천 |
| `get_job_detail` | Yes | 특정 공고 상세 요약 |
| `make_application_brief` | Optional | 지원 준비 체크리스트 생성 |

## 7. Implementation Priority

1. `search_entry_jobs`
2. `get_job_detail`
3. `make_application_brief`
4. response formatting polish
5. fixture fallback, if needed for demo stability

## 8. Testing Strategy

테스트는 사람인 API를 직접 호출하지 않는다.

Required tests:

1. 기본 요청 "IT 인턴"이 인턴/신입 검색 파라미터로 변환되는지
2. `deadline_within_days` 기본값이 14인지
3. 대학생 친화 공고가 높은 점수를 받는지
4. 빈 결과일 때 대체 검색 제안을 반환하는지
5. API key 누락 시 명확한 오류를 반환하는지
6. 상세 공고가 카카오톡형 요약으로 포맷되는지

