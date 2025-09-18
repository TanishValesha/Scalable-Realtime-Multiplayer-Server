import WebSocket from 'ws';
export interface Client {
    id: string;
    socket: WebSocket;
}
export interface Message {
    type: "ECHO" | "JOIN" | "LEAVE" | "CHAT" | "MATCH_START" | "PLAYER_ACTION";
    payload: any;
}
//# sourceMappingURL=types.d.ts.map