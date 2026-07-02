# Tool Spec: TeamTok MCP

이 문서는 Agentic Player 10 출품용 TeamTok MCP 서버의 tool 명세이다.

TeamTok MCP는 대학생 팀플 카카오톡방의 대화를 역할, 마감, 결정사항, 미정 항목, 제출 체크리스트, 리마인드 메시지로 바꾸는 MCP 서버이다.

`health_check`는 서버 상태 확인용으로만 유지하고, 핵심 사용자 기능과 분리한다.

## Chat-based execution model

TeamTok MCP는 사용자가 JSON을 직접 입력하는 방식이 아니라, 카카오톡형 AI 채팅 화면에서 자연어로 요청하면 AI가 필요한 MCP tool을 내부적으로 호출하는 방식으로 사용된다.

사용자 경험은 다음 흐름을 따른다.

1. 사용자가 채팅창에 자연어로 요청한다.
2. AI가 요청 의도를 판단해 필요한 tool을 선택한다.
3. AI가 MCP `tools/call` request를 생성한다.
4. MCP 서버가 tool 결과를 `content` 배열로 반환한다.
5. AI가 tool 결과를 바탕으로 카카오톡에서 읽기 쉬운 최종 답변을 작성한다.

사용자는 아래와 같은 JSON request를 직접 작성하지 않는다. JSON은 AI와 MCP 서버 사이의 내부 호출 형식이다.

```json
{
  "method": "tools/call",
  "params": {
    "name": "extract_team_tasks",
    "arguments": {
      "chat_text": "[민지] 내가 자료조사 맡을게. 수요일 밤까지 정리해볼게\n[현우] PPT는 내가 금요일까지 초안 만들게",
      "project_context": "생성형 AI 교육 활용 발표",
      "known_members": ["민지", "현우"],
      "base_date": "2026-07-02"
    }
  }
}
```

채팅 예시는 다음처럼 설계한다.

```text
사용자:
지금까지 팀플방에서 정해진 역할이랑 마감일 정리해줘.

AI 내부 tool 호출:
extract_team_tasks

최종 답변:
📌 역할/마감 정리
- 민지: 자료조사 / 수요일 밤까지
- 현우: PPT 초안 / 금요일까지

⚠️ 아직 미정
- 최종 제출 담당자
```

여러 tool이 필요한 요청은 AI가 순차적으로 호출한다.

```text
사용자:
오늘 회의 내용 기준으로 역할 정리하고 팀원들에게 보낼 리마인드 카톡도 써줘.

AI 내부 tool 호출 순서:
1. extract_team_tasks
2. summarize_team_decisions
3. generate_team_reminder
```

이 문서의 각 tool별 `Input`과 `Success example`은 사용자가 직접 입력하는 채팅 문장이 아니라 MCP `tools/call`의 `arguments` 형식을 설명한다.

## health_check

### Purpose

MCP 서버가 정상적으로 실행 중인지 확인한다.

### When to use

클라이언트가 서버 연결 상태를 확인하거나 개발 중 smoke test를 수행할 때 사용한다.

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
| Server internal error | 서버 초기화 또는 transport 연결 실패 | MCP 에러로 반환한다. |

### Notes

- 사용자 기능과 연결하지 않는다.
- 데모에서는 서버 연결 확인용으로만 사용한다.

## extract_team_tasks

### Purpose

팀플 카톡 대화에서 팀원별 담당 업무, 마감일, 미정 역할을 추출한다.

### When to use

사용자가 "역할 정리해줘", "누가 뭘 하기로 했는지 알려줘", "마감일이랑 담당자 정리해줘"처럼 역할과 마감 정리를 요청할 때 호출한다.

### Input

```json
{
  "chat_text": "string",
  "project_context": "string",
  "known_members": ["string"],
  "base_date": "YYYY-MM-DD",
  "sender_name": "string"
}
```

### Input fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `chat_text` | string | Yes | 사용자가 복사해 붙여넣은 팀플 카카오톡 대화 텍스트. |
| `project_context` | string | No | 과제명, 발표 주제, 강의명 등 대화 해석에 필요한 배경 정보. |
| `known_members` | string[] | No | 팀원 이름 목록. speaker 추출과 "누가" 판단을 보조한다. |
| `base_date` | string | No | "다음 주 월요일" 같은 상대 날짜 해석 기준일. `YYYY-MM-DD` 형식. |
| `sender_name` | string | No | 대화 속 "나", "내가"를 특정 이름으로 치환할 때 사용한다. |

