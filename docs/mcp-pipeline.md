# Agentic Player 10 MCP 서버 개발 파이프라인

> 이 문서는 Agentic Player 10 출품용 MCP 서버 개발을 위한 전체 작업 흐름을 정리한 문서입니다.  
> 프로젝트 루트에 두고, 기획 단계부터 최종 배포/제출 전까지 참고하는 것을 목표로 합니다.

---

## 0. 전체 원칙

이 프로젝트에서는 **ChatGPT 앱, Codex 앱, VS Code Codex 확장, Codex CLI**를 역할별로 나누어 사용합니다.

```text
ChatGPT 앱        = 기획 상담, PRD 초안, 방향성 점검
Codex 앱          = 작업 관리, 문서화, 제출 전략, 병렬 아이디어 정리
VS Code 확장      = 코드 편집, tool schema 작성, 파일 단위 리뷰
Codex CLI         = 서버 구현, 실행, 테스트, 디버깅, 배포 점검
```

---

## InternMate MCP 추가 체크포인트

현재 프로젝트는 TeamTok/팀플 MCP가 아니라 `InternMate MCP` 기준으로 검증한다.

### 1. 문서 기준 확인

- [ ] PRD 기준 문서는 `docs/prd-intern-mcp.md`다.
- [ ] tool 기준 문서는 `docs/tool-spec.md`다.
- [ ] 구조 기준 문서는 `docs/mcp-architecture.md`다.
- [ ] 데모 기준 문서는 `docs/demo-scenario.md`다.
- [ ] 제출 설명 기준 문서는 `docs/playmcp-submit.md`다.
- [ ] 위 문서들이 모두 `InternMate MCP` 방향을 가리킨다.
- [ ] TeamTok/팀플 관련 설명이 주요 문서에 남아 있지 않다.

### 2. MCP tool 목록 확인

노출되어야 하는 tool:

- [ ] `health_check`
- [ ] `search_entry_jobs`
- [ ] `get_job_detail`
- [ ] `make_application_brief`

남아 있으면 안 되는 이전 tool:

- [ ] `extract_team_tasks` 없음
- [ ] `summarize_team_decisions` 없음
- [ ] `generate_team_reminder` 없음
- [ ] `make_submission_checklist` 없음

확인 명령:

```bash
rg "extract_team_tasks|summarize_team_decisions|generate_team_reminder|make_submission_checklist|TeamTok|team-project" .
```

검색 결과가 없어야 한다.

### 3. 사람인 API 환경 변수 확인

- [ ] API key는 코드에 하드코딩하지 않는다.
- [ ] `process.env.SARAMIN_ACCESS_KEY`에서 API key를 읽는다.
- [ ] `process.env.SARAMIN_API_BASE_URL`이 있으면 사용한다.
- [ ] base URL이 없으면 `https://oapi.saramin.co.kr`를 기본값으로 사용한다.
- [ ] `.env.example`, `README.md`, `mcp.json`의 환경 변수 예시가 서로 맞는다.

필수 환경 변수:

```text
SARAMIN_ACCESS_KEY=
SARAMIN_API_BASE_URL=https://oapi.saramin.co.kr
```

### 4. `search_entry_jobs` 검증

- [ ] `keywords`가 없으면 `찾고 싶은 직무나 키워드를 입력해 주세요.`를 반환한다.
- [ ] `deadline_within_days` 기본값은 14다.
- [ ] `limit` 기본값은 5다.
- [ ] 인턴/신입/경력무관 공고가 추천 점수를 더 받는다.
- [ ] 14일 안에 마감되는 공고를 우선한다.
- [ ] 지역 조건이 있으면 추천 사유에 반영된다.
- [ ] 응답에는 회사명, 공고명, 마감, 지역, 경력, 고용형태, 추천 이유, 링크가 포함된다.
- [ ] 빈 결과일 때 조건 완화 제안 메시지를 반환한다.
- [ ] API key가 없으면 `사람인 API 키가 설정되지 않았습니다.`를 반환한다.
- [ ] API 실패 시 안전한 한국어 메시지를 반환한다.

### 5. `get_job_detail` 검증

