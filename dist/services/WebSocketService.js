import { WebSocketServer } from "ws";
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
            socket.on("message", (data) => this.handleMessage(clientId, data));
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
    handleDisconnect(clientId) {
        this.clients.delete(clientId);
        Logger.info(`Client disconnected: ${clientId}`);
    }
}
//# sourceMappingURL=WebSocketService.js.map