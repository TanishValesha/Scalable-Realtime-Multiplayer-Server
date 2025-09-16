import { WebSocketServer, WebSocket } from "ws";
import { Logger } from "../utils/logger.js";
import { v4 as uuidv4 } from "uuid";
export class WebSocketService {
    constructor(port) {
        this.clients = new Map();
        this.wss = new WebSocketServer({ port });
        this.initialize();
        Logger.info(`WebSocket Server created, listening on port ${port}`);
    }
    initialize() {
        this.wss.on('connection', (socket) => {
            const clientId = uuidv4();
            const client = { id: clientId, socket };
            this.clients.set(clientId, client);
            Logger.info(`Client connected: ${clientId}`);
            socket.on("message", (data) => {
                this.handleMessage(clientId, data);
                this.broadcast(data);
            });
            socket.on("close", () => this.handleDisconnect(clientId));
        });
    }
    handleMessage(clientId, data) {
        try {
            const message = JSON.parse(data);
            Logger.info(`Received from ${clientId}: ${data}`);
            this.clients.get(clientId)?.socket.send(JSON.stringify({ type: "echo", payload: message }));
        }
        catch (error) {
            Logger.error(`Invalid message from ${clientId}: ${data}`);
        }
    }
    broadcast(data) {
        this.clients.forEach((client) => {
            if (client.socket.readyState === WebSocket.OPEN) {
                client.socket.send(JSON.stringify({ type: "server", payload: JSON.parse(data) }));
            }
        });
        Logger.info(`Broadcast to ${this.clients.size} clients: ${data}`);
    }
    handleDisconnect(clientId) {
        this.clients.delete(clientId);
        Logger.info(`Client disconnected: ${clientId}`);
    }
}
//# sourceMappingURL=WebSocketService.js.map