### Output

응답은 MCP `content` 배열의 텍스트 하나로 반환한다. 카카오톡에서 읽기 쉬운 짧은 요약을 기본으로 한다.

```json
{
  "content": [
    {
      "type": "text",
      "text": "📌 역할/마감 정리\n- 민지: 자료조사 / 수요일 밤까지\n- 현우: PPT 초안 / 금요일까지\n\n⚠️ 아직 미정\n- 수빈 역할\n- 최종 제출 담당자"
    }
  ]
}
```

### Success example

Request:

```json
{
  "chat_text": "[민지] 내가 자료조사 맡을게. 수요일 밤까지 정리해볼게\n[현우] PPT는 내가 금요일까지 초안 만들게\n[수빈] 나는 발표할지 자료 보충할지 아직 모르겠어\n[나] 전체 제출은 다음 주 월요일 23:59까지야",
  "project_context": "생성형 AI 교육 활용 발표",
  "known_members": ["민지", "현우", "수빈", "나"],
  "base_date": "2026-07-02"
}
```

Response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "📌 역할/마감 정리\n- 민지: 자료조사 / 수요일 밤까지\n- 현우: PPT 초안 / 금요일까지\n- 전체: 과제 제출 / 다음 주 월요일 23:59까지\n\n⚠️ 아직 미정\n- 수빈 역할: 발표 또는 자료 보충 중 확정 필요"
    }
  ]
}
```

### Error cases

| Case | Condition | Expected behavior |
|---|---|---|
| Missing input | `chat_text`가 없거나 문자열이 아님 | "대화 텍스트를 입력해 주세요."라는 validation error를 반환한다. |
| Empty chat | `chat_text`가 공백만 포함 | "정리할 대화 내용이 없습니다."라고 반환한다. |
| Too long input | 입력 길이가 제한을 초과 | "대화가 너무 깁니다. 최근 논의 부분만 나눠서 입력해 주세요."라고 반환한다. |
| No tasks found | 역할/마감 단서를 찾지 못함 | "확정된 역할이나 마감일을 찾지 못했습니다."와 확인 질문 예시를 반환한다. |
| Invalid date | `base_date`가 `YYYY-MM-DD`가 아님 | 날짜 해석 없이 원문 날짜 표현만 사용하거나 validation error를 반환한다. |
| Internal error | parser/service 예외 | "역할 정리 중 문제가 발생했습니다."라는 짧은 오류 메시지를 반환한다. |

### Notes

- 불확실한 담당자나 마감일은 추측하지 않는다.
- "나", "내가"는 `sender_name`이 없으면 그대로 "나"로 표시한다.
- 대화 원문 전체를 output에 길게 다시 노출하지 않는다.
- 개인정보 보호를 위해 대화 원문 저장을 전제로 설계하지 않는다.
- 카카오톡 UX상 8줄 안팎의 요약을 우선하고, 항목이 많으면 "외 N개" 형태를 고려한다.

## summarize_team_decisions

### Purpose

팀플 대화에서 확정된 결정사항과 아직 정해야 할 미정 항목을 분리한다.

### When to use

사용자가 "결정된 것만 정리해줘", "아직 안정한 것 알려줘", "오늘 회의 요약해줘", "다음 회의 때 정할 거 알려줘"처럼 회의 결과 정리를 요청할 때 호출한다.

### Input

```json
{
  "chat_text": "string",
  "project_context": "string",
  "focus": "general",
  "max_items": 5
}
```

### Input fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `chat_text` | string | Yes | 사용자가 복사해 붙여넣은 팀플 카카오톡 대화 텍스트. |
| `project_context` | string | No | 과제명, 발표 주제, 회의 목적 등 배경 정보. |
| `focus` | `"general" \| "meeting" \| "submission" \| "presentation"` | No | 결정사항을 어떤 관점으로 정리할지 지정한다. 기본값은 `general`. |
| `max_items` | number | No | 결정사항과 미정 항목을 각각 최대 몇 개까지 보여줄지 지정한다. 기본값은 5. |

### Output

```json
{
  "content": [
    {
      "type": "text",
      "text": "✅ 결정된 것\n- 발표 주제: 생성형 AI의 교육 활용\n- 발표 구성: 개념 → 사례 → 장점 → 한계 → 결론\n\n❓ 아직 정할 것\n- 발표 순서\n- 수빈 역할\n\n🗓 다음 회의 안건\n- 발표 파트 배분\n- 참고문헌 형식 확인"
    }
  ]
}
```

### Success example

Request:

```json
{
  "chat_text": "[민지] 발표 주제 생성형 AI 교육 활용으로 가는 거 맞지?\n[현우] 응 그걸로 하자\n[나] 구성은 개념, 사례, 장점, 한계, 결론 이렇게?\n[수빈] 좋아. 근데 발표 순서는 나중에 정하자\n[현우] 참고문헌 형식도 확인해야 할 듯",
  "project_context": "발표 회의",
  "focus": "meeting",
  "max_items": 4
}
```

Response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "✅ 결정된 것\n- 발표 주제: 생성형 AI의 교육 활용\n- 발표 구성: 개념 → 사례 → 장점 → 한계 → 결론\n\n❓ 아직 정할 것\n- 발표 순서\n- 참고문헌 형식 확인\n\n🗓 다음 회의 안건\n- 발표자별 파트 확정\n- 참고문헌 형식 결정"
    }
  ]
}
```