- [ ] `job_id` 또는 `job_url` 중 하나가 필요하다.
- [ ] 둘 다 없으면 `상세 조회할 공고 ID 또는 URL이 필요합니다.`를 반환한다.
- [ ] 상세 응답에는 공고 원문 링크가 포함된다.
- [ ] 마감, 지역, 경력, 학력, 고용형태를 요약한다.
- [ ] 불확실한 조건은 확정적으로 말하지 않고 원문 확인을 안내한다.
- [ ] 공고를 찾지 못하면 마감/URL 변경 가능성을 안내한다.
- [ ] `include_application_brief`가 true면 지원 준비 체크리스트를 함께 반환한다.

### 6. `make_application_brief` 검증

- [ ] `job`이 없으면 `체크리스트를 만들 공고 정보가 필요합니다.`를 반환한다.
- [ ] `job.title`이 없으면 `공고명이 필요합니다.`를 반환한다.
- [ ] 이력서, 자기소개서, 프로젝트 경험, 포트폴리오/GitHub, 마감 전 제출 항목을 포함한다.
- [ ] 공고 요구사항에 Java/Spring/backend가 있으면 관련 프로젝트 정리 항목을 보강한다.
- [ ] 공고 요구사항에 data/SQL/Python이 있으면 데이터 경험 정리 항목을 보강한다.
- [ ] 합격 가능성 예측을 하지 않는다는 안내를 포함한다.

### 7. 테스트 기준

- [ ] unit test에서 실제 사람인 API를 호출하지 않는다.
- [ ] `tests/fixtures/saramin-jobs.ts` 같은 fixture/mock client를 사용한다.
- [ ] `npm run build`가 통과한다.
- [ ] `npm test`가 통과한다.
- [ ] API key 누락 테스트가 있다.
- [ ] 빈 검색 결과 테스트가 있다.
- [ ] 공고 상세 not found 테스트가 있다.
- [ ] tool handler 응답이 항상 MCP `content` 배열 형태인지 확인한다.

검증 명령:

```bash
npm run build
npm test
```

PowerShell 실행 정책 때문에 `npm`이 막히면 Windows에서는 다음 명령을 사용한다.

```bash
npm.cmd run build
npm.cmd test
```

### 8. MCP Inspector 수동 확인

개발 실행:

```bash
npx @modelcontextprotocol/inspector npx tsx src/server.ts
```

빌드 후 실행:

```bash
npm run build
npx @modelcontextprotocol/inspector node dist/server.js
```

확인할 것:

- [ ] tool 목록에 InternMate tool 4개가 보인다.
- [ ] 각 tool description이 현재 기획과 맞다.
- [ ] input schema가 과하게 복잡하지 않다.
- [ ] 정상 입력 호출이 성공한다.
- [ ] 잘못된 입력 호출이 안전한 한국어 메시지를 반환한다.
- [ ] 응답이 카카오톡에서 읽기 좋은 길이와 bullet 형태다.

### 9. 보안/비목표 확인

- [ ] API key가 README, docs, tests, source에 실제 값으로 들어가지 않는다.
- [ ] 사용자 개인정보를 저장하지 않는다.
- [ ] 실제 지원 제출 기능을 구현하지 않는다.
- [ ] 합격 가능성 예측을 하지 않는다.
- [ ] 공고 조건은 원문 최종 확인을 안내한다.
- [ ] 로그나 응답에 민감정보가 노출되지 않는다.

### 10. 최종 판단 기준

아래 세 질문에 모두 "예"라고 답할 수 있으면 MVP 기준 통과로 본다.

```text
1. 사용자가 "IT 기업 인턴 공고 찾아줘"라고 했을 때 search_entry_jobs가 자연스럽게 동작하는가?
2. 사용자가 "1번 공고 자세히 알려줘"라고 했을 때 get_job_detail이 원문 링크와 함께 요약하는가?
3. API key가 없거나 결과가 없거나 입력이 잘못되어도 서버가 죽지 않고 안전한 메시지를 반환하는가?
```

핵심 운영 원칙은 다음과 같습니다.

```text
앱에서 생각하고,
VS Code에서 고치고,
CLI에서 증명한다.
```

MCP 서버 프로젝트에서는 마지막 기준이 항상 **CLI에서의 build/test/inspect 통과 여부**입니다.

---

## 1. 프로젝트 기준 파일

Codex가 안정적으로 작업하려면, 기획 내용을 ChatGPT 대화 안에만 두지 않고 반드시 repo 내부 문서로 저장해야 합니다.

추천 문서 구조:

