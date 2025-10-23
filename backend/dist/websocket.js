import { WebSocketServer, WebSocket } from 'ws';
let wss = null;
export function initializeWebSocket(server) {
    wss = new WebSocketServer({ server, path: '/ws' });
    wss.on('connection', (ws) => {
        console.log('WebSocket client connected');
        ws.on('close', () => {
            console.log('WebSocket client disconnected');
        });
    });
}
export function broadcastUpdate(type, data) {
    if (!wss)
        return;
    const message = JSON.stringify({ type, data });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}
//# sourceMappingURL=websocket.js.map