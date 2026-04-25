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

## Core Endpoints (Planned)

These routes are scaffolded and currently return `501 Not Implemented` until feature implementation.

### `POST /generate-question`
Generate AI coding questions with title, difficulty, tags, constraints, and hidden test cases.

### `POST /submit-code`
Submit source code and language, execute via Judge0, and evaluate against tests.

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
