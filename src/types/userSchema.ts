import mongoose, { Document } from "mongoose";

interface UserSchema extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  refreshToken?: string;
  isPasswordCorrect(inputPassword: string): Promise<boolean>;
}

export default UserSchema;
