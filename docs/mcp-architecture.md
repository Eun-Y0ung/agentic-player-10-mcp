# MCP Architecture: InternMate MCP

## Structure

```text
src/
  server.ts
  tools/
    index.ts
    health.ts
    search-entry-jobs.ts
    get-job-detail.ts
    make-application-brief.ts
  schemas/
    index.ts
    common.ts
    jobs.ts
  services/
    index.ts
    saramin-client.ts
    job-query-service.ts
    job-ranking-service.ts
    job-detail-service.ts
    application-brief-service.ts
  utils/
    dates.ts
    format.ts
    errors.ts
tests/
  fixtures/
  services/
  tools/
```

## Responsibilities

- `server.ts`: MCP 서버 생성과 stdio transport 연결
- `tools/`: MCP tool 등록, schema 검증, 사용자 친화 오류 응답
- `schemas/`: Zod input schema와 TypeScript type
- `services/saramin-client.ts`: 사람인 API access key, base URL, 응답 정규화
- `services/job-query-service.ts`: 검색 요청 구성과 검색 결과 포맷
- `services/job-ranking-service.ts`: 대학생 관점 추천 점수 계산
- `services/job-detail-service.ts`: 상세 공고 요약
- `services/application-brief-service.ts`: 지원 준비 체크리스트 생성
- `utils/`: 날짜, 포맷, 안전 오류 유틸

## Data Flow

```text
사용자 자연어 질문
-> AI가 search_entry_jobs 또는 get_job_detail 호출
-> MCP tool handler가 Zod schema 검증
-> service layer가 사람인 API 호출 또는 fixture client 사용
-> 공고 정규화, 추천 점수 계산, 텍스트 포맷
-> MCP content 배열로 반환
```

## Testing

단위 테스트는 실제 사람인 API를 호출하지 않습니다. `tests/fixtures/saramin-jobs.ts`의 mock client와 공고 데이터를 사용합니다.
