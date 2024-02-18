import mongoose from "mongoose";



const otpResendAttemptsSchema = new mongoose.Schema({
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

const otpResendAttempts = mongoose.model("otpReSends", otpResendAttemptsSchema);

export default otpResendAttempts;
