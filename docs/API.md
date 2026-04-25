# API Reference (Scaffold)

Base URL: `/api`

## Health

### `GET /health`
Returns service health metadata.

Example response:

```json
{
  "status": "ok",
  "service": "ai-oa-practice-backend",
  "timestamp": "2026-04-25T00:00:00.000Z"
}
```

## Auth Endpoints

### `POST /auth/register`
Creates a user account and returns a JWT access token.

Request body:

```json
{
  "name": "Kushagra",
  "email": "kushagra@example.com",
  "password": "StrongPass123"
}
```

### `POST /auth/login`
Authenticates a user and returns a JWT access token.

Request body:

```json
{
  "email": "kushagra@example.com",
  "password": "StrongPass123"
}
```

### `GET /me`
Returns current user profile.

Auth header:

`Authorization: Bearer <token>`

## Session Endpoints

### `POST /sessions/start`
Starts a practice session.

Request body:

```json
{
  "type": "coding"
}
```

### `POST /sessions/end`
Ends a practice session and optionally stores score breakdown.

Request body:

```json
{
  "sessionId": "6623c0000000000000000000",
  "scoreBreakdown": {
    "correctness": 80,
    "efficiency": 70,
    "codeQuality": 75,
    "designQuality": 60
  },
  "overallScore": 72
}
```

## Coding Endpoints (Phase 2)

### `GET /questions`
Returns coding question list for the authenticated user.

### `GET /questions/:questionId`
Returns a question detail payload with visible tests.

### `POST /submit-code`
Executes code with Judge0 and evaluates against visible + hidden tests.

Request body:

```json
{
  "questionId": "fallback-two-sum",
  "language": "cpp",
  "code": "#include <bits/stdc++.h>\nusing namespace std;\nint main(){return 0;}"
}
```

Auth header:

`Authorization: Bearer <token>`

## AI Endpoints (Phase 3)

### `POST /generate-question`
Generates a new AI coding question and returns it.

Request body:

```json
{
  "difficulty": "medium",
  "tags": ["array", "two-pointers"]
}
```

### `POST /generate-feedback`
Returns AI mentor feedback for a submission.

Request body:

```json
{
  "problemTitle": "Two Sum",
  "code": "def solve():\n    pass",
  "language": "python",
  "correctnessScore": 70,
  "efficiencyScore": 80
}
```

### `POST /interview/message`
Simulates interviewer dialogue with follow-up probing.

Request body:

```json
{
  "problemTitle": "Two Sum",
  "problemSummary": "Find two indices adding to target.",
  "candidateMessage": "I plan to use a hash map for O(n) lookup."
}
```

## System Design Endpoints (Phase 4)

### `GET /design/questions`
Returns curated system design practice prompts.

### `POST /evaluate-design`
Evaluates architecture description and drawboard JSON using Gemini.

Request body:

```json
{
  "questionTitle": "Design Twitter",
  "architectureText": "I will use fanout-on-write for active users and fanout-on-read for long tail.",
  "diagram": {
    "nodes": [
      { "id": "n1", "type": "rectangle", "x": 40, "y": 40, "width": 150, "height": 70, "label": "API Gateway" },
      { "id": "n2", "type": "database", "x": 260, "y": 40, "width": 150, "height": 70, "label": "Feed Store" }
    ],
    "edges": [
      { "id": "e1", "from": "n1", "to": "n2", "label": "writes" }
    ]
  }
}
```

## Core Endpoints (Planned)

These routes are scaffolded and currently return `501 Not Implemented` until feature implementation.

### `POST /evaluate-design`
Evaluate system design diagram and architecture text using Gemini.

### `POST /detect-cheating`
Analyze proctoring signals and return suspiciousness flags.

### `GET /session-score`
Get weighted score for a practice session.

### `GET /analytics`
Return aggregated analytics: accuracy, solve time, topic trends, and progression.
