import 'dotenv/config';
import express from 'express';
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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = createServer(app);
// Initialize WebSocket
initializeWebSocket(server);
// CORS
app.use(cors());
// Raw body capture for HMAC verification
app.use((req, _res, next) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
        req.rawBody = Buffer.concat(chunks);
        try {
            const ct = req.headers['content-type'] || '';
            if (ct.includes('json') && req.rawBody.length) {
                req.body = JSON.parse(req.rawBody.toString('utf8'));
            }
            else {
                req.body = {};
            }
        }
        catch {
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
app.get('/', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
});
// 404 fallback
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});
server.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
    console.log(`📊 Dashboard: http://localhost:${config.port}`);
    console.log(`🔌 WebSocket: ws://localhost:${config.port}/ws`);
});
//# sourceMappingURL=server.js.map