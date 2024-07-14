import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import v1Router from "./routes/version1";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: false, limit: "50kb" }));
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send(
    "<h1>Welcome to Password-Manager API</h1><br><h2>Visit <a href='https://anuj-thakur-513.github.io//' target='_blank'>https://anuj-thakur-513.github.io/URL-Shortener/</a> to get more info on API calls available</h2>"
  );
});

// routes are initialized through this
app.use("/api/v1", v1Router);

export default app;
