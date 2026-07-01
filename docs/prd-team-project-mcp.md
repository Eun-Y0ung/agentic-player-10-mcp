# PRD: Team Project KakaoTalk MCP

## 1. Product Summary

Team Project KakaoTalk MCP는 대학생 팀플 카카오톡방에서 오간 자연어 대화를 분석해 역할, 마감일, 결정사항, 미정 항목, 제출 체크리스트, 공지 메시지로 변환하는 MCP 서버이다.

이 서비스의 핵심은 "카톡 대화 요약"이 아니라 "팀플 대화를 과제 제출까지 굴러가는 실행 계획으로 바꾸는 것"이다.

### One-line Pitch

카톡 팀플방의 흩어진 대화를 역할, 마감, 미정 항목, 리마인드 메시지로 정리해주는 대학생용 MCP 서버.

### Working Name

- 팀플메이트 MCP
- 톡팀플 MCP
- TeamTok MCP
- 조별과제 구조대

본 PRD에서는 임시 제품명을 `TeamTok MCP`로 사용한다.

## 2. Background

대학생 팀플은 대부분 카카오톡 단체방에서 진행된다. 팀원들은 카톡에서 주제, 역할, 마감일, 자료 링크, 발표 순서, 회의 일정 등을 논의한다.

하지만 카카오톡은 대화에는 강하지만 작업 관리에는 약하다. 중요한 결정사항이 잡담 사이에 묻히고, 누가 무엇을 언제까지 해야 하는지 다시 스크롤해 찾아야 한다. 결국 조장이나 성실한 팀원이 수동으로 회의록, 역할표, 공지 메시지를 다시 만든다.

Kanana in KakaoTalk 같은 범용 AI가 대화 요약이나 일정/할 일 감지를 제공할 수 있더라도, 대학생 팀플이라는 도메인에서 필요한 구조는 더 구체적이다.

- 팀원별 역할
- 과제 마감일
- 제출물 목록
- 결정사항과 미정 항목의 분리
- 다음 회의 안건
- 팀원에게 보낼 자연스러운 카톡 공지
- 제출 전 체크리스트

TeamTok MCP는 이 특정 업무 흐름에 집중한다.

## 3. Problem Definition

대학생 팀플의 문제는 대화가 부족한 것이 아니라, 대화가 실행 가능한 계획으로 전환되지 않는 것이다.

### User Pain Points

1. 역할 분담이 대화 중에 정해지지만 나중에 다시 찾기 어렵다.
2. 마감일이 교수님 공지, LMS, 카톡 대화에 흩어져 있다.
3. 회의에서 결정된 것과 아직 정해지지 않은 것이 섞인다.
4. 조장이 매번 팀원 공지와 리마인드 메시지를 직접 써야 한다.
5. 제출 직전에 누락된 항목을 발견한다.
6. 팀원별 진행상황을 확인하려면 계속 물어봐야 한다.

### Core Problem Statement

대학생 팀플 카톡방의 비정형 대화를 과제 제출에 필요한 역할표, 마감표, 미정 항목, 공지 메시지, 제출 체크리스트로 자동 변환할 수 있어야 한다.

## 4. Target Users

### Primary User

대학생 팀플 조장 또는 실질적으로 팀을 정리하는 팀원.

특징:

- 여러 팀플과 과제를 동시에 진행한다.
- 팀원에게 공지, 리마인드, 역할 확인 메시지를 자주 보낸다.
- 카카오톡 단체방을 주요 협업 채널로 사용한다.
- 별도 협업툴 도입은 부담스럽고, 카톡에서 바로 쓸 수 있는 결과를 원한다.

### Secondary Users

- 일반 팀플 팀원
- 공모전/해커톤 참가 대학생
- 캡스톤디자인 팀
- 동아리 프로젝트 팀
- 스터디 그룹 운영자

## 5. Product Goals

### Goals

