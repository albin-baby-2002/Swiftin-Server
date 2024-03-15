import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { ZodError, z } from "zod";
import jwt from "jsonwebtoken";
import { User } from "../../Models/userModel";
import { authSchema } from "../../Schemas/authSchema";
import { HTTP_STATUS_CODES } from "../../Enums/statusCodes";

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authData = req.body;

  const validationResult = authSchema.safeParse(authData);

  if (!validationResult.success) {
    const validationError: ZodError = validationResult.error;

    return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: validationError.errors[0].message });
  }

  if (validationResult.success) {
    const { email, password } = validationResult.data;

    try {
      const foundUser = await User.findOne({ email });

      if (!foundUser) return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND); // 404 - User Not found

      if (!foundUser.password && foundUser.googleId) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          message:
            "This Account don't have password only Google Login Available",
        });
      }

      const match = await bcrypt.compare(password, foundUser.password);

      if (match) {
        if (!foundUser.verified) {

          return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
            message:
              "Email not verified. sign Up again and complete verification ",
          });
        }

        if (foundUser.blocked) {
          return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
            message: "Your are blocked by admin ",
          });
        }

        const roles = Object.values(foundUser.roles).filter(Boolean);

        const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;

        const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

        if (!ACCESS_SECRET || !REFRESH_SECRET) {
          throw new Error("Failed to create access / refresh token");
        }

        const accessToken = jwt.sign(
          {
            UserInfo: {
              id: foundUser._id,
              username: foundUser.username,
              roles: roles,
            },
          },
          ACCESS_SECRET,
          { expiresIn: "30m" }
        );

        const refreshToken = jwt.sign(
          { username: foundUser.username, id: foundUser._id },
          REFRESH_SECRET,
          { expiresIn: "1d" }
        );

        // Saving refreshToken with current user
        foundUser.refreshToken = refreshToken;

        const result = await foundUser.save();

        res.cookie("jwt", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(HTTP_STATUS_CODES.OK).json({
          roles,
          accessToken,
          user: foundUser.username,
          image: foundUser.image,
          userID: foundUser._id,
        });
      } else {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "Wrong password" });
      }
    } catch (err) {
      console.log(err);

      next(err);
    }
  }
};
