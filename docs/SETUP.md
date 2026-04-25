# Local Development Setup

## Prerequisites

- Node.js `>= 20.18.1`
- npm `>= 9`

## Install Dependencies

```bash
npm --prefix frontend/react-app install
npm --prefix backend/node-server install
```

## Configure Environment

```bash
cp backend/node-server/.env.example backend/node-server/.env
cp frontend/react-app/.env.example frontend/react-app/.env
```

Update secrets and API URLs before running.

## Run in Development

Terminal 1:

```bash
npm run dev:backend
```

Terminal 2:

```bash
npm run dev:frontend
```

## Build for Production

```bash
npm run build
```
