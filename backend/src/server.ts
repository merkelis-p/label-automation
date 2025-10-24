import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { config } from './config/index.js';
import webhookRoutes from './routes/webhooks.routes.js';
import apiRoutes from './routes/api.routes.js';
import testRoutes from './routes/test.routes.js';
import mockRoutes from './routes/mock.routes.js';
import { initializeWebSocket } from './websocket.js';
import { getPrinterStatus as checkPrintNodeStatus } from './services/printnode.service.js';
import { store } from './store.js';
import { broadcastUpdate } from './websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Initialize WebSocket
initializeWebSocket(server);

// CORS
app.use(cors());

// Raw body capture for HMAC verification
app.use((req: Request, _res: Response, next: NextFunction) => {
  const chunks: Buffer[] = [];
  req.on('data', (chunk: Buffer) => chunks.push(chunk));
  req.on('end', () => {
    (req as any).rawBody = Buffer.concat(chunks);
    try {
      const ct = req.headers['content-type'] || '';
      if (ct.includes('json') && (req as any).rawBody.length) {
        req.body = JSON.parse((req as any).rawBody.toString('utf8'));
      } else {
        req.body = {};
      }
    } catch {
      req.body = {};
    }
    next();
  });
});

// Routes
app.use('/webhooks', webhookRoutes);
app.use('/api', apiRoutes);
app.use('/api/test', testRoutes);
app.use('/mock', mockRoutes);

// Serve frontend in production
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// 404 fallback
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

server.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📊 Dashboard: http://localhost:${config.port}`);
  console.log(`🔌 WebSocket: ws://localhost:${config.port}/ws`);
  // Start a background poller to check PrintNode printer status periodically
  (async function startPrinterPoller() {
    const pollIntervalMs = 30_000; // 30 seconds

    async function pollOnce() {
      try {
        const status = await checkPrintNodeStatus();
        const printerStatus = {
          printerId: String(config.printnode.printerId || ''),
          name: `PrintNode:${config.printnode.printerId}`,
          status: status.online ? 'online' : 'offline',
          lastCheck: new Date().toISOString(),
          queueLength: status.queueLength ?? 0,
        } as any;

        store.updatePrinterStatus(printerStatus);
        broadcastUpdate('printer_status', printerStatus);
      } catch (err) {
        // On errors, set offline but keep polling
        const printerStatus = {
          printerId: String(config.printnode.printerId || ''),
          name: `PrintNode:${config.printnode.printerId}`,
          status: 'offline',
          lastCheck: new Date().toISOString(),
          queueLength: 0,
        } as any;
        store.updatePrinterStatus(printerStatus);
        broadcastUpdate('printer_status', printerStatus);
      }
    }

    // Initial poll
    await pollOnce();
    // Schedule repeating polls
    setInterval(pollOnce, pollIntervalMs);
  })();
});
