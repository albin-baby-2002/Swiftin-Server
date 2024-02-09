import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import otpData from "../Models/otpDataModel";
import User from "../Models/userModel";
import mongoose from "mongoose";

export const verifyOtpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { otp, email, userId } = req.body;

    userId = new mongoose.Types.ObjectId(userId);

    if (!otp || !email || !userId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const otpVerificationData = await otpData.findOne({
      userId,
    });

    if (otpVerificationData) {
      if (await bcrypt.compare(otp, otpVerificationData.otp)) {
        const updateUser = await User.updateOne(
          { _id: userId },
          { $set: { verified: true } }
        );

        if (updateUser) {
          return res.status(200).json({ message: "success" });
        } else {
          return res.status(500).json({ message: "Failed updating user data" });
        }
      } else {
        return res.status(400).json({ message: " wrong otp" });
      }
    } else {
      return res.status(400).json({ message: "OTP Expired" });
    }
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