```text
docs/
├─ prd.md
├─ tool-spec.md
├─ mcp-architecture.md
├─ demo-scenario.md
└─ playmcp-submit.md
```

각 문서의 역할은 다음과 같습니다.

| 파일 | 역할 |
|---|---|
| `docs/prd.md` | 서비스 아이디어, 문제 정의, 사용자 요구사항 |
| `docs/tool-spec.md` | MCP tool별 입력/출력/에러 케이스 명세 |
| `docs/mcp-architecture.md` | 서버 구조, 폴더 구조, 모듈 역할 |
| `docs/demo-scenario.md` | 실제 사용 시나리오, 데모 흐름 |
| `docs/playmcp-submit.md` | PlayMCP 등록/제출용 설명 문구 |

---

## 2. 추천 프로젝트 구조

TypeScript MCP 서버 기준으로 다음 구조를 권장합니다.

```text
agentic-player-10-mcp/
├─ src/
│  ├─ server.ts
│  ├─ tools/
│  │  ├─ index.ts
│  │  └─ healthCheck.ts
│  ├─ services/
│  ├─ schemas/
│  └─ utils/
├─ tests/
├─ docs/
│  ├─ prd.md
│  ├─ tool-spec.md
│  ├─ mcp-architecture.md
│  ├─ demo-scenario.md
│  └─ playmcp-submit.md
├─ .env.example
├─ .gitignore
├─ README.md
├─ package.json
└─ tsconfig.json
```

각 폴더의 책임은 다음과 같습니다.

| 경로 | 역할 |
|---|---|
| `src/server.ts` | MCP 서버 생성, tool 등록, transport 설정 |
| `src/tools/` | MCP tool 구현 |
| `src/services/` | 비즈니스 로직, 외부 API 연동 |
| `src/schemas/` | input validation schema |
| `src/utils/` | 공통 유틸, 에러 포맷터, 응답 포맷터 |
| `tests/` | tool 단위 테스트, 에러 케이스 테스트 |
| `docs/` | 기획, 명세, 제출 문서 |

---

## 3. 전체 파이프라인 요약

```text
1. 기획/전략 수립
2. 프로젝트 초기 세팅
3. PRD 작성
4. MCP 서버 구조 설계
5. tool-spec.md 작성
6. MCP 서버 최소 구현
7. 핵심 tool 구현
8. 로컬 실행/디버깅
9. MCP Inspector 검증
10. 코드 리뷰/리팩토링
11. 문서화/제출 자료 작성
12. 배포/Endpoint 준비
13. PlayMCP 등록
14. 제출 전 최종 QA
```

---

## 4. 단계별 작업 흐름

### 4.1 기획 / 출품 전략 수립

**주 도구:** ChatGPT 앱, Codex 앱

이 단계에서는 코드보다 먼저 출품작의 방향을 정합니다.

정해야 할 것:

```text
- 서비스명
- 한 줄 소개
- 타깃 사용자
- 해결할 문제
- 카카오톡에서 사용되는 상황
- MCP 서버로 구현해야 하는 이유
- 핵심 tool 후보
- 본선 사용자 투표에서 어필할 포인트
```

산출물:

```text
docs/prd.md
docs/demo-scenario.md 초안
```

Codex 앱 또는 ChatGPT에 줄 수 있는 프롬프트:

```text
Agentic Player 10에 출품할 MCP 서버를 기획하려고 해.
카카오톡 사용자가 자연어로 사용할 수 있는 서비스라는 관점에서
문제 정의, 타깃 사용자, 핵심 사용 시나리오 3개,
MCP tool 후보, 차별점, 본선 투표 어필 포인트를 정리해줘.
```

---

### 4.2 프로젝트 초기 세팅

**주 도구:** Codex CLI  
**보조 도구:** VS Code

기본 repo와 실행 구조를 만듭니다.

예시 명령:

```bash
mkdir agentic-player-10-mcp
cd agentic-player-10-mcp
git init
```

Codex CLI에 줄 수 있는 프롬프트:

```text
이 프로젝트는 Agentic Player 10 출품용 TypeScript MCP 서버야.
기본 폴더 구조, package.json, tsconfig.json, .gitignore,
.env.example, README 초안을 만들어줘.
개발 실행은 npm run dev, 빌드는 npm run build로 가능하게 해줘.
```

완료 기준:

```text
- Git repo 생성
- package.json 생성
- TypeScript 설정 완료
- src/server.ts 기본 구조 생성
- docs/ 폴더 생성
- README 초안 생성
```

