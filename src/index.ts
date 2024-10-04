import dotenv from "dotenv";
dotenv.configDotenv({
    path: "./.env",
});
import connectDb from "./services/db";
import app from "./server";
import Redis from "./services/Redis";

connectDb()
    .then(() => {
        const PORT = process.env.PORT || 8000;
        const redis = Redis.getInstance();
        redis.ping().then((res) => {
            console.log("Redis Connected PING :", res);
        });
        app.listen(PORT, () => {
            console.log(`server started on PORT ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(`Error connecting to DB: ${err}`);
    });
