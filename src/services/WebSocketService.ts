import { WebSocketServer, WebSocket } from "ws";
import type { Client, Message } from "../types/types.js";
import { Logger } from "../utils/logger.js";
import {v4 as uuidv4} from "uuid"
import { Queue } from "../utils/Queue.js";


export class WebSocketService {
    private wss: WebSocketServer;
    private clients: Map<string, Client> = new Map();
    private rooms: Map<string, Set<string>> = new Map();
    private waitingQueue: Queue<string> = new Queue();

    constructor(port: number){
        this.wss = new WebSocketServer({port});
        this.initialize();
        Logger.info(`WebSocket Server created, listening on port ${port}`)
    }

    private initialize() {
        this.wss.on('connection', (socket: WebSocket) => {
            const clientId = uuidv4();
            const client: Client = {id: clientId, socket};
            this.clients.set(clientId, client);

            Logger.info(`Client connected: ${clientId}`);

            socket.on("message", (data: string) => {
                this.handleMessage(clientId, data); 
            })
            socket.on("close", () => this.handleDisconnect(clientId));
        })
    }
    

    private handleMessage(clientId: string, data: string){
        try {
            const message: Message = JSON.parse(data);

            switch(message.type){
                case 'echo':
                    this.clients.get(clientId)?.socket.send(JSON.stringify({type: "echo", payload: message.payload}));
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
                default:
                    Logger.error(`Unknown message type from ${clientId}: ${message.type}`);
            }
        } catch (error) {
            Logger.error(`Invalid message from ${clientId}: ${data}`);
        }

    }

    private broadcast(senderId: string, data: string){       
        this.clients.forEach((client) => {
            if(client.socket.readyState === WebSocket.OPEN && client.id != senderId){
                client.socket.send(JSON.stringify({type: "server", payload: JSON.parse(data)}));
            }
        })

        Logger.info(`Broadcast to ${this.clients.size - 1} clients: ${data}`);
    }

    private addPlayersToQueue(clientId: string){
        if(!this.clients.get(clientId)) return;
        this.waitingQueue.enqueue(clientId);
        Logger.info(`Client ${clientId} added to matchmaking queue`);

        this.matchMaking();
    }

    private matchMaking(){
        const MATCH_SIZE = 2;

        while(this.waitingQueue.size() >= MATCH_SIZE){
            const matchedPlayers: string[] = [];
            for(let i = 0; i < MATCH_SIZE; i++){
                const player = this.waitingQueue.peek();
                this.waitingQueue.dequeue();
                if(player) matchedPlayers.push(player);
            }

            const matchRoomId = `match-${uuidv4()}`

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

    private joinRoom(clientId: string, roomId: string){
        if(!this.rooms.get(roomId)) {
            this.rooms.set(roomId, new Set());
        }

        this.rooms.get(roomId)?.add(clientId);
        Logger.info(`Client ${clientId} joined room ${roomId}`)
    }

    private leaveRoom(clientId: string, roomId: string){
        this.rooms.get(roomId)?.delete(clientId);
        Logger.info(`Client ${clientId} left room ${roomId}`);
    }

    private broadcastToRoom(roomId: string, senderId: string, data: string){
        const clientsInRoom = this.rooms.get(roomId);
        if (!clientsInRoom) return;

        const parsedData = JSON.parse(data)

        clientsInRoom.forEach((clientId: string) => {
            const client = this.clients.get(clientId);
            if(client && client.socket.readyState === WebSocket.OPEN && clientId != senderId) {
                client.socket.send(JSON.stringify({type: "server", payload: parsedData}));
            }
        })

        Logger.info(`Broadcast from ${senderId} to room ${roomId}: ${data}`);
    }

    private handleDisconnect(clientId: string){
        this.clients.delete(clientId);
        Logger.info(`Client disconnected: ${clientId}`);
    }
}