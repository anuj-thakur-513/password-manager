import mongoose from "mongoose";
import config from "../config/keys";
import { DB_NAME } from "../constants";

async function connectDB() {
  try {
    const connection = await mongoose.connect(`${config.mongoDb.dbUri}/${DB_NAME}`);
    console.log(`DB connected on host: ${connection.connection.host}`);
  } catch (error) {
    console.log(`Error while connecting to DB: ${error}`);
  }
}

export default connectDB;
