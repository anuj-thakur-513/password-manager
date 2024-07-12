import { Redis } from "ioredis";
import config from "../config/keys";
import PasswordType from "../types/password";

const rc = new Redis({
  host: config.redis.redisHost,
  port: config.redis.redisPort,
  username: config.redis.redisUser,
  password: config.redis.redisPassword,
});

rc.ping((err, data) => {
  if (err) console.log("Redis Not Connected");
  else console.log(`Redis Connected PING:${data}`);
});

/**
 * Store key-value pair in cache for a limited period of time
 * @param {string} key - Key to be mapped in cache
 * @param {Password} value - value to be stored with respect to key in cache
 * @param {number} time - TTL of data in cache
 */
const setCache = async (
  key: string,
  value: PasswordType[],
  time: number
): Promise<string> => {
  return await rc.setex(`passwordManager:${key}`, JSON.stringify(value), time);
};

/**
 * Get cache value of the key
 * @param {string} key - Key
 */
const getCache = async (key: string): Promise<PasswordType[] | null> => {
  const data = await rc.get(`passwordManager:${key}`);
  if (!data) {
    return null;
  }
  return JSON.parse(data);
};

export { rc, setCache, getCache };
