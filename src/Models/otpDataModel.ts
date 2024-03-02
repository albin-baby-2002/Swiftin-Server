import mongoose from "mongoose";

const OtpDataSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: "3m",
    default: Date.now,
  },
});

export const OTP = mongoose.model("OtpData", OtpDataSchema);
