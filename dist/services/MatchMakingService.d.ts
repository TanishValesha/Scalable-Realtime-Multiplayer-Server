import { RedisManager } from "../manager/RedisManager.js";
import { RoomService } from "./RoomService.js";
export declare class MatchMakingService {
    private redis;
    private rooms;
    private queueId;
    constructor(redisManager: RedisManager, roomService: RoomService);
    addPlayerToQueue(playerId: string): Promise<void>;
    removePlayerFromQueue(): Promise<string | null>;
    matchMakingPlayers(roomSize?: number): Promise<string | null>;
    getQueueLength(): Promise<number | undefined>;
}
//# sourceMappingURL=MatchMakingService.d.ts.map