import * as dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import User from "../Models/userModel";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const handleRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookies = req.cookies;
  
  console.log('req for refresh')

  console.log(cookies)

  if (!cookies?.jwt) return res.sendStatus(401); // unauthorized

  const refreshToken = cookies.jwt;

  try {
    const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;

    const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

    if (!ACCESS_SECRET || !REFRESH_SECRET) {
      throw new Error("Failed to create token");
    }

    const foundUser = await User.findOne({ refreshToken });

    if (!foundUser) return res.sendStatus(403); //Forbidden

    jwt.verify(refreshToken, REFRESH_SECRET, (err: any, decoded: any) => {
      if (err || foundUser.username !== decoded.username)
        return res.sendStatus(403);

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
        { expiresIn: "50s" }
      );

      res.json({ roles, accessToken, user: decoded.username });
    });
  } catch (err: any) {
    next(err);
  }
};

export default handleRefreshToken;
