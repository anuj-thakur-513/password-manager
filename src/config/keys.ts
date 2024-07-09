const config = {
  mongoDb: {
    dbUri: process.env.MONGO_URI,
  },
  jwt: {
    jwtSecret: process.env.JWT_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
  },
  redis: {
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT
      ? parseInt(process.env.REDIS_PORT)
      : 24952,
    redisUser: process.env.REDIS_USER,
    redisPassword: process.env.REDIS_PASSWORD,
  },
};

export default config;
