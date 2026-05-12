// models/User.js (Updated with additional fields)

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    phone: String,
    address: String,
    city: String,
    country: String,
    zipCode: String,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    profileImage: String,
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);