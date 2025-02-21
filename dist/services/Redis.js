"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const keys_1 = __importDefault(require("../config/keys"));
class Redis {
    constructor() {
        this.redisClient = (0, redis_1.createClient)({
            url: keys_1.default.redis.url,
            password: keys_1.default.redis.password,
            username: keys_1.default.redis.user,
            pingInterval: 30000,
            socket: {
                keepAlive: 3000,
            },
        });
        this.consumerClient = (0, redis_1.createClient)({
            url: keys_1.default.redis.url,
            password: keys_1.default.redis.password,
            username: keys_1.default.redis.user,
            pingInterval: 30000,
            socket: {
                keepAlive: 3000,
            },
        });
        this.redisClient.connect();
        this.consumerClient.connect();
        this.redisClient.on("error", (err) => console.log("Redis Client Error", err));
        this.consumerClient.on("error", (err) => console.log("Redis Consumer Client Error", err));
    }
    static getInstance() {
        if (!Redis.instance) {
            Redis.instance = new Redis();
        }
        return Redis.instance;
    }
    ping() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redisClient.ping();
        });
    }
    addToQueue(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.redisClient.lPush(`password_manager:${key}`, JSON.stringify(value));
        });
    }
    consumeFromQueue(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.consumerClient.brPop(`password_manager:${key}`, 0);
            if (!value) {
                return null;
            }
            return JSON.parse(value.element);
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.redisClient.quit();
            yield this.consumerClient.quit();
        });
    }
}
exports.default = Redis;
