import dotenv from "dotenv";
dotenv.configDotenv({
  path: "./.env",
});
import connectDb from "./services/db";
import app from "./server";
import { rc } from "./services/redis";

connectDb()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`server started on PORT ${PORT}`);
    });

    const redisConnection = rc;
  })
  .catch((err) => {
    console.log(`Error connecting to DB: ${err}`);
  });
