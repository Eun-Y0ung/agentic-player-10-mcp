# InternMate MCP

Agentic Player 10 출품용 TypeScript MCP 서버입니다.

InternMate MCP는 대학생과 취업 준비생이 자연어로 인턴/신입/경력무관 공고를 찾을 수 있도록 돕습니다. 사람인 채용정보 API를 사용해 기본적으로 오늘 기준 14일 안에 마감되는 공고를 추천순으로 정리하고, 카카오톡에서 읽기 쉬운 텍스트로 반환합니다.

## Tools

- `health_check`: MCP 서버 상태 확인
- `search_entry_jobs`: 인턴/신입/경력무관 공고 검색 및 추천
- `get_job_detail`: 공고 ID 또는 URL 기반 상세 요약
- `make_application_brief`: 선택 공고 지원 준비 체크리스트 생성

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

## Test

```bash
npm test
```

## Environment

`.env` 또는 MCP 클라이언트 환경 변수에 다음 값을 설정합니다.

```text
SARAMIN_ACCESS_KEY=
SARAMIN_API_BASE_URL=https://oapi.saramin.co.kr
LOG_LEVEL=info
```

API key는 코드에 하드코딩하지 않습니다. 단위 테스트는 실제 사람인 API를 호출하지 않고 fixture/mock 데이터를 사용합니다.

## MCP Client Example

```json
{
  "mcpServers": {
    "agentic-player-10": {
      "command": "node",
      "args": ["dist/server.js"],
      "env": {
        "SARAMIN_ACCESS_KEY": "...",
        "SARAMIN_API_BASE_URL": "https://oapi.saramin.co.kr",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## Example Prompt

```text
IT 기업 인턴 공고 찾아줘
```

후속 질문:

```text
1번 공고 자세히 알려줘
```

## Project Structure

```text
src/
  server.ts
  tools/
  schemas/
  services/
  utils/
tests/
  fixtures/
  services/
  tools/
docs/
```

## Safety

- 실제 지원 제출은 수행하지 않습니다.
- 합격 가능성을 예측하지 않습니다.
- 사용자 개인정보를 저장하지 않습니다.
- 공고 조건이 불확실하면 원문 링크 확인을 안내합니다.
