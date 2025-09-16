import { Client } from "../types/types.js";

interface PlayerState {
    id: string;
    x: number;
    y: number;
    health: number;
}

export class GameStateService {
    private rooms: Map<string, PlayerState[]> = new Map();


    private createRoom(roomId: string, playerIds: string[]){
        const players: PlayerState[] = [];
        playerIds.forEach((playerId) => {
            players.push({id: playerId, x: 0, y: 0, health: 100});
        });
        this.rooms.set(roomId, players);
    }

    private handlePlayerActions(roomId: string, playerId: string, action: "move" | "attack" | "heal"){
        
    }
}