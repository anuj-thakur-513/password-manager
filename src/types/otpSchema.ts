import { Document, ObjectId } from "mongoose";

interface OtpSchema extends Document {
  userId: ObjectId;
  otp: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default OtpSchema;
