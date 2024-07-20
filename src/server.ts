import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import session from "express-session";

import v1Router from "./routes/version1";
import config from "./config/keys";
import passport from "./config/passportConfig";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(
  session({
    secret: config.session.secret || "",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: false, limit: "50kb" }));
app.use(morgan("dev"));
app.use(cookieParser());
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req: Request, res: Response) => {
  res.send(
    "<h1>Welcome to Password-Manager API</h1><br><h2>Visit <a href='https://anuj-thakur-513.github.io/password-manager/' target='_blank'>https://anuj-thakur-513.github.io/password-manager/</a> to get more info about the project</h2>"
  );
});

// routes are initialized through this
app.use("/api/v1", v1Router);

export default app;
