import mongoose from "mongoose";

const OtpResendAttemptsSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    expires: "5m",
    default: Date.now,
  },
});

const OtpResendAttempts = mongoose.model("otpReSends", OtpResendAttemptsSchema);

export default OtpResendAttempts;
