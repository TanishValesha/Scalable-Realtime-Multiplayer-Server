import { RedisManager } from "../manager/RedisManager.js";
import { RoomService } from "./RoomService.js";

export class MatchMakingService {
    private redis: RedisManager;
    private rooms: RoomService;
    private queueId = "matchmaking:queue"

    constructor(redisManager: RedisManager, roomService: RoomService){
        this.redis = redisManager;
        this.rooms = roomService;
    }

    public async addPlayerToQueue(playerId: string): Promise<void>{
        await this.redis.enqueue(this.queueId, playerId);
    }

    public async removePlayerFromQueue(): Promise<string | null>{
        return this.redis.dequeue<string>(this.queueId);
    }

    public async matchMakingPlayers(roomSize = 2): Promise<string | null> {
        const players: string[] = [];

        for (let i = 0; i < roomSize; i++) {
            const player = await this.removePlayerFromQueue();
            if (!player) break;
            players.push(player);
        }

        if (players.length === roomSize) {
            const roomId = `match-${Date.now()}`;
            await this.rooms.createRoom(roomId, players);
            return roomId;
        }

        for (const p of players) {
            await this.addPlayerToQueue(p);
        }

        return null;
    }

    public async getQueueLength(): Promise<number | undefined> {
        return this.redis.getQueueLen(this.queueId)
    }
}