import { createClient } from "redis";
import { Logger } from "../utils/logger.js";
export class RedisManager {
    constructor(url) {
        this.url = url;
        this.publisher = createClient({ url });
        this.subscriber = createClient({ url });
    }
    async connect() {
        await this.publisher.connect();
        await this.subscriber.connect();
        Logger.info("Redis Connected");
    }
    async disconnect() {
        await this.publisher.disconnect();
        await this.subscriber.disconnect();
    }
    async publish(channel, data) {
        await this.publisher.publish(channel, JSON.stringify(data));
    }
    async subscribe(channel, callback) {
        await this.subscriber.subscribe(channel, callback);
    }
    async unsubscribe(channel) {
        await this.subscriber.unsubscribe(channel);
    }
    async enqueue(queue, value) {
        await this.publisher.rPush(queue, JSON.stringify(value));
    }
    async dequeue(queue) {
        const raw = await this.publisher.lPop(queue);
        return raw ? JSON.parse(raw) : null;
    }
    getQueueLen(queue) {
        return this.publisher.lLen(queue);
    }
    async sadd(key, members) {
        if (Array.isArray(members)) {
            for (const member of members) {
                await this.publisher.sAdd(key, member);
            }
        }
        else {
            await this.publisher.sAdd(key, members);
        }
    }
    async srem(key, members) {
        if (Array.isArray(members)) {
            for (const member of members) {
                await this.publisher.sRem(key, member);
            }
        }
        else {
            await this.publisher.sRem(key, members);
        }
    }
    async smembers(key) {
        return this.publisher.sMembers(key);
    }
    async del(key) {
        await this.publisher.del(key);
    }
}
//# sourceMappingURL=RedisManager.js.map