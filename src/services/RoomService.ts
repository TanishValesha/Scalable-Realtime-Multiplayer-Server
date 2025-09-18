import { RedisManager } from "../manager/RedisManager.js";

export class RoomService {
    private redis: RedisManager;
    private roomPrefix = "room"

    constructor(redisManager: RedisManager){
        this.redis = redisManager;
    }

    private getRoomKey(roomId: string){
        return `${this.roomPrefix}:${roomId}:players`;
    }

    public async createRoom(roomId: string, players: string[] | string): Promise<void>{
         const key = this.getRoomKey(roomId);
        if (players.length) {
        await this.redis.sadd(key, players);
        } else {
        await this.redis.sadd(key, []);
        }
    }

    public async deleteRoom(roomId: string): Promise<void> {
        const key = this.getRoomKey(roomId);
        await this.redis.del(key);                      
    }
    
    public async addPlayers(roomId: string, player: string[] | string): Promise<void>{
        const key = this.getRoomKey(roomId);
        await this.redis.sadd(key, player);
    }

    public async removePlayers(roomId: string, player: string[] | string): Promise<void>{
        const key = this.getRoomKey(roomId);
        await this.redis.srem(key, player);
    }

    public async listAllPlayers(roomId: string): Promise<string[]>{
        const key = this.getRoomKey(roomId);
        return this.redis.smembers(key);
    }

    public async isPlayerInRoom(roomId: string, playerId: string): Promise<boolean>{
        const key = this.getRoomKey(roomId);
        const members = await this.redis.smembers(key);
        return members.includes(playerId);
    }
}