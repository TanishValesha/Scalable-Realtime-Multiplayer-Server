import { RedisManager } from "../manager/RedisManager.js";
export declare class RoomService {
    private redis;
    private roomPrefix;
    constructor(redisManager: RedisManager);
    private getRoomKey;
    createRoom(roomId: string, players: string[] | string): Promise<void>;
    deleteRoom(roomId: string): Promise<void>;
    addPlayers(roomId: string, player: string[] | string): Promise<void>;
    removePlayers(roomId: string, player: string[] | string): Promise<void>;
    listAllPlayers(roomId: string): Promise<string[]>;
    isPlayerInRoom(roomId: string, playerId: string): Promise<boolean>;
}
//# sourceMappingURL=RoomService.d.ts.map