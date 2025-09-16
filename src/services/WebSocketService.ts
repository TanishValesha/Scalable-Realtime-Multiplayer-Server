import { WebSocketServer, WebSocket } from "ws";
import type { Client, Message } from "../types/types.js";
import { Logger } from "../utils/logger.js";
import {v4 as uuidv4} from "uuid"


export class WebSocketService {
    private wss: WebSocketServer;
    private clients: Map<string, Client> = new Map();

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
                this.broadcast(clientId, data)
            })
            socket.on("close", () => this.handleDisconnect(clientId));
        })
    }

    private handleMessage(clientId: string, data: string){
        try {
            const message: Message = JSON.parse(data);
            
            Logger.info(`Received from ${clientId}: ${data}`);
            this.clients.get(clientId)?.socket.send(JSON.stringify({type: "echo", payload: message}));
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

    private handleDisconnect(clientId: string){
        this.clients.delete(clientId);
        Logger.info(`Client disconnected: ${clientId}`);
    }
}