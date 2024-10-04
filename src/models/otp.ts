import mongoose, { Schema, Types } from "mongoose";
import OtpSchema from "../types/otpSchema";

const OtpSchema = new Schema<OtpSchema>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "user",
    },
    otp: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

OtpSchema.pre("save", async function (next): Promise<void> {
  if (this.isNew || this.isModified("otp")) {
    await mongoose
      .model("otp")
      .updateMany({ userId: this.userId, isActive: true }, { $set: { isActive: false } });
  }
  next();
});

const Otp = mongoose.model("otp", OtpSchema);

export default Otp;
