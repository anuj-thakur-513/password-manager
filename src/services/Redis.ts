import { createClient, RedisClientType } from "redis";
import config from "../config/keys";

class Redis {
    private static instance: Redis;
    private redisClient: RedisClientType;
    private consumerClient: RedisClientType;

    private constructor() {
        this.redisClient = createClient({
            url: config.redis.url,
            password: config.redis.password,
            username: config.redis.user,
            pingInterval: 30000,
        });
        this.consumerClient = createClient({
            url: config.redis.url,
            password: config.redis.password,
            username: config.redis.user,
            pingInterval: 30000,
        });
        this.redisClient.connect();
        this.consumerClient.connect();
        this.redisClient.on("error", (err) => console.log("Redis Client Error", err));
        this.consumerClient.on("error", (err) => console.log("Redis Consumer Client Error", err));
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
        const value = await this.consumerClient.brPop(`password_manager:${key}`, 0);
        if (!value) {
            return null;
        }
        return JSON.parse(value.element);
    }

    public async disconnect() {
        await this.redisClient.quit();
        await this.consumerClient.quit();
    }
}

export default Redis;
