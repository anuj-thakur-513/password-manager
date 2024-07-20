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
  googleOAuth: {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  },
  session: {
    secret: process.env.SESSION_SECRET,
  },
};

export default config;
