const config = {
  mongoDb: {
    dbUri: process.env.MONGO_URI,
  },
  jwt: {
    jwtSecret: process.env.JWT_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
  },
};

export default config;
