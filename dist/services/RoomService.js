export class RoomService {
    constructor(redisManager) {
        this.roomPrefix = "room";
        this.redis = redisManager;
    }
    getRoomKey(roomId) {
        return `${this.roomPrefix}:${roomId}:players`;
    }
    async createRoom(roomId, players) {
        const key = this.getRoomKey(roomId);
        if (players.length) {
            await this.redis.sadd(key, players);
        }
        else {
            await this.redis.sadd(key, []);
        }
    }
    async deleteRoom(roomId) {
        const key = this.getRoomKey(roomId);
        await this.redis.del(key);
    }
    async addPlayers(roomId, player) {
        const key = this.getRoomKey(roomId);
        await this.redis.sadd(key, player);
    }
    async removePlayers(roomId, player) {
        const key = this.getRoomKey(roomId);
        await this.redis.srem(key, player);
    }
    async listAllPlayers(roomId) {
        const key = this.getRoomKey(roomId);
        return this.redis.smembers(key);
    }
    async isPlayerInRoom(roomId, playerId) {
        const key = this.getRoomKey(roomId);
        const members = await this.redis.smembers(key);
        return members.includes(playerId);
    }
}
//# sourceMappingURL=RoomService.js.map