export declare class WebSocketService {
    private wss;
    private clients;
    private rooms;
    private waitingQueue;
    constructor(port: number);
    private initialize;
    private handleMessage;
    private broadcast;
    private addPlayersToQueue;
    private matchMaking;
    private joinRoom;
    private leaveRoom;
    private broadcastToRoom;
    private handleDisconnect;
}
//# sourceMappingURL=WebSocketService.d.ts.map