import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);

const PORT = Number(process.env.PORT || 3001);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend', version: '0.1.0' });
});

app.get('/api/patients', (_req, res) => {
  res.json([
    { id: 'P-1001', age: 72, sex: 'F', race: 'White', risks: ['A', 'B'], riskScore: 0.84 },
    { id: 'P-1002', age: 28, sex: 'M', race: 'Asian', risks: ['A', 'C'], riskScore: 0.33 },
    { id: 'P-1003', age: 55, sex: 'M', race: 'Black', risks: ['B', 'C'], riskScore: 0.58 },
  ]);
});

app.get('/api/alerts', (_req, res) => {
  res.json([
    { id: nanoid(), patientId: 'P-1001', severity: 'high', message: 'Possible adverse reaction', createdAt: new Date().toISOString() },
    { id: nanoid(), patientId: 'P-1002', severity: 'low', message: 'Mild symptom reported', createdAt: new Date().toISOString() },
  ]);
});

app.get('/api/events/alerts', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = (data: unknown) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const interval = setInterval(() => {
    send({
      id: nanoid(),
      patientId: 'P-' + Math.floor(1000 + Math.random() * 1000),
      severity: (['low', 'medium', 'high'] as const)[Math.floor(Math.random() * 3)],
      message: 'Synthetic alert event',
      createdAt: new Date().toISOString(),
    });
  }, 5000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[backend] listening on http://localhost:${PORT}`);
}); 