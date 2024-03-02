import { Request, Response } from "express";
import { User } from "../../Models/userModel";


const handleLogout = async (req: Request, res: Response) => {
  //   console.log('logout handler');
  // On client, also delete the accessToken

  const cookies = req.cookies;
  // console.log(cookies)

  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });

    return res.sendStatus(204);
  }

  // console.log('found')
  // Delete refreshToken in db
  foundUser.refreshToken = "";
  const result = await foundUser.save();
  // console.log(result);

  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  res.sendStatus(204);
};

export default handleLogout;
