import { RoomService } from "./RoomService.js";
import { MatchMakingService } from "./MatchMakingService.js";
export declare class WebSocketService {
    private port;
    private roomService;
    private matchmaking;
    private wss;
    private clients;
    private rooms;
    private waitingQueue;
    private gameState;
    constructor(port: number, roomService: RoomService, matchmaking: MatchMakingService);
    private initialize;
    private handleAddPlayersToQueue;
    private nofifyMatchCreated;
    private joinRoom;
    private leaveRoom;
    private handleMessage;
    private broadcastStateUpdate;
    private broadcastToRoom;
    private handleDisconnect;
}
//# sourceMappingURL=WebSocketService.d.ts.map