---

### 4.3 PRD 작성

**주 도구:** ChatGPT 앱, Codex 앱

PRD는 이후 Codex가 구현 기준으로 삼는 핵심 문서입니다.

`docs/prd.md`에 포함할 내용:

```text
- 서비스 개요
- 문제 정의
- 타깃 사용자
- 사용자 시나리오
- 핵심 기능
- 비기능 요구사항
- 제외할 범위
- MVP 기준
- 성공 기준
```

중요한 점:

```text
ChatGPT 대화 안의 기획은 Codex가 자동으로 읽지 못할 수 있음.
따라서 최종 PRD는 반드시 repo 내부의 docs/prd.md에 저장한다.
```

---

### 4.4 MCP 서버 구조 설계

**주 도구:** Codex CLI  
**보조 도구:** VS Code Codex 확장

PRD를 기준으로 서버 구조와 모듈 책임을 설계합니다.

Codex CLI에 줄 수 있는 프롬프트:

```text
이 repo는 Agentic Player 10 출품용 MCP 서버 프로젝트입니다.

현재 상태:
- 프로젝트 초기 세팅은 완료되어 있습니다.
- PRD는 docs/prd.md에 작성되어 있습니다.
- docs/tool-spec.md에는 health_check만 있고, 실제 핵심 tool 명세는 아직 비어 있습니다.

목표:
PRD를 기반으로 MCP 서버 구조와 각 tool을 구체적으로 설계하고,
구현 전에 문서 명세를 완성하려고 합니다.

작업 지시:
1. repo 구조를 확인해 주세요.
2. docs/prd.md를 읽고 서비스의 핵심 목적, 사용자 시나리오, 필요한 기능을 요약해 주세요.
3. 그 내용을 바탕으로 MCP 서버 구조를 설계해 주세요.
4. 핵심 MCP tool 2~4개를 선정해 주세요.
5. docs/tool-spec.md를 완성해 주세요.
6. 필요하다면 docs/mcp-architecture.md를 새로 만들어 서버 구조를 정리해 주세요.

아직 실제 TypeScript 구현은 하지 마세요.
이번 단계에서는 문서와 설계만 수정해 주세요.
```

완료 기준:

```text
- docs/mcp-architecture.md 작성
- 핵심 tool 2~4개 선정
- tool별 책임 구분
- MVP tool과 후순위 tool 구분
```

---

### 4.5 tool-spec.md 작성

**주 도구:** VS Code Codex 확장  
**보조 도구:** Codex CLI

`tool-spec.md`는 구현 전 반드시 확정해야 하는 문서입니다.

각 tool은 아래 형식을 따릅니다.

```md
## tool_name

### Purpose
이 tool이 해결하는 문제를 한 문장으로 설명합니다.

### When to use
사용자가 어떤 요청을 했을 때 이 tool을 호출해야 하는지 설명합니다.

### Input
JSON 형태로 입력값을 정의합니다.

### Input fields
| Field | Type | Required | Description |

### Output
MCP content 배열 형태의 응답 구조를 정의합니다.

### Success example
정상 요청과 정상 응답 예시를 작성합니다.

### Error cases
입력 누락, 잘못된 값, 빈 결과, 외부 API 실패, timeout 등을 정리합니다.

### Notes
구현 시 주의사항, 보안, 개인정보, 응답 길이 제한, 카카오톡 UX 관점을 작성합니다.

### Implementation priority
MVP / Optional / Later 중 하나로 표시합니다.
```

tool 설계 기준:

```text
- PRD의 핵심 사용자 문제와 직접 연결되어야 한다.
- tool은 2~4개로 제한한다.
- health_check는 서버 상태 확인용으로만 유지한다.
- tool 이름은 명확한 동사 중심으로 작성한다.
- input은 query:string 하나로 뭉개지 말고 구조화한다.
- output은 MCP의 content 배열 형태를 따른다.
- 응답 text는 카카오톡 대화에서 읽기 쉬운 길이와 형식으로 설계한다.
```

VS Code Codex 확장에 줄 수 있는 프롬프트:

