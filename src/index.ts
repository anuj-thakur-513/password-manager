import dotenv from "dotenv";
dotenv.configDotenv({
  path: "./.env",
});
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import connectDb from "./services/db";
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

app.use("/api/v1", v1Router);

connectDb()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`server started on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Error connecting to DB: ${err}`);
  });