1. 팀플 대화에서 실행 항목을 구조화한다.
2. 팀원별 담당 업무와 마감일을 명확히 보여준다.
3. 결정사항과 미정 항목을 분리한다.
4. 카톡방에 바로 붙여넣을 수 있는 공지/리마인드 메시지를 생성한다.
5. 과제 제출 전 누락 항목을 점검할 수 있는 체크리스트를 만든다.
6. 추후 공모전/해커톤 운영 MCP로 확장 가능한 구조를 만든다.

### Non-goals

1. 카카오톡 API를 직접 연동하는 완전 자동화 앱을 만드는 것은 MVP 범위가 아니다.
2. 실제 LMS, Google Drive, Notion, GitHub 연동은 MVP 이후 확장으로 둔다.
3. 팀원 평가, 성적 예측, 갈등 중재 같은 민감한 판단 기능은 제공하지 않는다.
4. 사용자의 개인 카카오톡 데이터를 장기 저장하는 기능은 MVP 범위에서 제외한다.

## 6. Key User Scenarios

### Scenario 1: 역할과 마감일 자동 정리

사용자가 팀플 카톡 대화 일부를 에이전트에 제공하고 말한다.

> 지금까지 정해진 역할이랑 마감일 정리해줘.

MCP는 대화에서 팀원, 담당 업무, 마감일, 근거 문장을 추출한다.

Expected Output:

```json
{
  "project_title": "생성형 AI 교육 활용 발표",
  "tasks": [
    {
      "owner": "민지",
      "task": "자료조사",
      "deadline": "수요일 22:00",
      "status": "assigned",
      "evidence": "민지가 자료조사 맡을게"
    },
    {
      "owner": "현우",
      "task": "PPT 초안 제작",
      "deadline": "금요일 오후",
      "status": "assigned",
      "evidence": "PPT는 내가 금요일까지 초안 만들어볼게"
    }
  ],
  "unassigned": [
    "발표 대본 작성",
    "최종 제출 담당자"
  ]
}
```

### Scenario 2: 결정사항과 미정 항목 분리

사용자가 말한다.

> 오늘 회의에서 결정된 것만 정리하고, 아직 안정한 것도 알려줘.

MCP는 확정된 결정사항과 아직 논의가 필요한 항목을 분리한다.

Expected Output:

```json
{
  "decisions": [
    "발표 주제는 생성형 AI의 교육 활용 사례로 확정",
    "발표 구성은 개념, 사례, 장점, 한계, 결론 순서로 진행",
    "자료 출처는 논문 2개와 기사 3개 이상 사용"
  ],
  "pending_items": [
    {
      "item": "발표 순서",
      "reason": "팀원별 발표 파트가 아직 확정되지 않음"
    },
    {
      "item": "PPT 디자인 템플릿",
      "reason": "후보만 언급되고 최종 선택되지 않음"
    }
  ],
  "next_meeting_agenda": [
    "발표자별 파트 확정",
    "슬라이드 분량 배분",
    "자료 출처 최종 확인"
  ]
}
```

### Scenario 3: 팀원 공지/리마인드 메시지 생성

사용자가 말한다.

> 역할 분담 기준으로 오늘 밤에 보낼 리마인드 카톡 써줘.

MCP는 구조화된 역할표를 바탕으로 카톡방에 붙여넣기 좋은 문장을 생성한다.

Expected Output:

```text
얘들아 오늘 정리한 내용 공유할게!

민지는 자료조사 수요일 밤까지, 현우는 PPT 초안 금요일까지, 나는 발표 대본 일요일까지 맡기로 했어.
수빈 역할은 아직 확정이 안 돼서 내일까지 다시 정하면 좋을 것 같아.

전체 제출은 다음 주 월요일 23:59니까 각자 진행상황 금요일 밤에 한 번 공유하자!
```

### Scenario 4: 제출 전 체크리스트 생성

사용자가 말한다.

> 제출 전에 빠진 거 없는지 체크리스트 만들어줘.

MCP는 대화에서 언급된 제출 조건과 일반적인 팀플 제출 항목을 바탕으로 체크리스트를 만든다.

Expected Output:

