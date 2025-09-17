export declare class WebSocketService {
    private wss;
    private clients;
    private rooms;
    private waitingQueue;
    private gameState;
    constructor(port: number);
    private initialize;
    private handleMessage;
    private broadcastStateUpdate;
    private addPlayersToQueue;
    private matchMaking;
    private joinRoom;
    private leaveRoom;
    private broadcastToRoom;
    private handleDisconnect;
}
//# sourceMappingURL=WebSocketService.d.ts.map