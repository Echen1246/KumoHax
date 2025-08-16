import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);

const PORT = Number(process.env.PORT || 4000);
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'middleware', version: '0.1.0', backend: BACKEND_URL });
});

app.use(
  '/api',
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    ws: true,
    // keep path as-is (/api -> /api)
  })
);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[middleware] listening on http://localhost:${PORT} -> proxy ${BACKEND_URL}`);
}); 