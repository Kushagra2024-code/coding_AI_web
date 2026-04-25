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

## Core Endpoints (Planned)

These routes are scaffolded and currently return `501 Not Implemented` until feature implementation.

### `POST /generate-question`
Generate AI coding questions with title, difficulty, tags, constraints, and hidden test cases.

### `POST /evaluate-design`
Evaluate system design diagram and architecture text using Gemini.

### `POST /detect-cheating`
Analyze proctoring signals and return suspiciousness flags.

### `POST /generate-feedback`
Generate AI code mentor feedback on complexity, readability, and edge cases.

### `GET /session-score`
Get weighted score for a practice session.

### `GET /analytics`
Return aggregated analytics: accuracy, solve time, topic trends, and progression.