```text
현재 열려 있는 docs/prd.md와 docs/tool-spec.md를 기준으로
Agentic Player 10 출품용 MCP 서버의 핵심 tool 명세를 구체화해줘.

health_check 외에 실제 사용자 가치를 제공하는 핵심 tool 2~4개를 선정하고,
각 tool마다 Purpose, When to use, Input, Input fields, Output,
Success example, Error cases, Notes, Implementation priority를 작성해줘.

아직 src 코드는 수정하지 말고 docs/tool-spec.md만 수정해줘.
응답은 카카오톡 대화 환경에서 읽기 쉬운 형태를 기준으로 설계해줘.
```

완료 기준:

```text
- health_check 명세 정리
- 핵심 tool 2~4개 명세 작성
- 모든 tool의 input/output/error case 작성
- MVP tool 확정
```

---

### 4.6 MCP 서버 최소 구현

**주 도구:** Codex CLI  
**보조 도구:** VS Code Codex 확장

처음부터 모든 기능을 만들지 말고, tool 하나가 정상 작동하는 최소 서버를 먼저 만듭니다.

목표:

```text
- MCP 서버가 실행된다.
- tools 목록이 노출된다.
- health_check가 호출된다.
- 샘플 핵심 tool 하나가 호출된다.
- 잘못된 입력에서 서버가 죽지 않는다.
```

Codex CLI에 줄 수 있는 프롬프트:

```text
docs/tool-spec.md가 확정되었습니다.
이제 tool-spec.md를 기준으로 TypeScript MCP 서버의 최소 구현을 진행해 주세요.

작업 범위:
1. src/tools/에 health_check와 MVP 핵심 tool 1개를 구현해 주세요.
2. src/schemas/에 input validation schema를 작성해 주세요.
3. src/services/에 비즈니스 로직을 분리해 주세요.
4. src/server.ts에서 tools를 등록해 주세요.
5. npm run build가 통과해야 합니다.

구현 기준:
- tool-spec.md의 Input/Output/Error cases를 반드시 따르세요.
- MCP 응답은 content 배열 형태를 유지해 주세요.
- 에러 메시지는 사용자에게 노출되어도 안전한 문장으로 작성해 주세요.

작업 후 수정한 파일, 구현한 tool, 남은 TODO를 요약해 주세요.
```

완료 기준:

```text
- npm run build 성공
- 서버 실행 성공
- health_check 호출 성공
- MVP tool 1개 호출 성공
```

---

### 4.7 핵심 tool 구현

**주 도구:** VS Code Codex 확장, Codex CLI

기능 하나씩 반복해서 구현합니다.

반복 루프:

```text
1. VS Code 확장으로 tool 코드 초안 작성
2. CLI로 npm run dev 실행
3. CLI로 tool 호출 테스트
4. 실패 로그를 CLI에 전달해 수정
5. VS Code에서 diff 확인
6. 테스트 코드 추가
7. git commit
```

Codex CLI에 줄 수 있는 프롬프트:

```text
docs/tool-spec.md의 다음 MVP tool을 구현해줘.

작업 범위:
- src/tools/에 tool 파일 생성
- src/schemas/에 input schema 추가
- src/services/에 비즈니스 로직 추가
- src/server.ts 또는 src/tools/index.ts에 tool 등록
- tests/에 정상 케이스와 에러 케이스 추가

구현 기준:
- 입력 검증
- 정상 응답
- 빈 결과 처리
- 외부 API 실패 처리
- timeout 처리
- 사용자에게 안전한 에러 메시지
- MCP content 배열 응답 형식 유지

마지막에 npm run build와 npm test를 실행하고,
실패하면 원인을 분석해 수정해줘.
```

완료 기준:

```text
- MVP tool 전체 구현
- 각 tool 테스트 작성
- build/test 통과
- 에러 케이스 처리
```

---

### 4.8 로컬 실행 / 디버깅

**주 도구:** Codex CLI

MCP 서버는 실제 실행과 로그 확인이 중요합니다.

기본 명령:

```bash
npm run dev
npm run build
npm test
```

디버깅 체크리스트:

```text
- 서버가 정상적으로 시작되는가?
- 환경변수가 없을 때 친절한 오류가 나오는가?
- tool 호출 실패 시 서버가 죽지 않는가?
- 응답 포맷이 일관적인가?
- 로그에 API key나 개인정보가 찍히지 않는가?
```

Codex CLI에 줄 수 있는 프롬프트:

```text
npm run dev와 npm test를 실행해줘.
실패 로그를 분석해서 원인을 설명하고,
최소 변경으로 수정한 뒤 다시 테스트를 통과시켜줘.
```