```json
{
  "submission_deadline": "다음 주 월요일 23:59",
  "checklist": [
    {
      "item": "PPT 최종본 완성",
      "status": "in_progress"
    },
    {
      "item": "발표 대본 작성",
      "status": "missing"
    },
    {
      "item": "참고문헌 표기 확인",
      "status": "unknown"
    },
    {
      "item": "LMS 제출 담당자 확정",
      "status": "missing"
    }
  ]
}
```

## 7. MVP Scope

MVP는 카카오톡 대화 전문을 직접 가져오는 기능 없이, 사용자가 복사한 대화 텍스트를 입력으로 받는 MCP tools로 구현한다.

### MVP Must-have

1. 카톡 대화 텍스트 입력
2. 팀원별 역할/마감 추출
3. 결정사항/미정 항목 분리
4. 제출 전 체크리스트 생성
5. 카톡 공지/리마인드 메시지 생성
6. JSON 또는 Markdown 형태의 안정적인 출력

### MVP Nice-to-have

1. 대화 속 링크/파일명/자료 출처 추출
2. 다음 회의 안건 추천
3. 팀원별 진행상황 업데이트
4. 공지 메시지 말투 옵션 제공

### Future Expansion

1. 공모전/해커톤 모드
2. 심사 기준 기반 제출물 체크리스트
3. GitHub/Notion/Google Drive 연동
4. LMS 과제 조건 파싱
5. 팀원별 진행률 시각화
6. 반복 프로젝트 메모리 저장

## 8. MCP Tool Design

### Tool 1: extract_team_tasks

Purpose:

카톡 대화에서 팀원별 담당 업무, 마감일, 상태, 근거 문장을 추출한다.

Input Schema:

```json
{
  "chat_text": "string",
  "project_context": "string | optional",
  "known_members": "string[] | optional",
  "base_date": "string | optional"
}
```

Output Schema:

```json
{
  "project_title": "string | null",
  "tasks": [
    {
      "owner": "string | null",
      "task": "string",
      "deadline": "string | null",
      "status": "assigned | in_progress | done | unclear",
      "confidence": "high | medium | low",
      "evidence": "string | null"
    }
  ],
  "unassigned_tasks": ["string"],
  "warnings": ["string"]
}
```

Implementation Notes:

- 상대 날짜 표현을 보존하되, `base_date`가 있으면 가능한 경우 ISO 날짜로 보조 필드를 추가한다.
- "내가 할게", "그럼 나는", "PPT는 현우가" 같은 한국어 팀플 표현을 처리한다.
- 확신이 낮은 항목은 삭제하지 말고 `confidence: low`로 반환한다.

### Tool 2: summarize_team_decisions

Purpose:

대화에서 확정된 결정사항, 미정 항목, 다음 회의 안건을 분리한다.

Input Schema:

```json
{
  "chat_text": "string",
  "focus": "general | meeting | submission | presentation",
  "project_context": "string | optional"
}
```

Output Schema:

```json
{
  "decisions": [
    {
      "decision": "string",
      "category": "topic | schedule | role | format | resource | submission | other",
      "evidence": "string | null"
    }
  ],
  "pending_items": [
    {
      "item": "string",
      "reason": "string",
      "suggested_next_action": "string"
    }
  ],
  "next_meeting_agenda": ["string"]
}
```

Implementation Notes:

- 단순 요약문보다 "확정/미정" 구분이 중요하다.
- "일단", "아마", "나중에 정하자", "확정은 아닌데" 같은 불확실성 표현을 pending으로 분류한다.

### Tool 3: make_submission_checklist

Purpose:

과제 제출 전 확인해야 할 항목을 생성한다.

Input Schema:

```json
{
  "chat_text": "string",
  "assignment_requirements": "string | optional",
  "deadline": "string | optional",
  "deliverable_type": "presentation | report | prototype | video | mixed | unknown"
}
```

Output Schema:

```json
{
  "deadline": "string | null",
  "checklist": [
    {
      "item": "string",
      "category": "content | format | submission | presentation | reference | team | other",
      "status": "done | in_progress | missing | unknown",
      "owner": "string | null",
      "note": "string | null"
    }
  ],
  "risks": ["string"]
}
```

Implementation Notes:

