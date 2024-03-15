import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { OTP } from "../../Models/otpDataModel";

import mongoose from "mongoose";
import { sendOtpEmail } from "../../Helpers/userVerificationHelper";
import OtpResendAttempts from "../../Models/resendAttempts";
import { User } from "../../Models/userModel";
import { HTTP_STATUS_CODES } from "../../Enums/statusCodes";

export const verifyOtpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { otp, email, userId } = req.body;

    userId = new mongoose.Types.ObjectId(userId);

    if (!otp) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "All fields are required." });
    }

    if (!email || !userId) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "email or userId is empty" });
    }

    const otpVerificationData = await OTP.findOne({
      userId,
    });

    if (otpVerificationData) {
      if (await bcrypt.compare(otp, otpVerificationData.otp)) {
        const updateUser = await User.updateOne(
          { _id: userId },
          { $set: { verified: true } }
        );

        if (updateUser) {
          return res.status(HTTP_STATUS_CODES.OK).json({ message: "success" });
        } else {
          return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Failed updating user data" });
        }
      } else {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: " Enter the right otp" });
      }
    } else {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "OTP Expired" });
    }
  } catch (err) {
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
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "email or userId is empty" });
    }

    const user = await User.findById(userId);

    const resendAttempts = await OtpResendAttempts.findOne({
      email: user?.email,
    });

    if (resendAttempts && resendAttempts?.attempts >= 3) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
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
        const newResendAttempt = new OtpResendAttempts({
          userID: user._id,
          email: user.email,
          attempts: 1,
        });

        await newResendAttempt.save();
      }

      return res.sendStatus(HTTP_STATUS_CODES.OK);
    } else {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "email or userId is empty" });
    }
  } catch (err) {
    console.log(err);

    next(err);
  }
};
