import WebSocket from 'ws';

export interface Client {
  id: string;
  socket: WebSocket;
}

export interface Message {
  type: string;
  payload: any;
}