- 명시되지 않은 항목은 `unknown`으로 표시한다.
- 보고서, 발표, 프로토타입 등 제출물 유형별 기본 체크리스트를 내부 규칙으로 가진다.

### Tool 4: generate_team_reminder

Purpose:

구조화된 역할/마감/미정 항목을 바탕으로 카톡방에 보낼 공지 또는 리마인드 메시지를 생성한다.

Input Schema:

```json
{
  "tasks": "object[]",
  "pending_items": "object[] | optional",
  "deadline": "string | optional",
  "tone": "friendly | concise | polite | firm",
  "sender_name": "string | optional"
}
```

Output Schema:

```json
{
  "message": "string",
  "summary": "string",
  "tone": "friendly | concise | polite | firm"
}
```

Implementation Notes:

- 대학생 카톡 말투를 기본값으로 한다.
- 지나치게 딱딱한 업무용 문체를 피한다.
- 책임 추궁처럼 보이는 표현을 피하고, 행동 요청을 명확히 쓴다.

### Tool 5: extract_shared_resources

Purpose:

대화 속 링크, 파일명, 논문/기사/자료명, 참고자료 후보를 추출한다.

Input Schema:

```json
{
  "chat_text": "string"
}
```

Output Schema:

```json
{
  "resources": [
    {
      "type": "link | file | article | paper | keyword | unknown",
      "title": "string | null",
      "value": "string",
      "mentioned_by": "string | null",
      "note": "string | null"
    }
  ]
}
```

MVP에서는 선택 구현이다.

## 9. Suggested MVP Tool Set

처음 구현할 때는 아래 4개만 우선 구현한다.

1. `extract_team_tasks`
2. `summarize_team_decisions`
3. `make_submission_checklist`
4. `generate_team_reminder`

`extract_shared_resources`는 시간이 남으면 추가한다.

## 10. Data Handling and Privacy

MVP에서는 사용자가 명시적으로 붙여넣은 대화 텍스트만 처리한다.

### Privacy Principles

1. 카카오톡 계정 또는 실제 채팅방에 직접 접근하지 않는다.
2. 대화 원문을 장기 저장하지 않는다.
3. 출력에 필요한 최소 정보만 반환한다.
4. 이름, 학번, 전화번호 같은 개인정보가 포함될 수 있으므로 로그 저장을 최소화한다.
5. 데모 데이터는 가상 팀원 이름과 가상 대화만 사용한다.

### Demo Data Rule

실제 팀플 대화 원문을 발표 자료나 테스트 fixture에 넣지 않는다. 모든 예시는 합성 데이터로 작성한다.

## 11. UX Requirements

TeamTok MCP는 일반 사용자가 카카오톡에서 자연어로 요청한다고 가정한다.

### Natural Language Request Examples

- 지금까지 정해진 역할이랑 마감일 정리해줘.
- 오늘 회의에서 결정된 것만 정리해줘.
- 아직 안정한 항목 알려줘.
- 팀원들에게 보낼 리마인드 카톡 써줘.
- 제출 전에 빠진 거 없는지 체크리스트 만들어줘.
- 발표 준비 기준으로 다음 회의 안건 만들어줘.

### Output Style

1. 구조화된 JSON은 agent가 후속 tool 호출에 쓰기 좋게 만든다.
2. 사용자에게 보여줄 최종 답변은 Markdown 표 또는 카톡 메시지 형태가 좋다.
3. 리마인드 메시지는 복사해서 카톡방에 바로 붙여넣을 수 있어야 한다.
4. 불확실한 정보는 확정처럼 말하지 않는다.

## 12. Example Demo Flow

### Demo Input Chat

```text
[민지] 우리 발표 주제 생성형 AI 교육 활용으로 가는 거 맞지?
[현우] 응 그걸로 하자. 사례 중심으로 하면 괜찮을 듯
[나] 그럼 구성은 개념, 사례, 장점, 한계, 결론 이렇게?
[수빈] 좋아. 근데 자료조사는 누가 해?
[민지] 내가 논문이랑 기사 찾아볼게. 수요일 밤까지 정리해볼게
[현우] PPT는 내가 금요일까지 초안 만들게
[나] 나는 발표 대본 맡을게. 일요일까지 할게
[수빈] 나는 발표할지 자료 보충할지 아직 모르겠어
[나] 전체 제출은 다음 주 월요일 23:59까지야
[현우] 참고문헌 형식도 확인해야 할 듯
```

