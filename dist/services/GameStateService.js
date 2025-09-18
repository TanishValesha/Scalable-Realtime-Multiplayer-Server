export class GameStateService {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(roomId, playerIds) {
        const players = new Map();
        playerIds.forEach(id => {
            players.set(id, { id, x: 0, y: 0, health: 100 });
        });
        this.rooms.set(roomId, { players });
    }
    handlePlayerAction(roomId, playerId, action) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const player = room.players.get(playerId);
        if (!player)
            return;
        switch (action.type) {
            case "move":
                player.x += action.dx ?? 0;
                player.y += action.dy ?? 0;
                break;
            case "attack":
                if (action.targetId) {
                    const target = room.players.get(action.targetId);
                    if (target) {
                        target.health = Math.max(0, target.health - (action.damage ?? 10));
                    }
                }
                break;
            case "heal":
                player.health = Math.min(100, player.health + 20);
                break;
        }
    }
    getRoomState(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return undefined;
        return {
            players: Array.from(room.players.values())
        };
    }
    removePlayerFromRoom(roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        room.players.delete(playerId);
        if (room.players.size === 0) {
            this.rooms.delete(roomId);
        }
    }
}
//# sourceMappingURL=GameStateService.js.map