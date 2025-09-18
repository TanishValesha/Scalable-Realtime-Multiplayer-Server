import { WebSocketServer, WebSocket } from "ws";
import { Logger } from "../utils/logger.js";
import { v4 as uuidv4 } from "uuid";
import { Queue } from "../utils/Queue.js";
import { GameStateService } from "./GameStateService.js";
export class WebSocketService {
    constructor(port, roomService, matchmaking) {
        this.port = port;
        this.roomService = roomService;
        this.matchmaking = matchmaking;
        this.clients = new Map();
        this.rooms = new Map();
        this.waitingQueue = new Queue();
        this.wss = new WebSocketServer({ port });
        this.gameState = new GameStateService();
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
            });
            socket.on("close", () => this.handleDisconnect(clientId));
        });
    }
    async handleAddPlayersToQueue(clientId) {
        if (!this.clients.has(clientId))
            return;
        await this.matchmaking.addPlayerToQueue(clientId);
        Logger.info(`Client ${clientId} added to matchmaking queue`);
        const roomId = await this.matchmaking.matchMakingPlayers(2);
        if (roomId)
            await this.nofifyMatchCreated(roomId);
    }
    async nofifyMatchCreated(roomId) {
        const players = await this.roomService.listAllPlayers(roomId);
        const payload = JSON.stringify({
            type: "match_start",
            payload: { room: roomId, players },
        });
        for (const pid of players) {
            const client = this.clients.get(pid);
            if (client && client.socket.readyState === WebSocket.OPEN) {
                client.socket.send(payload);
            }
        }
        this.gameState.createRoom(roomId, players);
    }
    async joinRoom(clientId, roomId) {
        await this.roomService.addPlayers(roomId, clientId);
        Logger.info(`Client ${clientId} joined ${roomId}`);
    }
    async leaveRoom(clientId, roomId) {
        await this.roomService.removePlayers(roomId, clientId);
        Logger.info(`Client ${clientId} left ${roomId}`);
    }
    handleMessage(clientId, data) {
        try {
            const message = JSON.parse(data);
            switch (message.type) {
                case 'ECHO':
                    this.clients.get(clientId)?.socket.send(JSON.stringify({ type: "echo", payload: message.payload }));
                    Logger.info(`Received from ${clientId}: ${data}`);
                case 'JOIN':
                    this.joinRoom(clientId, message.payload.room);
                    break;
                case 'LEAVE':
                    this.leaveRoom(clientId, message.payload.room);
                    break;
                case 'CHAT':
                    this.broadcastToRoom(message.payload.room, clientId, data);
                    break;
                case 'MATCH_START':
                    this.handleAddPlayersToQueue(clientId);
                    break;
                // case "player_action": {                                     
                //     const { room, action } = message.payload;
                //     this.gameState.handlePlayerAction(room, clientId, action);
                //     this.broadcastStateUpdate(room);
                //     break;
                // }
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
    async broadcastToRoom(roomId, senderId, data) {
        const members = await this.roomService.listAllPlayers(roomId);
        const parsed = JSON.parse(data);
        for (const pid of members) {
            if (pid === senderId)
                continue;
            const client = this.clients.get(pid);
            if (client?.socket.readyState === WebSocket.OPEN) {
                client.socket.send(JSON.stringify({ type: "server", payload: parsed }));
            }
        }
        Logger.info(`Broadcast from ${senderId} to ${roomId}`);
    }
    // private addPlayersToQueue(clientId: string){
    //     if(!this.clients.get(clientId)) return;
    //     this.waitingQueue.enqueue(clientId);
    //     Logger.info(`Client ${clientId} added to matchmaking queue`);
    //     this.matchMaking();
    // }
    // private matchMaking(){
    //     const MATCH_SIZE = 2;
    //     while(this.waitingQueue.size() >= MATCH_SIZE){
    //         const matchedPlayers: string[] = [];
    //         for(let i = 0; i < MATCH_SIZE; i++){
    //             const player = this.waitingQueue.peek();
    //             this.waitingQueue.dequeue();
    //             if(player) matchedPlayers.push(player);
    //         }
    //         const matchRoomId = `match-${uuidv4()}`
    //         this.rooms.set(matchRoomId, new Set(matchedPlayers));
    //         this.gameState.createRoom(matchRoomId, matchedPlayers);
    //         matchedPlayers.forEach(clientId => this.joinRoom(clientId, matchRoomId));
    //         Logger.info(`Match created: ${matchRoomId} with players ${matchedPlayers.join(", ")}`);
    //         matchedPlayers.forEach(clientId => {
    //         const client = this.clients.get(clientId);
    //         client?.socket.send(JSON.stringify({
    //             type: "match_start",
    //             payload: { room: matchRoomId, players: matchedPlayers }
    //         }));
    //     });
    //     }
    // }
    // private joinRoom(clientId: string, roomId: string){
    //     if(!this.rooms.get(roomId)) {
    //         this.rooms.set(roomId, new Set());
    //     }
    //     this.rooms.get(roomId)?.add(clientId);
    //     Logger.info(`Client ${clientId} joined room ${roomId}`)
    // }
    // private leaveRoom(clientId: string, roomId: string){
    //     this.rooms.get(roomId)?.delete(clientId);
    //     Logger.info(`Client ${clientId} left room ${roomId}`);
    // }
    // private broadcastToRoom(roomId: string, senderId: string, data: string){
    //     const clientsInRoom = this.rooms.get(roomId);
    //     if (!clientsInRoom) return;
    //     const parsedData = JSON.parse(data)
    //     clientsInRoom.forEach((clientId: string) => {
    //         const client = this.clients.get(clientId);
    //         if(client && client.socket.readyState === WebSocket.OPEN && clientId != senderId) {
    //             client.socket.send(JSON.stringify({type: "server", payload: parsedData}));
    //         }
    //     })
    //     Logger.info(`Broadcast from ${senderId} to room ${roomId}: ${data}`);
    // }
    handleDisconnect(clientId) {
        this.clients.delete(clientId);
        Logger.info(`Client disconnected: ${clientId}`);
    }
}
//# sourceMappingURL=WebSocketService.js.map