import { RedisManager } from "../manager/RedisManager.js";


export interface PlayerState {
    id: string;
    x: number;
    y: number;
    health: number;
}

interface RoomState {
    players: Map<string, PlayerState>;
}

export class GameStateService {
    private rooms: Map<string, RoomState> = new Map();
    public redis: RedisManager;

    constructor(redis: RedisManager){
        this.redis = redis;
    }

    public getRoomKey(roomId: string){
        return `game:${roomId}:state`
    }

    private channel(roomId: string){
        return `game:${roomId}:events`
    }

    public async initRoom(roomId: string, players: string[]) {
        const key = this.getRoomKey(roomId);
        const entries = players.flatMap(id => [
            `${id}:x`, "0",
            `${id}:y`, "0",
            `${id}:health`, "100"
        ]);
        await this.redis.hset(key, entries);
    }

    public async getPlayer(roomId: string, playerId: string): Promise<PlayerState> {
        const raw = await this.redis.hgetall(this.getRoomKey(roomId));
        return {
            id: playerId,
            x: parseInt(raw[`${playerId}:x`] ?? "0", 10),
            y: parseInt(raw[`${playerId}:y`] ?? "0", 10),
            health: parseInt(raw[`${playerId}:health`] ?? "100", 10)
        };
    }

    public subscribeToRoom(roomId: string, listener: (e: any) => void) {
        this.redis.subscribe(this.channel(roomId), (msg) => {
            const evt = JSON.parse(msg);
            listener(evt);
        });
    }
    

    public async handleAction(roomId: string, playerId: string, action: any) {
        const key = this.getRoomKey(roomId);

        switch (action.type) {
            case "move":
                if (action.dx !== undefined) {
                    await this.redis.hincrby(key, `${playerId}:x`, action.dx);
                }
                if (action.dy !== undefined) {
                    await this.redis.hincrby(key, `${playerId}:y`, action.dy);
                }
                break;

            case "attack":
                if (action.targetId) {
                    const targetHealthField = `${action.targetId}:health`;
                    await this.redis.hincrby(key, targetHealthField, -(action.damage ?? 10));
                }
                break;

            case "heal":
                const healthField = `${playerId}:health`;
                const current = parseInt(await this.redis.hget(key, healthField) ?? "100", 10);
                const newValue = Math.min(100, current + 20);
                await this.redis.hset(key, healthField, newValue.toString());
                break;
        }
        await this.redis.publish(this.channel(roomId), JSON.stringify({ playerId, action }));
    }



    public createRoom(roomId: string, playerIds: string[]) {
        const players = new Map<string, PlayerState>();
        playerIds.forEach(id => {
            players.set(id, { id, x: 0, y: 0, health: 100 });
        });
        this.rooms.set(roomId, { players });
    }

    public getRoomState(roomId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return undefined;

        return {
            players: Array.from(room.players.values())
        };
    }

    public removePlayerFromRoom(roomId: string, playerId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.players.delete(playerId);
        if (room.players.size === 0) {
            this.rooms.delete(roomId);
        }
    }
}
