import { Redis } from "ioredis";
import config from "../config/keys";

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

export { rc };
