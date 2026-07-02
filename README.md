# InternMate MCP

Agentic Player 10 출품용 TypeScript MCP 서버입니다.

InternMate MCP는 대학생이 자연어로 인턴/신입 공고를 찾으면 사람인 채용정보 API를 조회해 2주 이내 마감 공고를 추천순으로 정리하는 것을 목표로 합니다.

## Goal

사용자는 MCP 테스트 환경에서 다음처럼 질문합니다.

```text
IT 기업 인턴 공고 찾아줘.
```

서버는 사람인 채용정보 API를 기반으로 인턴/신입/경력무관 공고를 검색하고, 대학생 관점에서 읽기 쉬운 추천 결과를 반환합니다.

## Current Tool

- `health_check`: MCP 서버 상태 확인

## Planned Tools

- `search_entry_jobs`: 인턴/신입 공고 검색 및 추천
- `get_job_detail`: 특정 공고 상세 요약
- `make_application_brief`: 지원 준비 체크리스트 생성

## Project Structure

```text
src/
  server.ts
  tools/
  services/
  schemas/
tests/
docs/
```

## Requirements

- Node.js 20 이상
- npm
- 사람인 채용정보 API access key

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Start

```bash
npm start
```

## Test

```bash
npm test
```

## Environment

```text
SARAMIN_ACCESS_KEY=
SARAMIN_API_BASE_URL=https://oapi.saramin.co.kr
LOG_LEVEL=info
```

API key는 코드에 하드코딩하지 말고 `.env`에 설정합니다.

## MCP Client Example

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

개발 중에는 다음처럼 `tsx`로 직접 실행할 수 있습니다.

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

## Docs

- [PRD](docs/prd-intern-mcp.md)
- [MCP Architecture](docs/mcp-architecture.md)
- [Tool Spec](docs/tool-spec.md)
- [Demo Scenario](docs/demo-scenario.md)
- [PlayMCP Submit](docs/playmcp-submit.md)
