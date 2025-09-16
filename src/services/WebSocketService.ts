import { WebSocketServer, WebSocket } from "ws";
import type { Client, Message } from "../types/types.js";
import { Logger } from "../utils/logger.js";
import {v4 as uuidv4} from "uuid"


export class WebSocketService {
    private wss: WebSocketServer;
    private clients: Map<string, Client> = new Map();
    private rooms: Map<string, Set<string>> = new Map();

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