---

### 4.9 MCP Inspector 검증

**주 도구:** Codex CLI

MCP Inspector로 실제 MCP client 관점에서 tool을 검증합니다.

예시 명령:

```bash
npx @modelcontextprotocol/inspector npx tsx src/server.ts
```

빌드 후 실행:

```bash
npm run build
npx @modelcontextprotocol/inspector node dist/server.js
```

Inspector에서 확인할 것:

```text
- tools 목록이 보이는가?
- tool description이 명확한가?
- input schema가 의도대로 보이는가?
- 정상 호출이 성공하는가?
- 잘못된 입력에서 에러가 친절한가?
- 응답이 카카오톡 메시지로 읽기 좋은가?
```

완료 기준:

```text
- 모든 MVP tool이 Inspector에서 호출 가능
- 정상 입력 성공
- 잘못된 입력 실패 처리 확인
- 응답 포맷 확인
```

---

### 4.10 코드 리뷰 / 리팩토링

**주 도구:** VS Code Codex 확장  
**보조 도구:** Codex 앱

테스트가 통과된 뒤 코드 품질을 정리합니다.

VS Code 확장에 줄 수 있는 프롬프트:

```text
현재 src/tools, src/services, src/schemas 폴더의 코드를 리뷰해줘.
중복 로직, 모호한 타입, 과도하게 긴 함수, 에러 처리 누락을 찾아서
출품용 코드 품질 기준에 맞게 개선안을 제안해줘.

수정 시 다음 기준을 지켜줘:
- tool별 책임 분리
- schema와 service 로직 분리
- 사용자에게 노출되는 에러 메시지 정리
- 민감정보가 로그나 응답에 노출되지 않도록 처리
- 기존 테스트가 깨지지 않도록 최소 변경
```

확인할 것:

```text
- tool별 책임이 분리되어 있는가?
- services와 tools가 섞이지 않았는가?
- schema가 재사용 가능한가?
- 에러 메시지가 사용자 친화적인가?
- 테스트가 핵심 시나리오를 커버하는가?
```

---

### 4.11 문서화 / 제출 자료 작성

**주 도구:** Codex 앱  
**보조 도구:** VS Code Codex 확장

출품에서는 README와 데모 시나리오가 중요합니다.

필수 문서:

```text
README.md
docs/tool-spec.md
docs/mcp-architecture.md
docs/demo-scenario.md
docs/playmcp-submit.md
.env.example
```

README 구성:

```text
# 서비스명

## 한 줄 소개
## 해결하는 문제
## 주요 사용 시나리오
## 제공 MCP tools
## 설치 방법
## 환경변수
## 로컬 실행 방법
## MCP Inspector 테스트 방법
## 예시 입력/출력
## 예외 처리
## 보안 고려사항
## Agentic Player 10 제출용 설명
```

Codex 앱에 줄 수 있는 프롬프트:

```text
이 MCP 서버를 Agentic Player 10에 제출한다고 가정하고
README, demo-scenario.md, playmcp-submit.md를 심사자가 이해하기 쉽게 다듬어줘.

특히 다음을 반영해줘:
- 카카오톡 사용자가 실제로 쓰는 장면
- 핵심 사용자 문제
- 제공하는 MCP tools
- 데모 시나리오
- 설치 및 실행 방법
- MCP Inspector 테스트 방법
- 보안/개인정보 주의사항
```

완료 기준:

```text
- README만 보고 로컬 실행 가능
- tool-spec와 실제 구현이 일치
- demo-scenario가 1분 안에 이해 가능
- 제출용 설명 문구 완성
```

---

### 4.12 배포 / Endpoint 준비

**주 도구:** Codex CLI  
**보조 도구:** VS Code Codex 확장

배포 전에는 로컬 실행이 아닌 재현 가능한 실행 방식이 필요합니다.

배포 전 준비:

```text
- npm run build 성공
- npm test 성공
- .env.example 최신화
- README 실행 방법 검증
- 서버 시작 명령 확정
- Endpoint에서 접근 가능한 형태로 구성
```

package.json scripts 예시:

```json
{
  "scripts": {
    "dev": "tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "inspect": "npx @modelcontextprotocol/inspector npx tsx src/server.ts"
  }
}
```

Codex CLI에 줄 수 있는 프롬프트:

