import { createClient, RedisClientType } from "redis";
import { Logger } from "../utils/logger.js";

export class RedisManager {
  private publisher: RedisClientType;
  private subscriber: RedisClientType;

  constructor(private url: string) {
    this.publisher = createClient({ url });
    this.subscriber = createClient({ url });
  }

  public async connect(): Promise<void> {
    await this.publisher.connect();
    await this.subscriber.connect();
    Logger.info("Redis Connected");
  }

  public async disconnect(): Promise<void> {
    await this.publisher.disconnect();
    await this.subscriber.disconnect();
  }

  public async publish(channel: string, data: any): Promise<void> {
    await this.publisher.publish(channel, JSON.stringify(data));
  }

  public async subscribe(
    channel: string,
    callback: (message: string) => void
  ): Promise<void> {
    await this.subscriber.subscribe(channel, callback);
  }

  public async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
  }

  public async enqueue(queue: string, value: any): Promise<void> {
    await this.publisher.rPush(queue, JSON.stringify(value));
  }

  public async dequeue<T>(queue: string): Promise<T | null> {
    const raw = await this.publisher.lPop(queue);
    return raw ? JSON.parse(raw) : null;
  }

  public getQueueLen(queue: string): Promise<number | undefined> {
    return this.publisher.lLen(queue);
  }

  public async sadd(key: string, members: string[] | string): Promise<void> {
    if (Array.isArray(members)) {
     for(const member of members){
        await this.publisher.sAdd(key, member);
     }
    } else {
      await this.publisher.sAdd(key, members);
    }
  }

  public async srem(key: string, members: string[] | string): Promise<void> {
    if (Array.isArray(members)) {
      for(const member of members){
        await this.publisher.sRem(key, member);
     }
    } else {
      await this.publisher.sRem(key, members);
    }
  }

  public async smembers(key: string): Promise<string[]> {
    return this.publisher.sMembers(key);
  }

  public async del(key: string): Promise<void> {
    await this.publisher.del(key);
  }
}
