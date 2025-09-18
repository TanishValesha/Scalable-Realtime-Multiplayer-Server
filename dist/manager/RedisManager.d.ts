export declare class RedisManager {
    private url;
    private publisher;
    private subscriber;
    constructor(url: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    publish(channel: string, data: any): Promise<void>;
    subscribe(channel: string, callback: (message: string) => void): Promise<void>;
    unsubscribe(channel: string): Promise<void>;
    enqueue(queue: string, value: any): Promise<void>;
    dequeue<T>(queue: string): Promise<T | null>;
    getQueueLen(queue: string): Promise<number | undefined>;
    sadd(key: string, members: string[] | string): Promise<void>;
    srem(key: string, members: string[] | string): Promise<void>;
    smembers(key: string): Promise<string[]>;
    del(key: string): Promise<void>;
}
//# sourceMappingURL=RedisManager.d.ts.map