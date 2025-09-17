import { WebSocketServer, WebSocket } from "ws";
import { Logger } from "../utils/logger.js";
import { v4 as uuidv4 } from "uuid";
import { Queue } from "../utils/Queue.js";
import { GameStateService } from "./GameStateService.js";
export class WebSocketService {
    constructor(port) {
        this.clients = new Map();
        this.rooms = new Map();
        this.waitingQueue = new Queue();
        this.wss = new WebSocketServer({ port });
        this.initialize();
        this.gameState = new GameStateService();
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
                case 'match_start':
                    this.addPlayersToQueue(clientId);
                    break;
                case "player_action": {
                    const { room, action } = message.payload;
                    this.gameState.handlePlayerAction(room, clientId, action);
                    this.broadcastStateUpdate(room);
                    break;
                }
                default:
                    Logger.error(`Unknown message type from ${clientId}: ${message.type}`);
            }
        }
        catch (error) {
            Logger.error(`Invalid message from ${clientId}: ${data}`);
        }
    }
    broadcastStateUpdate(roomId) {
        const state = this.gameState.getRoomState(roomId);
        if (!state)
            return;
        const clientsInRoom = this.rooms.get(roomId);
        if (!clientsInRoom)
            return;
        const payload = JSON.stringify({ type: "state_update", payload: state });
        clientsInRoom.forEach(cid => {
            const c = this.clients.get(cid);
            if (c && c.socket.readyState === WebSocket.OPEN) {
                c.socket.send(payload);
            }
        });
    }
    addPlayersToQueue(clientId) {
        if (!this.clients.get(clientId))
            return;
        this.waitingQueue.enqueue(clientId);
        Logger.info(`Client ${clientId} added to matchmaking queue`);
        this.matchMaking();
    }
    matchMaking() {
        const MATCH_SIZE = 2;
        while (this.waitingQueue.size() >= MATCH_SIZE) {
            const matchedPlayers = [];
            for (let i = 0; i < MATCH_SIZE; i++) {
                const player = this.waitingQueue.peek();
                this.waitingQueue.dequeue();
                if (player)
                    matchedPlayers.push(player);
            }
            const matchRoomId = `match-${uuidv4()}`;
            this.rooms.set(matchRoomId, new Set(matchedPlayers));
            this.gameState.createRoom(matchRoomId, matchedPlayers);
            matchedPlayers.forEach(clientId => this.joinRoom(clientId, matchRoomId));
            Logger.info(`Match created: ${matchRoomId} with players ${matchedPlayers.join(", ")}`);
            matchedPlayers.forEach(clientId => {
                const client = this.clients.get(clientId);
                client?.socket.send(JSON.stringify({
                    type: "match_start",
                    payload: { room: matchRoomId, players: matchedPlayers }
                }));
            });
        }
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