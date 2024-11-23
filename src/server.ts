import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";

import v1Router from "./routes/version1";
import errorHandler from "./middlewares/errorHandler";
import sendEmails from "./utils/sendEmails";
import Redis from "./services/Redis";

const app = express();
const redis = Redis.getInstance();
redis.ping().then((res) => {
  console.log(`Redis Connected PING:${res}`);
});

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: false, limit: "50kb" }));
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
  res.send("<h1>API is up and working fine</h1>");
});

// setImmediate to send emails in the background
sendEmails(redis);

// routes are initialized through this
app.use("/api/v1", v1Router);

export default app;
