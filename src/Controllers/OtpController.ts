import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import otpData from "../Models/otpDataModel";
import User from "../Models/userModel";
import mongoose from "mongoose";
import { sendOtpEmail } from "../Helpers/userVerificationHelper";
import otpResendAttempts from "../Models/resendAttempts";

export const verifyOtpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { otp, email, userId } = req.body;

    userId = new mongoose.Types.ObjectId(userId);

    if (!otp) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!email || !userId) {
      return res.status(400).json({ message: "email or userId is empty" });
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
        return res.status(400).json({ message: " Enter the right otp" });
      }
    } else {
      return res.status(400).json({ message: "OTP Expired" });
    }
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const resendOtpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { email, userId } = req.body;

    userId = new mongoose.Types.ObjectId(userId);

    if (!email || !userId) {
      return res.status(400).json({ message: "email or userId is empty" });
    }

    const user = await User.findById(userId);

    const resendAttempts = await otpResendAttempts.findOne({
      email: user?.email,
    });

    if (resendAttempts && resendAttempts?.attempts >= 3) {
      return res.status(400).json({
        message:
          "Too many OTP resend attempts. Please try again after 5 minutes",
      });
    }

    if (user) {
      await sendOtpEmail(user);

      if (resendAttempts) {
        resendAttempts.attempts = resendAttempts.attempts + 1 || 1;

        await resendAttempts.save();
      } else {
        const newResendAttempt = new otpResendAttempts({
          userID: user._id,
          email: user.email,
          attempts: 1,
        });

        await newResendAttempt.save();
      }

      return res.sendStatus(200);
    } else {
      return res.status(400).json({ message: "email or userId is empty" });
    }
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