### Step 1: extract_team_tasks

User:

```text
지금까지 정해진 역할이랑 마감일 정리해줘.
```

Expected:

- 민지: 자료조사, 수요일 밤
- 현우: PPT 초안, 금요일
- 나: 발표 대본, 일요일
- 수빈: 역할 미정
- 전체 제출: 다음 주 월요일 23:59

### Step 2: summarize_team_decisions

User:

```text
결정된 것과 아직 안정한 것 분리해줘.
```

Expected:

- 결정: 발표 주제, 발표 구성, 담당자 일부, 전체 제출 마감
- 미정: 수빈 역할, 참고문헌 형식, 발표 순서

### Step 3: make_submission_checklist

User:

```text
제출 전 체크리스트 만들어줘.
```

Expected:

- PPT 최종본
- 발표 대본
- 자료조사 정리
- 참고문헌 형식 확인
- 발표 순서 확정
- LMS 제출 담당자 확정

### Step 4: generate_team_reminder

User:

```text
오늘 밤 팀원들에게 보낼 리마인드 카톡 써줘.
```

Expected:

```text
얘들아 오늘 정리한 내용 공유할게!

발표 주제는 생성형 AI 교육 활용으로 확정했고, 구성은 개념-사례-장점-한계-결론 순서로 가기로 했어.

역할은 민지 자료조사(수요일 밤), 현우 PPT 초안(금요일), 나는 발표 대본(일요일)까지 맡기로 했고, 수빈 역할이랑 발표 순서는 아직 정해야 해.

전체 제출은 다음 주 월요일 23:59니까 참고문헌 형식이랑 LMS 제출 담당자도 다음 회의 때 같이 확정하자!
```

## 13. Technical Implementation Direction

### Recommended Stack

현재 저장소 구조를 기준으로 TypeScript MCP 서버로 구현한다.

- `src/server.ts`: MCP server registration
- `src/tools/`: tool handlers
- `src/schemas/`: Zod schemas for inputs/outputs
- `src/services/`: domain logic
- `tests/`: unit tests for parser/service/tool behavior
- `docs/`: product and demo documentation

### Implementation Approach

MVP에서는 외부 API 없이 deterministic rule-based extraction과 LLM-friendly structured prompts를 조합한다.

가능한 구현 방식:

1. Tool input을 Zod schema로 검증한다.
2. Service layer에서 chat text를 line 단위로 정규화한다.
3. 한국어 팀플 표현을 rule-based로 일부 추출한다.
4. 불확실한 항목은 `confidence`를 낮게 둔다.
5. Output은 JSON stringify 또는 Markdown으로 반환한다.

외부 LLM 호출이 허용되지 않는 환경에서도 데모가 가능해야 하므로, 핵심 예시는 규칙 기반으로 동작하게 만든다.

### Suggested File Layout

```text
src/
  server.ts
  schemas/
    team-project.ts
  services/
    chat-parser.ts
    team-task-service.ts
    decision-service.ts
    checklist-service.ts
    reminder-service.ts
  tools/
    team-project-tools.ts
    index.ts
tests/
  team-task-service.test.ts
  decision-service.test.ts
  checklist-service.test.ts
  reminder-service.test.ts
docs/
  prd-team-project-mcp.md
  demo-scenario.md
  tool-spec.md
```

### Parsing Rules to Consider

Names:

- `[민지]`, `민지:`, `민지 -` 같은 speaker prefix를 인식한다.
- `나`, `제가`, `내가`는 sender context가 없으면 `"나"`로 보존한다.

Task assignment cues:

- "내가 할게"
- "제가 맡을게요"
- "PPT는 현우가"
- "자료조사는 민지가"
- "나는 발표 대본"
- "수빈이가 정리해줘"

