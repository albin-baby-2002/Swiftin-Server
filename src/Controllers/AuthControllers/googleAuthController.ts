import * as dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

import { Request, Response, NextFunction } from "express";
import {  OAuth2Client } from "google-auth-library";
import axios from "axios";
import { User } from "../../Models/userModel";
import { HTTP_STATUS_CODES } from "../../Enums/statusCodes";

export const googleAuthHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "postmessage"
    );

    const code = req.body.code;

    if (!code) return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "invalid code" });

    const { tokens } = await oAuth2Client.getToken(code);

    if (tokens.access_token) {

      const userInfo = await axios
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        })
        .then((res) => res.data);


      const { sub, name, email, picture } = userInfo;

      let user = await User.findOne({ email });

      if (user?.blocked) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          message: "Your are blocked by admin ",
        });
      }

      if (user && !user.googleId) {
        user.username = name;
        user.googleId = sub;

        await user.save();
      }

      if (!user) {
        const newUser = new User({
          username: name,
          googleId: sub,
          image: picture,
          email,
          verified: true,
        });

        await newUser.save();

        user = newUser;
      }

      const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;

      const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

      if (!ACCESS_SECRET || !REFRESH_SECRET) {
        throw new Error("Failed to create access / refresh token");
      }

      const roles = Object.values(user.roles).filter(Boolean);

      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: user._id,
            username: user.username,
            roles: roles,
          },
        },
        ACCESS_SECRET,
        { expiresIn: "30m" }
      );

      const refreshToken = jwt.sign(
        { username: user.username, id: user._id },
        REFRESH_SECRET,
        { expiresIn: "1d" }
      );

      // Saving refreshToken with current user
      user.refreshToken = refreshToken;

      const result = await user.save();

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(HTTP_STATUS_CODES.OK).json({
        roles,
        accessToken,
        user: user.username,
        image: user.image,
        userID: user._id,
      });
    }
  } catch (err) {
    console.log(err)
    next(err);
  }
};


