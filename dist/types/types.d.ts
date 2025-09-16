import WebSocket from 'ws';
export interface Client {
    id: string;
    socket: WebSocket;
}
export interface Message {
    type: "echo" | "join" | "leave" | "chat" | "match_start";
    payload: any;
}
//# sourceMappingURL=types.d.ts.map