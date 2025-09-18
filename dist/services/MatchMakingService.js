export class MatchMakingService {
    constructor(redisManager, roomService) {
        this.queueId = "matchmaking:queue";
        this.redis = redisManager;
        this.rooms = roomService;
    }
    async addPlayerToQueue(playerId) {
        await this.redis.enqueue(this.queueId, playerId);
    }
    async removePlayerFromQueue() {
        return this.redis.dequeue(this.queueId);
    }
    async matchMakingPlayers(roomSize = 2) {
        const players = [];
        for (let i = 0; i < roomSize; i++) {
            const player = await this.removePlayerFromQueue();
            if (!player)
                break;
            players.push(player);
        }
        if (players.length === roomSize) {
            const roomId = `room-${Date.now()}`;
            await this.rooms.createRoom(roomId, players);
            return roomId;
        }
        for (const p of players) {
            await this.addPlayerToQueue(p);
        }
        return null;
    }
    async getQueueLength() {
        return this.redis.getQueueLen(this.queueId);
    }
}
//# sourceMappingURL=MatchMakingService.js.map