### Error cases

| Case | Condition | Expected behavior |
|---|---|---|
| Missing input | `chat_text`가 없음 | "회의 대화 텍스트를 입력해 주세요."라고 반환한다. |
| Invalid focus | 허용되지 않은 `focus` 값 | validation error를 반환한다. |
| Empty result | 결정사항과 미정 항목을 찾지 못함 | "확정된 결정사항은 찾지 못했습니다. 역할, 주제, 마감 등이 더 명확히 언급된 대화를 입력해 주세요."라고 반환한다. |
| Too many items | `max_items`가 너무 큼 | 최대값으로 clamp하거나 validation error를 반환한다. |
| Internal error | service 예외 | "회의 내용 정리 중 문제가 발생했습니다."라고 반환한다. |

### Notes

- "아마", "일단", "나중에", "정해야 할 듯" 같은 표현은 확정보다 미정으로 처리한다.
- 결정사항은 길게 설명하지 말고 한 줄 bullet로 정리한다.
- 대화 원문 인용은 최소화한다.
- 카톡에서 읽기 쉽도록 섹션을 3개 이하로 유지한다.

## generate_team_reminder

### Purpose

정리된 역할, 마감, 미정 항목을 바탕으로 팀플 카톡방에 바로 보낼 수 있는 공지 또는 리마인드 메시지를 생성한다.

### When to use

사용자가 "팀원들에게 보낼 카톡 써줘", "리마인드 메시지 만들어줘", "오늘 회의 내용 공지문으로 정리해줘"처럼 복사 가능한 메시지를 요청할 때 호출한다.

### Input

```json
{
  "project_context": "string",
  "tasks": [
    {
      "owner": "string",
      "task": "string",
      "deadline": "string",
      "status": "assigned"
    }
  ],
  "decisions": ["string"],
  "pending_items": ["string"],
  "deadline": "string",
  "tone": "friendly",
  "include_greeting": true
}
```

### Input fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `project_context` | string | No | 과제명, 발표 주제, 공지 배경. |
| `tasks` | object[] | Yes | 팀원별 역할/마감 목록. `extract_team_tasks` 결과를 단순화해 전달한다. |
| `tasks[].owner` | string | No | 담당자 이름. 미정이면 생략 가능하다. |
| `tasks[].task` | string | Yes | 담당 업무. |
| `tasks[].deadline` | string | No | 마감일 또는 마감 표현. |
| `tasks[].status` | `"assigned" \| "in_progress" \| "done" \| "unclear"` | No | 업무 상태. |
| `decisions` | string[] | No | 함께 공지할 확정 사항. |
| `pending_items` | string[] | No | 팀원에게 다시 정하자고 말할 미정 항목. |
| `deadline` | string | No | 전체 제출 마감. |
| `tone` | `"friendly" \| "concise" \| "polite" \| "firm"` | No | 메시지 말투. 기본값은 `friendly`. |
| `include_greeting` | boolean | No | 첫 인사 문장을 포함할지 여부. 기본값은 true. |

### Output

