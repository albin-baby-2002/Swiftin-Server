import { log } from "console";
import * as dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
dotenv.config();

import jwt, { JwtPayload } from "jsonwebtoken";

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

export const verifyJWT = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("JWT ENTERED");

  const authHeader = (req.headers.authorization ||
    req.headers.Authorization) as string;

  //   console.log(authHeader);

  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401); // unauthorized

  try {
    const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;

    if (!ACCESS_SECRET) {
      throw new Error("Failed to verify token");
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, ACCESS_SECRET, (err, decoded) => {
      if (err) {
        console.log("failed to verify");
        return res.sendStatus(403);
      }

      req.userInfo = req.userInfo || { id: "", username: "", roles: [] };

      req.userInfo.id = (decoded as DecodedToken).UserInfo.id;
      req.userInfo.username = (decoded as DecodedToken).UserInfo.username;
      req.userInfo.roles = (decoded as DecodedToken).UserInfo.roles;

      next();
     
    });

 
  } catch (err: any) {
    next(err);
  }
};
