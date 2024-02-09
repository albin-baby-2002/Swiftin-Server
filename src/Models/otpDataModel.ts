import mongoose from "mongoose";

interface User extends mongoose.Document {
  userId: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}

const otpDataSchema = new mongoose.Schema({
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

// otpDataSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const otp = mongoose.model("OtpData", otpDataSchema);

export default otp;