```text
배포 전 점검을 해줘.

확인할 것:
1. npm run build 통과
2. npm test 통과
3. .env.example과 실제 환경변수 사용처 일치
4. README의 실행 명령과 package.json scripts 일치
5. 서버 시작 명령이 배포 환경에서도 동작 가능한지 확인
6. 민감정보가 코드, 로그, README에 노출되어 있지 않은지 확인

문제가 있으면 최소 변경으로 수정해줘.
```

완료 기준:

```text
- build/test 통과
- 배포 환경변수 정리
- start 명령 확정
- Endpoint 등록 준비 완료
```

---

### 4.13 PlayMCP 등록

**주 도구:** 브라우저  
**보조 도구:** Codex 앱

등록 단계에서는 기술 구현보다 설명의 명확성이 중요합니다.

준비할 내용:

```text
- 서비스명
- 한 줄 소개
- 상세 설명
- MCP 서버 Endpoint
- 주요 tool 목록
- 사용 예시
- 데모 시나리오
- GitHub 또는 문서 링크
```

Codex 앱에 줄 수 있는 프롬프트:

```text
PlayMCP 등록 페이지에 넣을 소개 문구를 작성해줘.

포함할 내용:
- 서비스명
- 한 줄 소개
- 상세 설명
- 주요 기능
- 사용 예시
- 핵심 차별점
- 카카오톡 사용자가 얻는 가치

문체는 명확하고 과장 없이 매력적으로 작성해줘.
```

완료 기준:

```text
- 등록 정보 작성 완료
- Endpoint 입력 완료
- 사용 예시 작성 완료
- 제출 전 미리보기 확인
```

---

### 4.14 제출 전 최종 QA

**주 도구:** Codex CLI, VS Code Codex 확장, Codex 앱

마지막 단계에서는 세 도구를 모두 사용합니다.

도구별 확인 항목:

```text
Codex CLI:
- build/test/inspect 최종 통과 확인
- 배포 환경에서 서버 실행 확인
- Endpoint 응답 확인

VS Code Codex 확장:
- 코드 품질 최종 리뷰
- tool description/schema 최종 점검
- 민감정보 노출 여부 확인

Codex 앱:
- 제출 문구 검토
- README 검토
- 데모 시나리오 점검
- 심사자 관점 예상 질문 정리
```

최종 체크리스트:

```text
- 처음 보는 사람이 README만 보고 실행할 수 있는가?
- PlayMCP 등록 설명만 보고 서비스 가치가 이해되는가?
- tool 이름과 설명이 명확한가?
- 잘못된 입력에서도 서버가 죽지 않는가?
- 카카오톡에서 보기 좋은 응답 길이인가?
- API key, 토큰, 개인정보가 노출되지 않는가?
- 본선 사용자 투표를 고려한 데모 시나리오가 있는가?
```

---

## 5. 작업 비율 가이드

추천 작업 비율:

```text
Codex CLI: 50%
VS Code Codex 확장: 30%
Codex 앱: 20%
```

작업별 추천 도구:

| 작업 | 추천 도구 |
|---|---|
| 아이디어 정리 | ChatGPT 앱, Codex 앱 |
| PRD 작성 | ChatGPT 앱, Codex 앱 |
| repo 생성 | Codex CLI |
| 서버 스캐폴딩 | Codex CLI |
| tool schema 편집 | VS Code Codex 확장 |
| tool 구현 | VS Code Codex 확장 + Codex CLI |
| 서버 실행 | Codex CLI |
| 테스트 실행 | Codex CLI |
| 에러 로그 수정 | Codex CLI |
| 코드 리팩토링 | VS Code Codex 확장 |
| README 작성 | Codex 앱 |
| 제출 문구 작성 | Codex 앱 |
| 배포 점검 | Codex CLI |
| 최종 리뷰 | 세 도구 모두 |

---

## 6. Git 운영 방식

권장 브랜치 전략:

```text
main             = 안정 버전
dev              = 개발 통합 브랜치
feature/*        = 기능별 실험
docs/*           = 문서 작업
fix/*            = 버그 수정
```

권장 commit 단위:

```text
- tool 하나 구현
- schema 하나 추가
- 테스트 케이스 추가
- 문서 하나 완성
- 배포 설정 수정
```

예시 commit message:

```text
docs: add MCP tool specification
feat: implement health check tool
feat: implement recommendation tool
test: add error case tests for tools
fix: handle missing environment variables
docs: update PlayMCP submission guide
```

