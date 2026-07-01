# Agentic Player 10 MCP

Agentic Player 10 출품용 TypeScript MCP 서버입니다.

현재 스캐폴드는 MCP 서버 실행, TypeScript 빌드, 개발 모드 실행, 테스트 실행을 위한 기본 구조를 제공합니다. MVP 도구는 `docs/` 문서를 기준으로 순차 구현합니다.

## 목표

카카오톡 팀 대화처럼 비정형으로 흩어진 프로젝트 정보를 MCP 도구로 정리합니다.

- 팀원별 할 일과 마감일 추출
- 결정 사항과 미정 사항 요약
- 제출물 체크리스트 생성
- 팀 채팅방에 붙여 넣을 리마인드 메시지 생성

## 현재 제공 도구

- `health_check`: MCP 서버가 정상 실행 중인지 확인합니다.

## 프로젝트 구조

```text
.
├── docs/
│   ├── demo-scenario.md
│   ├── playmcp-submit.md
│   ├── prd-team-project-mcp.md
│   └── tool-spec.md
├── src/
│   ├── schemas/
│   │   └── index.ts
│   ├── services/
│   │   └── index.ts
│   ├── tools/
│   │   └── index.ts
│   └── server.ts
├── tests/
│   └── server.test.ts
├── .env.example
├── .gitignore
├── mcp.json
├── package.json
└── tsconfig.json
```

## 요구 사항

- Node.js 20 이상
- npm

## 설치

```bash
npm install
```

## 개발 실행

```bash
npm run dev
```

`tsx`로 `src/server.ts`를 직접 실행합니다.

## 빌드

```bash
npm run build
```

빌드 결과는 `dist/`에 생성됩니다.

## 프로덕션 실행

```bash
npm start
```

`dist/server.js`를 실행합니다. 먼저 `npm run build`를 실행해야 합니다.

## 테스트

```bash
npm test
```

## 타입 검사

```bash
npm run lint
```

## MCP 클라이언트 설정 예시

`mcp.json`은 빌드된 서버를 실행하는 로컬 MCP 클라이언트 설정 예시입니다.

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

개발 중에는 클라이언트 설정을 다음처럼 바꿔 `tsx`로 직접 실행할 수도 있습니다.

```json
{
  "mcpServers": {
    "agentic-player-10": {
      "command": "npm",
      "args": ["run", "dev"]
    }
  }
}
```

## 환경 변수

`.env.example`을 참고해 필요한 값만 `.env`에 설정합니다.

```bash
KAKAO_API_KEY=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
LOG_LEVEL=info
```

현재 스캐폴드 서버는 외부 API를 호출하지 않으므로 환경 변수 없이도 실행됩니다.

## 구현 예정 도구

- `extract_team_tasks`
- `summarize_team_decisions`
- `make_submission_checklist`
- `generate_team_reminder`
- `extract_shared_resources`

## 문서

- [PRD](docs/prd-team-project-mcp.md)
- [도구 명세](docs/tool-spec.md)
- [데모 시나리오](docs/demo-scenario.md)
- [PlayMCP 제출 문서](docs/playmcp-submit.md)