```json
{
  "content": [
    {
      "type": "text",
      "text": "얘들아 오늘 정리한 내용 공유할게!\n\n역할은 민지 자료조사(수요일 밤), 현우 PPT 초안(금요일), 나는 발표 대본(일요일)까지 맡기로 했어.\n\n수빈 역할이랑 발표 순서는 아직 정해야 해서 다음 회의 때 같이 확정하자. 전체 제출은 다음 주 월요일 23:59까지야!"
    }
  ]
}
```

### Success example

Request:

```json
{
  "project_context": "생성형 AI 교육 활용 발표",
  "tasks": [
    {
      "owner": "민지",
      "task": "자료조사",
      "deadline": "수요일 밤",
      "status": "assigned"
    },
    {
      "owner": "현우",
      "task": "PPT 초안",
      "deadline": "금요일",
      "status": "assigned"
    }
  ],
  "decisions": ["발표 주제는 생성형 AI 교육 활용으로 확정"],
  "pending_items": ["수빈 역할", "발표 순서"],
  "deadline": "다음 주 월요일 23:59",
  "tone": "friendly",
  "include_greeting": true
}
```

Response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "얘들아 오늘 정리한 내용 공유할게!\n\n발표 주제는 생성형 AI 교육 활용으로 확정했고, 역할은 민지 자료조사(수요일 밤), 현우 PPT 초안(금요일)까지 맡기로 했어.\n\n수빈 역할이랑 발표 순서는 아직 정해야 해서 다음 회의 때 같이 확정하자. 전체 제출은 다음 주 월요일 23:59까지야!"
    }
  ]
}
```

### Error cases

| Case | Condition | Expected behavior |
|---|---|---|
| Missing tasks | `tasks`가 없거나 빈 배열 | "공지에 넣을 역할이나 할 일이 없습니다."라고 반환한다. |
| Invalid tone | 허용되지 않은 `tone` 값 | validation error를 반환한다. |
| Too long message | 생성 메시지가 너무 김 | 핵심 역할/마감만 남기고 줄인 메시지를 반환한다. |
| No actionable content | tasks, decisions, pending_items가 모두 비어 있음 | "보낼 내용이 부족합니다. 역할, 마감, 결정사항 중 하나 이상을 입력해 주세요."라고 반환한다. |
| Internal error | service 예외 | "리마인드 메시지 생성 중 문제가 발생했습니다."라고 반환한다. |

### Notes

- 카카오톡에 바로 붙여넣을 수 있는 자연스러운 한국어를 우선한다.
- 팀원을 탓하거나 압박하는 표현을 피한다.
- `firm` tone도 공격적으로 쓰지 않고 마감 중심으로 정리한다.
- 문단은 2~4개 정도로 제한한다.
- emoji 사용은 최소화하거나 옵션화한다. 기본 구현에서는 텍스트만으로 충분하다.

## make_submission_checklist

### Purpose

팀플 대화와 과제 조건을 바탕으로 제출 전 확인해야 할 체크리스트를 만든다.

### When to use

사용자가 "제출 전에 빠진 거 없는지 확인해줘", "체크리스트 만들어줘", "발표 제출 전 해야 할 일 정리해줘"처럼 마감 전 점검을 요청할 때 호출한다.

### Input

```json
{
  "chat_text": "string",
  "assignment_requirements": "string",
  "deliverable_type": "presentation",
  "deadline": "string",
  "known_tasks": [
    {
      "owner": "string",
      "task": "string",
      "status": "assigned"
    }
  ]
}
```

### Input fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `chat_text` | string | No | 체크리스트 생성에 참고할 팀플 대화 텍스트. |
| `assignment_requirements` | string | No | 교수님 공지, LMS 과제 조건, 제출 형식 등. |
| `deliverable_type` | `"presentation" \| "report" \| "prototype" \| "video" \| "mixed" \| "unknown"` | Yes | 제출물 유형. |
| `deadline` | string | No | 전체 제출 마감. |
| `known_tasks` | object[] | No | 이미 추출된 역할/업무 목록. `extract_team_tasks` 결과를 전달할 수 있다. |
| `known_tasks[].owner` | string | No | 담당자 이름. |
| `known_tasks[].task` | string | Yes | 업무명. |
| `known_tasks[].status` | `"assigned" \| "in_progress" \| "done" \| "unclear"` | No | 업무 상태. |

### Output

```json
{
  "content": [
    {
      "type": "text",
      "text": "🧾 제출 전 체크리스트\n- [ ] PPT 최종본 확인\n- [ ] 발표 대본 작성\n- [ ] 참고문헌 형식 확인\n- [ ] 발표 순서 확정\n- [ ] LMS 제출 담당자 확정\n\n⚠️ 리스크\n- 수빈 역할이 아직 미정입니다.\n- 참고문헌 형식이 확정되지 않았습니다."
    }
  ]
}
```

### Success example

Request:

```json
{
  "chat_text": "[민지] 자료조사는 수요일까지 할게\n[현우] PPT는 금요일까지 초안 만들게\n[나] 전체 제출은 다음 주 월요일 23:59까지야\n[현우] 참고문헌 형식도 확인해야 할 듯",
  "assignment_requirements": "발표 자료 PDF 제출, 참고문헌 포함",
  "deliverable_type": "presentation",
  "deadline": "다음 주 월요일 23:59",
  "known_tasks": [
    {
      "owner": "민지",
      "task": "자료조사",
      "status": "assigned"
    },
    {
      "owner": "현우",
      "task": "PPT 초안",
      "status": "assigned"
    }
  ]
}
```

Response:

```json
{
  "content": [
    {
      "type": "text",
      "text": "🧾 제출 전 체크리스트\n- [ ] 자료조사 정리\n- [ ] PPT 최종본 완성\n- [ ] 발표 자료 PDF 변환\n- [ ] 참고문헌 포함 여부 확인\n- [ ] LMS 제출 담당자 확정\n\n⚠️ 리스크\n- 참고문헌 형식이 아직 확정되지 않았습니다.\n- 전체 제출 마감은 다음 주 월요일 23:59입니다."
    }
  ]
}
```

### Error cases

| Case | Condition | Expected behavior |
|---|---|---|
| Missing deliverable type | `deliverable_type`이 없음 | validation error를 반환한다. |
| No source content | `chat_text`, `assignment_requirements`, `known_tasks`가 모두 없음 | "체크리스트를 만들 기준 정보가 부족합니다."라고 반환한다. |
| Invalid deliverable type | 허용되지 않은 제출물 유형 | validation error를 반환한다. |
| Empty checklist | 체크리스트 항목 생성 실패 | 제출물 유형별 기본 체크리스트를 반환하고 정보 부족을 알린다. |
| Internal error | service 예외 | "체크리스트 생성 중 문제가 발생했습니다."라고 반환한다. |

### Notes

- 체크리스트는 5~8개 내외로 제한한다.
- 확정되지 않은 항목은 `[ ]`와 리스크 섹션에 함께 표시한다.
- `assignment_requirements`가 있으면 대화 내용보다 우선한다.
- 실제 LMS나 파일 시스템 접근은 MVP 범위가 아니다.
- 보고서, 발표, 프로토타입, 영상 제출물별 기본 항목을 service 내부 규칙으로 둔다.

## Implementation Priority

| Priority | Tool | MVP | User value | Difficulty | Rationale |
|---|---|---:|---|---|---|
| 1 | `extract_team_tasks` | Yes | Very high | Medium | 팀플의 가장 큰 고통인 역할/마감 정리를 해결하고, 다른 tool의 입력으로 재사용된다. |
| 2 | `summarize_team_decisions` | Yes | High | Medium | 단순 요약이 아니라 결정/미정 분리라는 차별점을 만든다. |
| 3 | `generate_team_reminder` | Yes | High | Low | 카카오톡에 바로 붙여넣는 결과라 데모 체감도가 높다. |
| 4 | `make_submission_checklist` | Yes | Medium-high | Medium | 마감 전 누락 방지 가치를 보여주며 공모전 발표에서 이해하기 쉽다. |
| 5 | `extract_shared_resources` | No | Medium | Low-medium | 유용하지만 MVP 핵심 문제보다 후순위다. |

## MVP Recommendation

마감이 가까운 공모전 출품 상황에서는 아래 3개를 반드시 포함한다.

1. `extract_team_tasks`
2. `summarize_team_decisions`
3. `generate_team_reminder`

`make_submission_checklist`는 가능하면 포함한다. 구현 시간이 부족하면 rule-based 기본 체크리스트만 제공해도 데모 가치가 있다.

`extract_shared_resources`, `track_team_progress`, `parse_contest_requirements`는 후순위로 둔다.
