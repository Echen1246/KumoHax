# KumoHax Admin Frontend

A Vite + React + TypeScript admin dashboard for adverse event monitoring and risk prediction.

## Getting Started

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Run the dev server:

```bash
npm run dev
```

The app runs at http://localhost:5173

## Environment Variables

- `VITE_API_BASE_URL`: Base URL of your backend (e.g. Railway) like `https://api.example.com/api`. If omitted, the app uses `/api` and, in dev, relies on the Vite proxy below.
- `VITE_DEV_PROXY_TARGET`: When developing locally, set this to your backend dev server (e.g. `http://localhost:3000`) so that requests to `/api` are proxied and CORS is avoided.

## Realtime Alerts

The dashboard subscribes to Server-Sent Events from `${VITE_API_BASE_URL}/events/alerts`. You can also implement WebSockets; the code is structured to swap transports easily.

## Recommended Architecture

- Frontend calls your backend only. Do not connect the frontend directly to the database.
- Consider a lightweight Backend-for-Frontend (BFF) or API Gateway for:
  - auth/session management
  - request validation, rate limiting, audit logging
  - aggregation/fan-out to services and realtime streaming (SSE/WebSockets)

If your Railway backend is already the API for the web, it can serve as the BFF. 