# AI OA Practice - Production Project Plan

## 1) Product Vision

AI OA Practice is a free, open-source technical interview simulation platform combining:
- coding practice (LeetCode/Codeforces style)
- AI interview simulation
- system design whiteboard practice
- analytics and performance tracking

Primary outcomes:
- Improve interview readiness through realistic timed practice.
- Provide actionable AI feedback for coding and system design.
- Measure growth via score history, topic-level strengths, and session analytics.

## 2) Target Architecture

Monorepo structure:

```
coding_AI_web/
  frontend/
    react-app/
  backend/
    node-server/
  docs/
  infra/
```

High-level components:
- Frontend (React + TypeScript + Tailwind + Zustand + Monaco)
- Backend API (Node.js + Express + Socket.io)
- Data layer (MongoDB Atlas)
- AI layer (Gemini API)
- Code execution layer (Judge0 API)
- Observability and security middleware

## 3) Feature-to-Service Mapping

1. AI Coding Interviewer
- Service: `backend/node-server/src/services/ai/interviewer.service.ts`
- Uses Gemini prompts and conversation memory per session.

2. AI Generated Coding Questions
- Service: `aiQuestion.service.ts`
- Stores generated questions in MongoDB with hidden test cases.

3. Code Editor + Compiler
- Frontend: Monaco editor module
- Backend: Judge0 adapter service

4. Test Case Engine
- Visible + hidden test validation, scoring breakdown.

5. AI Code Mentor
- Gemini-based static review after submission.

6. System Design Practice
- Question bank + session mode.

7. System Design Drawboard
- Canvas with shape primitives, connectors, labels, pan/zoom.

8. AI System Design Evaluation
- Gemini scoring and structured feedback.

9. Cheating Detection
- Event telemetry + heuristics + flagging pipeline.

10. Practice Session Scoring
- Weighted aggregate score computation.

11. Analytics Dashboard
- User-level and aggregate performance visualization.

## 4) Backend Design

### 4.1 Core Modules

- `src/routes/`
  - `auth.routes.ts`
  - `question.routes.ts`
  - `submission.routes.ts`
  - `design.routes.ts`
  - `analytics.routes.ts`
  - `session.routes.ts`

- `src/controllers/`
  - Request parsing, response shaping, error handling boundaries.

- `src/services/`
  - `ai/` Gemini prompts + response parsing
  - `compiler/` Judge0 submit/poll pipeline
  - `cheating/` signal processor and risk scoring
  - `scoring/` session score computation

- `src/models/` (Mongoose)
  - `User`, `Session`, `Question`, `Submission`, `DesignSubmission`, `CheatingEvent`

- `src/middlewares/`
  - JWT auth
  - rate limiting
  - request validation (zod or joi)
  - role guards

- `src/socket/`
  - interview room events
  - live timer events
  - interviewer question/answer events

### 4.2 Required APIs

- `POST /api/generate-question`
- `POST /api/submit-code`
- `POST /api/evaluate-design`
- `POST /api/detect-cheating`
- `POST /api/generate-feedback`
- `GET /api/session-score`
- `GET /api/analytics`

Plus foundational endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `POST /api/sessions/start`
- `POST /api/sessions/end`

### 4.3 Execution Flow (submit-code)

1. Validate JWT + input.
2. Load question and hidden tests.
3. Submit source code to Judge0.
4. Poll until completed.
5. Compare outputs across visible + hidden tests.
6. Compute correctness + efficiency metrics.
7. Request AI feedback summary from Gemini.
8. Persist submission + score breakdown.
9. Return execution details + feedback.

## 5) Frontend Design

### 5.1 App Areas

- Auth pages
- Problem list and details
- Interview simulation room
- Coding workspace (Monaco + test panel)
- System design workspace (drawboard + prompt panel)
- Analytics dashboard
- User profile/history

### 5.2 State Management (Zustand)

Stores:
- `authStore`
- `sessionStore`
- `editorStore`
- `interviewStore`
- `analyticsStore`
- `designStore`

### 5.3 Core Frontend Components

- `components/editor/MonacoEditorPanel.tsx`
- `components/editor/RunResultPanel.tsx`
- `components/interview/InterviewerChat.tsx`
- `components/design/DrawboardCanvas.tsx`
- `components/design/Toolbox.tsx`
- `components/dashboard/ScoreChart.tsx`
- `components/dashboard/TopicHeatmap.tsx`

## 6) MongoDB Data Model (Mongoose)

### 6.1 Collections

1. Users
- `_id`
- `name`
- `email` (unique)
- `passwordHash`
- `rating`
- `createdAt`, `updatedAt`

