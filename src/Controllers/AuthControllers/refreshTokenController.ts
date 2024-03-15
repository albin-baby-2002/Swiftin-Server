import * as dotenv from "dotenv";
dotenv.config();

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../../Models/userModel";
import { HTTP_STATUS_CODES } from "../../Enums/statusCodes";

export const refreshTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED); // unauthorized

  const refreshToken = cookies.jwt;

  try {
    const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;

    const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

    if (!ACCESS_SECRET || !REFRESH_SECRET) {
      throw new Error("Failed to create token");
    }

    const foundUser = await User.findOne({ refreshToken });

    if (!foundUser) return res.sendStatus(HTTP_STATUS_CODES.FORBIDDEN); //Forbidden

    jwt.verify(refreshToken, REFRESH_SECRET, async (err: any, decoded: any) => {
      let decodedID = new mongoose.Types.ObjectId(decoded.id);

      let userID = new mongoose.Types.ObjectId(foundUser._id);

      const userData = await User.findById(userID);

      if (userData?.blocked) {
        return res.status(HTTP_STATUS_CODES.FORBIDDEN).json({ message: "you are blocked by admin" });
      }

      if (err || !userID.equals(decodedID)) {
        return res.sendStatus(HTTP_STATUS_CODES.FORBIDDEN);
      }

      const roles = Object.values(foundUser.roles).filter((role) => role);

      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: foundUser._id,
            username: decoded.username,
            roles: roles,
          },
        },
        ACCESS_SECRET,
        { expiresIn: "30m" }
      );

      return res.status(HTTP_STATUS_CODES.OK).json({
        roles,
        accessToken,
        user: decoded.username,
        image: foundUser.image,
        userID: decoded.id,
      });
    });
  } catch (err: any) {
    console.log(err);
    next(err);
  }
};
