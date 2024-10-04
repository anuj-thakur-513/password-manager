import { createClient, RedisClientType } from "redis";
import config from "../config/keys";

class Redis {
    private static instance: Redis;
    private redisClient: RedisClientType;

    private constructor() {
        this.redisClient = createClient({
            url: config.redis.url,
            password: config.redis.password,
            username: config.redis.user,
        });
        this.redisClient.connect();
    }

    public static getInstance() {
        if (!Redis.instance) {
            Redis.instance = new Redis();
        }
        return Redis.instance;
    }

    public async ping() {
        return await this.redisClient.ping();
    }

    public async addToQueue(key: string, value: object) {
        await this.redisClient.lPush(`password_manager:${key}`, JSON.stringify(value));
    }

    public async consumeFromQueue(key: string) {
        const value = await this.redisClient.brPop(key, 0);
        if (!value) {
            return null;
        }
        return JSON.parse(value.element);
    }

    public async disconnect() {
        await this.redisClient.quit();
    }
}

export default Redis;
