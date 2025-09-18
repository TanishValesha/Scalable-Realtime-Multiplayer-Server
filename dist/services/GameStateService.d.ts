import { RedisManager } from "../manager/RedisManager.js";
export interface PlayerState {
    id: string;
    x: number;
    y: number;
    health: number;
}
export declare class GameStateService {
    private rooms;
    redis: RedisManager;
    constructor(redis: RedisManager);
    getRoomKey(roomId: string): string;
    private channel;
    initRoom(roomId: string, players: string[]): Promise<void>;
    getPlayer(roomId: string, playerId: string): Promise<PlayerState>;
    subscribeToRoom(roomId: string, listener: (e: any) => void): void;
    handleAction(roomId: string, playerId: string, action: any): Promise<void>;
    createRoom(roomId: string, playerIds: string[]): void;
    getRoomState(roomId: string): {
        players: PlayerState[];
    } | undefined;
    removePlayerFromRoom(roomId: string, playerId: string): void;
}
//# sourceMappingURL=GameStateService.d.ts.map