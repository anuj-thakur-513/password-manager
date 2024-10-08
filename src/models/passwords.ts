import mongoose, { Schema } from "mongoose";

const passwordSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        platformUrl: {
            type: String,
        },
        platformName: {
            type: String,
            lowercase: true,
            trim: true,
            required: true,
        },
        username: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
        },
        password: {
            iv: {
                type: String,
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
        },
    },
    { timestamps: true }
);

export const Password = mongoose.model("password", passwordSchema);
