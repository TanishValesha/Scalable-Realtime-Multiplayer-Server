import { WebSocketServer, WebSocket } from "ws";
import { Logger } from "../utils/logger.js";
import { v4 as uuidv4 } from "uuid";
export class WebSocketService {
    constructor(port) {
        this.clients = new Map();
        this.rooms = new Map();
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
                // this.broadcast(clientId, data)
            });
            socket.on("close", () => this.handleDisconnect(clientId));
        });
    }
    handleMessage(clientId, data) {
        try {
            const message = JSON.parse(data);
            switch (message.type) {
                case 'echo':
                    this.clients.get(clientId)?.socket.send(JSON.stringify({ type: "echo", payload: message.payload }));
                    Logger.info(`Received from ${clientId}: ${data}`);
                case 'join':
                    this.joinRoom(clientId, message.payload.room);
                    break;
                case 'leave':
                    this.leaveRoom(clientId, message.payload.room);
                    break;
                case 'chat':
                    this.broadcastToRoom(message.payload.room, clientId, data);
                    break;
                default:
                    Logger.error(`Unknown message type from ${clientId}: ${message.type}`);
            }
        }
        catch (error) {
            Logger.error(`Invalid message from ${clientId}: ${data}`);
        }
    }
    broadcast(senderId, data) {
        this.clients.forEach((client) => {
            if (client.socket.readyState === WebSocket.OPEN && client.id != senderId) {
                client.socket.send(JSON.stringify({ type: "server", payload: JSON.parse(data) }));
            }
        });
        Logger.info(`Broadcast to ${this.clients.size - 1} clients: ${data}`);
    }
    joinRoom(clientId, roomId) {
        if (!this.rooms.get(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId)?.add(clientId);
        Logger.info(`Client ${clientId} joined room ${roomId}`);
    }
    leaveRoom(clientId, roomId) {
        this.rooms.get(roomId)?.delete(clientId);
        Logger.info(`Client ${clientId} left room ${roomId}`);
    }
    broadcastToRoom(roomId, senderId, data) {
        const clientsInRoom = this.rooms.get(roomId);
        if (!clientsInRoom)
            return;
        const parsedData = JSON.parse(data);
        clientsInRoom.forEach((clientId) => {
            const client = this.clients.get(clientId);
            if (client && client.socket.readyState === WebSocket.OPEN && clientId != senderId) {
                client.socket.send(JSON.stringify({ type: "server", payload: parsedData }));
            }
        });
        Logger.info(`Broadcast from ${senderId} to room ${roomId}: ${data}`);
    }
    handleDisconnect(clientId) {
        this.clients.delete(clientId);
        Logger.info(`Client disconnected: ${clientId}`);
    }
}
//# sourceMappingURL=WebSocketService.js.map