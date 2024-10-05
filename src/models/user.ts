import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import UserSchema from "../types/userSchema";

const userSchema = new Schema<UserSchema>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next): Promise<void> {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (inputPassword: string): Promise<any> {
  return await bcrypt.compare(inputPassword, this.password);
};

const User = mongoose.model("user", userSchema);

export default User;
