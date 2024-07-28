import dotenv from "dotenv";
dotenv.configDotenv({
  path: "./.env",
});
import connectDb from "./services/db";
import app from "./server";

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