2. Sessions
- `_id`
- `userId`
- `type` (`coding`, `oa`, `system_design`, `mixed`)
- `startTime`
- `endTime`
- `scoreBreakdown`
- `overallScore`

3. Questions
- `_id`
- `title`
- `difficulty`
- `tags[]`
- `description`
- `constraints`
- `samples[]`
- `visibleTests[]`
- `hiddenTests[]`
- `source` (`curated`, `ai_generated`)

4. Submissions
- `_id`
- `sessionId`
- `questionId`
- `code`
- `language`
- `passedTests`
- `totalTests`
- `executionTimeMs`
- `memoryKb`
- `aiFeedback`
- `createdAt`

5. DesignSubmissions
- `_id`
- `sessionId`
- `questionTitle`
- `diagramJson`
- `architectureText`
- `evaluation`
- `score`

6. CheatingEvents
- `_id`
- `sessionId`
- `userId`
- `signalType`
- `metadata`
- `riskScore`
- `timestamp`

### 6.2 Indexing Plan

- `Users.email` unique index
- `Sessions.userId + startTime` compound index
- `Submissions.sessionId + createdAt` compound index
- `Questions.tags + difficulty` index for filtering
- `CheatingEvents.sessionId + timestamp` index

## 7) Scoring Specification

Overall score:

`overall = correctness*0.40 + efficiency*0.20 + codeQuality*0.20 + designQuality*0.20`

Where each component is normalized to 0-100.

Implementation rules:
- Correctness from hidden+visible pass ratio.
- Efficiency from runtime/memory percentile vs benchmark.
- Code quality from AI rubric + lint metrics.
- Design quality from AI architecture rubric.

## 8) Security and Abuse Controls

- JWT auth with short-lived access token + refresh token option
- `helmet`, `cors`, `express-rate-limit`
- strict DTO validation (zod)
- sanitize prompt/context before sending to AI
- do not expose hidden test cases to frontend
- per-user request throttles on AI and submission endpoints
- suspicious behavior logging with admin review trail

## 9) Real-time Design (Socket.io)

Primary channels:
- `session:tick`
- `interview:message`
- `interview:hint`
- `design:autosave`
- `proctoring:event`

Rules:
- Authenticate socket handshake with JWT.
- Namespace by feature (`/interview`, `/design`).
- Persist critical events asynchronously.

## 10) Delivery Phases (Execution Roadmap)

### Phase 0: Foundation (Day 1-2)
- Monorepo scaffold
- lint/format/test configs
- env management
- CI baseline

### Phase 1: Auth + Core Data (Day 3-5)
- JWT auth APIs
- Mongo models + migrations/seeding
- user/session lifecycle

### Phase 2: Coding Workflow MVP (Day 6-10)
- problem browsing
- Monaco editor
- Judge0 integration
- submission persistence

### Phase 3: AI Layer MVP (Day 11-14)
- Gemini question generation
- AI interviewer conversation flow
- AI code mentor feedback

### Phase 4: System Design Module (Day 15-19)
- drawboard primitives
- design session flow
- AI design evaluation

### Phase 5: Anti-Cheat + Scoring (Day 20-22)
- client signal capture
- cheating detector APIs
- weighted session scoring

### Phase 6: Analytics + Polish (Day 23-26)
- dashboard charts
- history views
- performance optimizations

### Phase 7: Productionization (Day 27-30)
- deployment configs
- monitoring/logging
- docs + OSS readiness

## 11) DevOps and Free Deployment Plan

- Frontend: Vercel
- Backend: Render or Railway
- DB: MongoDB Atlas (free tier)
- Secrets: platform environment variables
- Optional uptime monitor: free cron ping service

Environment variables (initial):
- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `GEMINI_API_KEY`
- `JUDGE0_API_URL`
- `JUDGE0_API_KEY`
- `FRONTEND_URL`

## 12) Testing Strategy

- Backend unit tests for services and scoring formulas
- API integration tests for submission and analytics flows
- Frontend component tests for editor and dashboard widgets
- End-to-end smoke tests for login -> solve -> score -> analytics

## 13) Open Source Readiness

Must-have files:
- `README.md`
- `LICENSE` (MIT)
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- issue templates + PR template

Contribution standards:
- semantic commits
- branch naming convention
- mandatory lint/test pass in CI

## 14) Immediate Next Step

Implement Phase 0 by scaffolding:
1. `frontend/react-app` with Vite React TypeScript + Tailwind
2. `backend/node-server` with Express TypeScript baseline
3. shared docs, env templates, and root scripts
