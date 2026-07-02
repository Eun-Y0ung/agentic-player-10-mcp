# MCP Architecture: TeamTok MCP

## 1. Goal

TeamTok MCP는 대학생 팀플 카카오톡 대화에서 역할, 마감, 결정사항, 미정 항목, 제출 체크리스트, 리마인드 메시지를 추출하거나 생성하는 MCP 서버이다.

이 문서는 구현자가 PRD만 다시 읽지 않아도 서버 구조, tool 경계, service 책임, schema 위치, 테스트 범위를 빠르게 파악할 수 있도록 작성한다.

## 2. Server Structure

```text
src/
  server.ts
  tools/
    index.ts
    health.ts
    extract-team-tasks.ts
    summarize-team-decisions.ts
    generate-team-reminder.ts
    make-submission-checklist.ts
  services/
    chat-parser.ts
    team-task-service.ts
    decision-service.ts
    reminder-service.ts
    checklist-service.ts
  schemas/
    index.ts
    common.ts
    team-project.ts
  utils/
    text.ts
    dates.ts
    format.ts
    errors.ts
tests/
  fixtures/
    team-chat.ts
  tools/
    extract-team-tasks.test.ts
    summarize-team-decisions.test.ts
    generate-team-reminder.test.ts
    make-submission-checklist.test.ts
  services/
    chat-parser.test.ts
    team-task-service.test.ts
    decision-service.test.ts
    reminder-service.test.ts
    checklist-service.test.ts
```

## 3. File Responsibilities

### `src/server.ts`

`src/server.ts`는 MCP 서버의 진입점이다.

Responsibilities:

- `McpServer` 인스턴스를 생성한다.
- 서버 이름과 버전을 정의한다.
- `registerTools(server)` 같은 단일 registration 함수를 호출한다.
- `StdioServerTransport`를 통해 MCP transport를 연결한다.
- tool별 비즈니스 로직은 직접 포함하지 않는다.

Avoid:

- tool handler를 `server.ts`에 계속 추가하지 않는다.
- parsing, formatting, validation logic을 `server.ts`에 넣지 않는다.

### `src/tools/`

`src/tools/`는 MCP tool registration과 handler의 얇은 계층이다.

Recommended files:

- `index.ts`: 모든 tool을 등록하는 `registerTools(server)` export
- `health.ts`: `health_check` 등록
- `extract-team-tasks.ts`: `extract_team_tasks` 등록
- `summarize-team-decisions.ts`: `summarize_team_decisions` 등록
- `generate-team-reminder.ts`: `generate_team_reminder` 등록
- `make-submission-checklist.ts`: `make_submission_checklist` 등록

Responsibilities:

- Zod input schema를 MCP tool schema로 연결한다.
- service 함수를 호출한다.
- service 결과를 MCP `content` 배열로 변환한다.
- 사용자가 읽기 쉬운 한국어 텍스트를 반환한다.

Avoid:

- 복잡한 rule-based parsing을 tool handler 안에 넣지 않는다.
- 외부 API fallback이나 과도한 예외 복구 코드를 먼저 만들지 않는다.

### `src/services/`

`src/services/`는 TeamTok MCP의 비즈니스 로직을 담당한다.

Recommended files:

- `chat-parser.ts`: 카톡 스타일 대화 정규화, speaker 추출, 빈 줄 제거
- `team-task-service.ts`: 담당자, 업무, 마감, 미정 역할 추출
- `decision-service.ts`: 결정사항, 미정 항목, 다음 회의 안건 분리
- `reminder-service.ts`: 카톡방에 붙여넣기 좋은 공지/리마인드 문장 생성
- `checklist-service.ts`: 제출물 유형별 체크리스트 생성 및 상태 추정

Responsibilities:

- deterministic rule 기반 MVP 로직을 구현한다.
- 불확실한 항목은 제거하지 말고 `confidence` 또는 `unknown`으로 표시한다.
- 카카오톡 대화 UX에 맞게 짧고 읽기 쉬운 결과를 만든다.

Avoid:

- 실제 카카오톡 데이터 저장
- 실제 카카오톡 API 접근
- 사용자 개인정보를 로그로 남기는 동작
- 필요 이상의 범용 NLP 프레임워크 도입

### `src/schemas/`

`src/schemas/`는 tool input validation과 공통 enum을 정의한다.

Recommended files:

- `index.ts`: schema export 모음
- `common.ts`: 공통 enum, text length 제한, optional field helper
- `team-project.ts`: TeamTok MCP 핵심 tool input schema

Responsibilities:

- 각 MCP tool의 입력 필드를 구조화한다.
- 빈 `chat_text`, 너무 긴 텍스트, 잘못된 enum 값을 사전에 거른다.
- output 타입도 필요하면 TypeScript type으로 함께 정의한다.

