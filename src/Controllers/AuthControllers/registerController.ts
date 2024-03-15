import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";

import { sendOtpEmail } from "../../Helpers/userVerificationHelper";
import { ZodError, z } from "zod";
import { User } from "../../Models/userModel";
import { RegisterUserSchema } from "../../Schemas/registerUserSchema";
import { HTTP_STATUS_CODES } from "../../Enums/statusCodes";



export const newUserRegisterHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userData = req.body;

  const validationResult = RegisterUserSchema.safeParse(userData);

  if (!validationResult.success) {
    const validationError: ZodError = validationResult.error;

    res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: validationError.errors[0].message });
  }

  if (validationResult.success) {
    const { email, username, password } = validationResult.data;
    try {
      const existingUser = await User.findOne({ email });

      if (existingUser?.verified) {
        return res.sendStatus(HTTP_STATUS_CODES.CONFLICT);
      }

      if (existingUser && !existingUser?.verified) {
        await sendOtpEmail(existingUser);
        return res
          .status(HTTP_STATUS_CODES.OK)
          .json({ userId: existingUser._id, email: existingUser.email });
      }

      const hashedPwd = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        password: hashedPwd,
        email,
      });

      newUser.save();

      await sendOtpEmail(newUser);

      res.status(HTTP_STATUS_CODES.CREATED).json({ userId: newUser._id, email: newUser.email });
    } catch (err) {
      console.log(err);

      next(err);
    }
  }
};