Deadline cues:

- "오늘"
- "내일"
- "이번 주 금요일"
- "다음 주 월요일"
- "수요일 밤"
- "금요일 오후"
- "23:59까지"
- "제출 전까지"

Pending cues:

- "아직 안정함"
- "나중에 정하자"
- "확정은 아닌데"
- "모르겠어"
- "누가 할래?"
- "정해야 할 듯"

Decision cues:

- "그걸로 하자"
- "확정"
- "좋아"
- "오케이"
- "그럼 ... 이렇게"
- "가기로 했어"

### Testing Strategy

Unit tests should use synthetic Korean chat samples.

Required test cases:

1. Extract owner/task/deadline from simple assignment lines.
2. Detect unassigned or pending roles.
3. Separate decisions from pending items.
4. Generate checklist based on presentation deliverable.
5. Generate KakaoTalk-style reminder message.
6. Preserve uncertainty instead of hallucinating missing owner/deadline.

## 14. Acceptance Criteria

The MVP is complete when:

1. MCP server exposes at least 4 tools:
   - `extract_team_tasks`
   - `summarize_team_decisions`
   - `make_submission_checklist`
   - `generate_team_reminder`
2. Each tool has validated input schema.
3. Each tool returns structured, predictable output.
4. Demo chat in this PRD produces meaningful role/deadline/decision/pending/reminder results.
5. Tests pass with synthetic Korean team project chat data.
6. No real KakaoTalk data is required.
7. The final demo can be explained in under 2 minutes.

## 15. Differentiation

### Compared to Generic Chat Summarization

Generic summary compresses conversation. TeamTok MCP converts conversation into action.

It outputs:

- who does what
- by when
- what is already decided
- what is still pending
- what must be checked before submission
- what message should be sent next

### Compared to Kanana-style General AI

Kanana may help with general chat context, reminders, and useful suggestions. TeamTok MCP is narrower and more execution-oriented.

The differentiation is domain specificity:

- university team project vocabulary
- assignment submission workflow
- team member role tracking
- presentation/report checklist
- KakaoTalk reminder copywriting
- future expansion into contest/hackathon operation

### Compared to Notion/Trello

Notion and Trello require users to manually create tasks. TeamTok MCP starts from the conversation students already have in KakaoTalk.

## 16. Pitch Points for Agentic Player 10

1. Every university student understands the pain of team projects.
2. The product fits KakaoTalk because team projects already happen in KakaoTalk rooms.
3. MCP tools are naturally separated into extraction, summarization, checklist, and message generation.
4. The demo is easy to understand with a short fake chat log.
5. It can start small as a team project helper and later expand to contest/hackathon team operations.
6. It is not just "AI summary"; it turns messy conversation into the next action.

## 17. Development Roadmap

### Phase 1: MVP

- Implement 4 core tools.
- Add Zod schemas.
- Add synthetic test fixtures.
- Update `docs/tool-spec.md`.
- Update `docs/demo-scenario.md`.

### Phase 2: Better Domain Intelligence

- Improve Korean expression parsing.
- Add resource/link extraction.
- Add tone options for reminder messages.
- Add progress status update tool.

### Phase 3: Contest/Hackathon Mode

- Add contest requirement parser.
- Add judging criteria checklist.
- Add pitch outline generator.
- Add demo readiness checker.

## 18. Open Questions

1. MVP output should be pure JSON, Markdown, or both?
2. Should the MCP tools return Korean user-facing text by default?
3. Should "나" be preserved as a member name or mapped to a provided `sender_name`?
4. Should relative dates be normalized to ISO date when `base_date` is provided?
5. Should future versions store project memory, or remain stateless for privacy?

## 19. Recommended First Implementation Task

Start with `extract_team_tasks`.

Reason:

- It is the clearest user value.
- Other tools can reuse its output.
- It is easy to demo.
- It establishes the core data model: member, task, deadline, status, confidence, evidence.

After that, implement tools in this order:

1. `extract_team_tasks`
2. `summarize_team_decisions`
3. `generate_team_reminder`
4. `make_submission_checklist`

