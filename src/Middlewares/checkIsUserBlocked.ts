import { log } from "console";
import * as dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
dotenv.config();

import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../Models/userModel";
import { HTTP_STATUS_CODES } from "../Enums/statusCodes";

export interface CustomRequest extends Request {
  userInfo?: {
    id: string;
    username: string;
    roles: number[];
  };
}

interface UserInfo {
  id: string;
  username: string;
  roles: number[];
}

interface DecodedToken {
  UserInfo: UserInfo;
}

export const checkIsUserBlocked = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let userID = req.userInfo?.id;

    const userData = await User.findById(userID);

    if (userData?.blocked) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "you are blocked by admin" });
    }

    next();
  } catch (err: any) {
    next(err);
  }
};
