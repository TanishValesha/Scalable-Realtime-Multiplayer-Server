export interface PlayerState {
    id: string;
    x: number;
    y: number;
    health: number;
}
export declare class GameStateService {
    private rooms;
    /** Create room with initial player states */
    createRoom(roomId: string, playerIds: string[]): void;
    /** Handle a player's action (move, attack, heal) */
    handlePlayerAction(roomId: string, playerId: string, action: {
        type: "move" | "attack" | "heal";
        dx?: number;
        dy?: number;
        targetId?: string;
        damage?: number;
    }): void;
    /** Return a JSON-friendly object for broadcasting */
    getRoomState(roomId: string): {
        players: PlayerState[];
    } | undefined;
    /** Remove player and clean up empty rooms */
    removePlayerFromRoom(roomId: string, playerId: string): void;
}
//# sourceMappingURL=GameStateService.d.ts.map