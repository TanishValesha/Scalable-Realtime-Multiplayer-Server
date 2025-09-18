export interface PlayerState {
    id: string;
    x: number;
    y: number;
    health: number;
}
export declare class GameStateService {
    private rooms;
    createRoom(roomId: string, playerIds: string[]): void;
    handlePlayerAction(roomId: string, playerId: string, action: {
        type: "move" | "attack" | "heal";
        dx?: number;
        dy?: number;
        targetId?: string;
        damage?: number;
    }): void;
    getRoomState(roomId: string): {
        players: PlayerState[];
    } | undefined;
    removePlayerFromRoom(roomId: string, playerId: string): void;
}
//# sourceMappingURL=GameStateService.d.ts.map