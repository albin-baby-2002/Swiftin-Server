import { NextFunction, Request, Response } from "express";
import { User } from "../../Models/userModel";
import { HTTP_STATUS_CODES } from "../../Enums/statusCodes";

export const logoutHanlder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT); //No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      return res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT);
    }

    // Delete refreshToken in db
    foundUser.refreshToken = "";
    await foundUser.save();
  

    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    res.sendStatus(HTTP_STATUS_CODES.OK);
  } catch (err) {
    console.log(err);

    next(err);
  }
};
