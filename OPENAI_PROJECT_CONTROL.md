# OpenAI Project Control

- Repository: `8friend8ship-cloud/-`
- Actual package: `clipstream-ai-pipeline`
- Project role: **롱폼 원본을 장면·클립·쇼츠 작업값으로 변환하는 AI 파이프라인**
- Management status: `ACTIVE_PIPELINE`
- Last reviewed: `2026-07-30 KST`

## 1. 활용 방향

이 저장소는 DRYWRITE에서 완성한 롱폼 마스터를 받아 영상 제작용 구조로 나누는 중간 파이프라인으로 사용한다. 글 원문을 다시 창작하기보다 장면 분할, 클립 후보, 자막/후킹 문구, 플랫폼별 길이와 작업 지시를 만든다.

## 2. 상호 연계

- 상위: `DRYWRITE`, `CONTENT_FACTORY`
- 분석 입력: `Analyzer-12.09`
- 미디어 출력: `animation`
- 후속 편집: NotebookLM/Flow 작업큐
- 최종 송출: 플랫폼 발행 에이전트

## 3. Drive 연계 정책

실제 Drive URL·ID는 저장소에 넣지 않는다.

- `MASTER_REGISTRY`
- `CONTENT_FACTORY`
- `FLOW_TASK_QUEUE`
- `NOTEBOOKLM_TASK_QUEUE`
- `MEDIA_OUTPUT`
- `PUBLISH_AGENT`

## 4. 파일 꼬리표

- `[PIPELINE]`: 단계 흐름·작업큐
- `[PROMPT]`: 장면/클립/쇼츠 지시
- `[FRONTEND]`: 입력·미리보기·상태 화면
- `[AI]`: Gemini 호출
- `[MEDIA]`: 장면·자막·클립 데이터
- `[DRIVE]`: 원문·결과·작업큐 연결
- `[INTEGRATION]`: DRYWRITE/animation/플랫폼 연결
- `[SECRET]`: API 키 점검
- `[DEPLOY]`: Vite/Vercel
- `[REVIEW]`: 출력 규격 추가 확인

## 5. 초기 파일 대장

| 파일/영역 | 태그 | 활용 방향 | 상태 | 다음 점검 |
|---|---|---|---|---|
| `package.json` | `[DEPLOY] [AI]` | Vite·React·Gemini 실행 환경 | 확인됨 | 빌드 및 SDK 버전 확인 |
| `App.tsx` | `[FRONTEND] [PIPELINE]` | 원문 입력과 파이프라인 실행 | 검토 예정 | 롱폼 기준본 보존 여부 확인 |
| 프롬프트/파이프라인 로직 | `[PROMPT] [PIPELINE]` | 장면·쇼츠·자막 작업값 생성 | 검토 예정 | 재창작 금지, 결정형 변환 원칙 확인 |
| 출력/내보내기 | `[MEDIA] [DRIVE]` | animation·Flow·NotebookLM 전달 | 검토 예정 | JSON 스키마와 파일명 규칙 확정 |
| 환경 설정 | `[SECRET]` | Gemini 키 및 실행값 | 우선 검토 | 클라이언트 키 노출 제거 |

## 6. 수정 진행 규칙

1. DRYWRITE 원문을 기준본으로 보존한다.
2. 이 앱은 재창작보다 분할·요약·작업지시 생성에 집중한다.
3. Flow 작업이 NotebookLM 작업보다 먼저 오도록 큐 순서를 유지한다.
4. 결과는 `CONTENT_ID`와 장면/클립 ID로 추적한다.
5. 코드 변경은 작업 브랜치와 Draft PR로 진행한다.
6. Drive 연결은 별칭을 중앙 운영대장에 먼저 등록한다.

## 7. 결정 기록

- `2026-07-30`: 이름이 `-`인 저장소를 ClipStream AI 파이프라인으로 식별하고 관리 체계에 편입함.