---

## 7. 구현 전 체크리스트

`tool-spec.md`가 확정되기 전에는 구현을 시작하지 않습니다.

```text
- [ ] PRD가 docs/prd.md에 저장되어 있다.
- [ ] 핵심 사용자 문제가 명확하다.
- [ ] MVP 범위가 정해져 있다.
- [ ] 핵심 tool 2~4개가 선정되어 있다.
- [ ] health_check는 상태 확인용으로 분리되어 있다.
- [ ] 각 tool의 input/output이 정의되어 있다.
- [ ] 각 tool의 error cases가 정의되어 있다.
- [ ] tool-spec.md와 PRD가 서로 일치한다.
```

---

## 8. 구현 후 체크리스트

```text
- [ ] npm run build가 통과한다.
- [ ] npm test가 통과한다.
- [ ] MCP Inspector에서 tools 목록이 보인다.
- [ ] 모든 MVP tool이 정상 호출된다.
- [ ] 잘못된 입력에서 서버가 죽지 않는다.
- [ ] 외부 API 실패 시 안전한 에러 메시지를 반환한다.
- [ ] 로그에 민감정보가 찍히지 않는다.
- [ ] README 실행 방법이 실제로 동작한다.
- [ ] .env.example이 최신 상태다.
- [ ] PlayMCP 제출용 설명이 준비되어 있다.
```

---

## 9. 자주 쓰는 Codex 프롬프트 모음

### 9.1 PRD 기반 tool 설계

```text
docs/prd.md를 읽고 이 MCP 서버의 핵심 사용자 기능을 tool 2~4개로 설계해줘.
각 tool마다 Purpose, When to use, Input, Output, Success example,
Error cases, Notes, Implementation priority를 docs/tool-spec.md에 작성해줘.
아직 src 코드는 수정하지 마.
```

### 9.2 tool-spec 기반 구현

```text
docs/tool-spec.md를 기준으로 다음 MVP tool을 구현해줘.
src/tools, src/schemas, src/services, tests에 필요한 파일을 추가하고,
MCP content 배열 응답 형식을 지켜줘.
마지막에 npm run build와 npm test를 실행해서 통과시켜줘.
```

### 9.3 에러 로그 기반 수정

```text
아래 실행 로그를 분석해서 원인을 설명하고,
최소 변경으로 수정해줘.
수정 후 npm run build와 npm test를 다시 실행해줘.
```

### 9.4 코드 리뷰

```text
src/tools, src/services, src/schemas 폴더를 리뷰해줘.
중복 로직, 타입 불명확성, 에러 처리 누락, 민감정보 노출 가능성을 찾아줘.
기존 테스트가 깨지지 않도록 최소 변경으로 개선해줘.
```

### 9.5 문서화

```text
현재 구현된 MCP tools와 docs/tool-spec.md를 기준으로 README를 업데이트해줘.
설치 방법, 환경변수, 실행 방법, MCP Inspector 테스트 방법,
tool 목록, 예시 입력/출력, 보안 주의사항을 포함해줘.
```

### 9.6 배포 전 점검

```text
배포 전 최종 점검을 해줘.
npm run build, npm test를 실행하고,
.env.example, README, package.json scripts, 서버 시작 명령이 서로 일치하는지 확인해줘.
민감정보가 노출되어 있으면 수정해줘.
```

---

## 10. 최종 요약

이 프로젝트의 권장 흐름은 다음과 같습니다.

```text
1. ChatGPT/Codex 앱에서 아이디어와 PRD 정리
2. PRD를 docs/prd.md로 repo에 저장
3. Codex CLI로 프로젝트 구조 세팅
4. VS Code Codex 확장으로 tool-spec.md 작성
5. Codex CLI로 MCP 서버 구현
6. MCP Inspector로 tool 검증
7. VS Code 확장으로 코드 리뷰/리팩토링
8. Codex 앱으로 README와 제출 문서 정리
9. Codex CLI로 build/test/deploy 점검
10. PlayMCP 등록 및 제출
```

가장 중요한 기준:

```text
tool을 많이 만들기보다,
핵심 tool 2~3개를 안정적으로 동작하게 만든다.
```

그리고 최종 판단 기준:

```text
README만 보고 실행 가능한가?
Inspector에서 정상 호출되는가?
카카오톡 사용자에게 가치가 바로 이해되는가?
```
