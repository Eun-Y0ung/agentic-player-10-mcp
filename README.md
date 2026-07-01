# TeamTok MCP

Agentic Player 10 출품을 위한 TypeScript MCP 서버입니다. TeamTok MCP는 대학생 팀플 카카오톡방의 흩어진 대화를 역할, 마감일, 결정사항, 미정 항목, 제출 체크리스트, 리마인드 메시지로 바꾸는 것을 목표로 합니다.

핵심은 단순한 "카톡 대화 요약"이 아니라, 팀플 대화를 과제 제출까지 이어지는 실행 계획으로 구조화하는 것입니다.

## 한 줄 소개

카톡 팀플방의 대화를 팀원별 역할, 마감, 미정 항목, 제출 체크리스트, 공지 메시지로 정리해주는 대학생용 MCP 서버.

## 해결하려는 문제

대학생 팀플은 대부분 카카오톡 단체방에서 진행되지만, 카카오톡은 작업 관리 도구가 아닙니다.

- 역할 분담이 잡담 사이에 묻혀 나중에 다시 찾기 어렵습니다.
- 마감일이 교수님 공지, LMS, 카톡 대화에 흩어져 있습니다.
- 회의에서 결정된 것과 아직 정해지지 않은 것이 섞입니다.
- 조장이나 성실한 팀원이 매번 공지와 리마인드 메시지를 다시 작성합니다.
- 제출 직전에 누락된 항목을 발견하기 쉽습니다.

TeamTok MCP는 사용자가 복사해 붙여넣은 팀플 대화 텍스트를 MCP 도구 입력으로 받아, 에이전트가 바로 활용할 수 있는 구조화된 결과를 반환합니다.

## 주요 사용자

- 대학생 팀플 조장
- 실질적으로 팀을 정리하는 팀원
- 공모전/해커톤 참가 대학생
- 캡스톤디자인, 동아리 프로젝트, 스터디 그룹 운영자

## MVP 도구

### `extract_team_tasks`

카톡 대화에서 팀원별 담당 업무, 마감일, 진행 상태, 근거 문장을 추출합니다.

입력 예:

```json
{
  "chat_text": "string",
  "project_context": "string | optional",
  "known_members": "string[] | optional",
  "base_date": "string | optional"
}
```

반환 예:

```json
{
  "project_title": "생성형 AI 교육 활용 발표",
  "tasks": [
    {
      "owner": "민지",
      "task": "자료조사",
      "deadline": "수요일 밤",
      "status": "assigned",
      "confidence": "high",
      "evidence": "내가 논문이랑 기사 찾아볼게. 수요일 밤까지 정리해볼게"
    }
  ],
  "unassigned_tasks": ["수빈 역할"],
  "warnings": []
}
```

### `summarize_team_decisions`

대화에서 확정된 결정사항, 아직 정해야 하는 항목, 다음 회의 안건을 분리합니다.

### `make_submission_checklist`

발표, 보고서, 프로토타입, 영상 등 제출물 유형에 맞춰 제출 전 체크리스트를 만듭니다. 명시되지 않은 항목은 확정하지 않고 `unknown` 또는 `missing`으로 표시합니다.

### `generate_team_reminder`

구조화된 역할/마감/미정 항목을 바탕으로 카톡방에 바로 붙여넣을 수 있는 공지 또는 리마인드 메시지를 생성합니다.

### 선택 확장: `extract_shared_resources`

대화 속 링크, 파일명, 논문, 기사, 자료명, 참고자료 후보를 추출합니다.

## 데모 흐름

예시 입력 대화:

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

에이전트는 이 대화를 바탕으로 다음 순서의 MCP 도구를 호출할 수 있습니다.

1. `extract_team_tasks`: 민지 자료조사, 현우 PPT 초안, 나 발표 대본, 수빈 역할 미정, 전체 제출 마감 추출
2. `summarize_team_decisions`: 발표 주제/구성/일부 역할/제출 마감은 결정, 수빈 역할/참고문헌 형식/발표 순서는 미정으로 분리
3. `make_submission_checklist`: PPT 최종본, 발표 대본, 자료조사, 참고문헌 형식, 발표 순서, LMS 제출 담당자 확인
4. `generate_team_reminder`: 팀원에게 보낼 카톡 리마인드 문장 생성

## 현재 구현 상태

현재 저장소는 MCP 서버 스캐폴드와 `health_check` 도구를 포함합니다. 위 MVP 도구들은 `docs/prd-team-project-mcp.md`를 기준으로 구현할 목표 도구입니다.

현재 제공 도구:

- `health_check`: MCP 서버 실행 상태 확인

## 프로젝트 구조

```text
src/
  server.ts
  tools/
  services/
  schemas/
tests/
docs/
  prd-team-project-mcp.md
  demo-scenario.md
  tool-spec.md
  playmcp-submit.md
```

권장 구현 구조:

```text
src/
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
```

## 실행 방법

필요 환경:

- Node.js 20 이상
- npm

설치:

```bash
npm install
```

빌드:

```bash
npm run build
```

실행:

```bash
npm start
```

개발 모드:

```bash
npm run dev
```

테스트:

```bash
npm test
```

타입 검사:

```bash
npm run lint
```

## MCP 설정

`mcp.json`은 로컬 MCP 클라이언트에서 빌드된 서버를 실행하기 위한 예시 설정입니다.

```json
{
  "mcpServers": {
    "agentic-player-10": {
      "command": "node",
      "args": ["dist/server.js"],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## 데이터 처리 원칙

- 카카오톡 계정 또는 실제 채팅방에 직접 접근하지 않습니다.
- 사용자가 명시적으로 붙여넣은 대화 텍스트만 처리합니다.
- 대화 원문을 장기 저장하지 않는 것을 기본 원칙으로 합니다.
- 이름, 학번, 전화번호 등 개인정보가 포함될 수 있으므로 로그 저장을 최소화합니다.
- 발표와 테스트에는 실제 팀플 대화가 아닌 합성 데이터를 사용합니다.

## 문서

- [PRD](docs/prd-team-project-mcp.md)
- [도구 명세](docs/tool-spec.md)
- [데모 시나리오](docs/demo-scenario.md)
- [PlayMCP 제출 문서](docs/playmcp-submit.md)

## 개발 로드맵

1. `extract_team_tasks` 구현
2. `summarize_team_decisions` 구현
3. `generate_team_reminder` 구현
4. `make_submission_checklist` 구현
5. 합성 한국어 팀플 대화 fixture 기반 테스트 추가
6. 도구 명세와 데모 시나리오 업데이트
7. 시간이 남으면 `extract_shared_resources` 추가
