import mongoose from "mongoose";
import config from "../config/keys";

async function connectDB() {
  try {
    console.log(config.mongoDb.dbUri);
    const connection = await mongoose.connect(
      `${config.mongoDb.dbUri}/password-manager`
    );
    console.log(`DB connected on host: ${connection.connection.host}`);
  } catch (error) {
    console.log(`Error while connecting to DB: ${error}`);
  }
}

export default connectDB;
