import { WebSocketService } from "./services/WebSocketService.js";
import { RedisManager } from "./manager/RedisManager.js";
import { RoomService } from "./services/RoomService.js";
import { MatchMakingService } from "./services/MatchMakingService.js";
(async () => {
    const redis = new RedisManager("redis://localhost:6379");
    await redis.connect();
    const roomService = new RoomService(redis);
    const matchMakingService = new MatchMakingService(redis, roomService);
    new WebSocketService(8080, roomService, matchMakingService);
})();
//# sourceMappingURL=index.js.map