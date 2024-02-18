import mongoose from "mongoose";



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



const otp = mongoose.model("OtpData", otpDataSchema);

export default otp;