Minimum schemas:

- `ExtractTeamTasksInputSchema`
- `SummarizeTeamDecisionsInputSchema`
- `GenerateTeamReminderInputSchema`
- `MakeSubmissionChecklistInputSchema`

### `src/utils/`

`src/utils/`는 여러 service에서 공유하는 작은 유틸리티만 둔다.

Recommended files:

- `text.ts`: trim, whitespace normalize, bullet formatting
- `dates.ts`: 상대 날짜 표현 보존 및 선택적 ISO 보조 변환
- `format.ts`: MCP content text, Markdown section, KakaoTalk message formatting
- `errors.ts`: validation/internal error를 사용자 친화 메시지로 변환

Rules:

- util은 작고 범용적인 함수만 둔다.
- domain rule은 service에 둔다.
- fallback utility를 과도하게 만들지 않는다.

### `tests/`

`tests/`는 synthetic Korean team project chat만 사용한다.

Recommended structure:

- `tests/fixtures/team-chat.ts`: 가상 카톡 대화 샘플
- `tests/services/*`: 순수 service 단위 테스트
- `tests/tools/*`: MCP tool handler 응답 형태 테스트
- `tests/server.test.ts`: 서버가 시작되고 `health_check`가 등록되는지 확인

Required test coverage:

1. 단순 역할/마감 추출
2. 미정 역할 감지
3. 결정사항과 미정 항목 분리
4. 발표 과제 체크리스트 생성
5. 카톡 스타일 리마인드 메시지 생성
6. 확실하지 않은 정보는 추측하지 않고 `unknown`, `unclear`, `low confidence`로 표시

## 4. Core MCP Tools

MVP에 포함할 핵심 사용자 tool은 4개이다.

1. `extract_team_tasks`
2. `summarize_team_decisions`
3. `generate_team_reminder`
4. `make_submission_checklist`

`health_check`는 서버 상태 확인용으로만 유지한다.

## 5. Why These Tools

### `extract_team_tasks`

가장 직접적인 사용자 가치가 있다. 팀플방에서 "누가 뭘 언제까지 하지?"라는 문제를 해결한다.

### `summarize_team_decisions`

범용 요약과 차별화되는 핵심이다. 대화를 줄이는 것이 아니라 확정/미정을 분리한다.

### `generate_team_reminder`

카카오톡 환경에 가장 잘 맞는 output이다. 사용자가 바로 복사해 팀플방에 붙여넣을 수 있다.

### `make_submission_checklist`

마감 직전 공모전/팀플 데모에서 설득력이 높다. 제출물 누락이라는 실제 불안을 해결한다.

## 6. Deferred Tools

아래 tool은 좋은 확장 후보지만 MVP에서는 후순위이다.

- `extract_shared_resources`: 링크, 파일명, 참고자료 추출
- `track_team_progress`: 팀원별 진행상황 갱신
- `generate_meeting_agenda`: 다음 회의 안건 생성
- `parse_contest_requirements`: 공모전/해커톤 확장용 제출 조건 파싱

후순위 이유:

- MVP의 핵심 문제인 역할, 마감, 결정, 공지, 제출 점검보다 사용자 가치가 약하다.
- 구현 범위가 커지고 테스트할 케이스가 늘어난다.
- 공모전 출품 마감 상황에서는 데모 완성도를 떨어뜨릴 수 있다.

## 7. Implementation Priority

| Priority | Tool | MVP | User value | Difficulty | Reason |
|---|---|---:|---|---|---|
| 1 | `extract_team_tasks` | Yes | Very high | Medium | 다른 tool이 재사용할 핵심 데이터 모델을 만든다. |
| 2 | `summarize_team_decisions` | Yes | High | Medium | 범용 요약과의 차별점을 만든다. |
| 3 | `generate_team_reminder` | Yes | High | Low | 데모에서 즉시 체감되는 카톡 UX를 만든다. |
| 4 | `make_submission_checklist` | Yes | Medium-high | Medium | 제출 직전 누락 점검 가치를 보여준다. |
| 5 | `extract_shared_resources` | No | Medium | Low-medium | 자료 링크 정리는 유용하지만 핵심 MVP 이후가 적절하다. |

## 8. MVP Development Notes

- 외부 API 없이 동작해야 한다.
- rule-based extraction을 우선한다.
- 결과는 JSON 내부 구조보다 카카오톡에서 읽기 쉬운 텍스트를 우선한다.
- tool input은 `query: string` 하나로 뭉개지 말고, `chat_text`, `project_context`, `known_members`, `base_date`처럼 구조화한다.
- 개인정보 보호를 위해 대화 원문 저장은 하지 않는다.
- 실제 카카오톡 대화가 아닌 합성 데이터를 fixture로 사용한다.

