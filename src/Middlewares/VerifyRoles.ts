import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS_CODES } from "../Enums/statusCodes";

interface CustomRequest extends Request {
  userInfo?: {
    username: string;
    roles: number[];
  };
}
const verifyRoles = (...allowedRoles: number[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req?.userInfo?.roles) {
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    const rolesArray = [...allowedRoles];
    const result = req.userInfo.roles.some((role) => rolesArray.includes(role));

    if (!result) {
      return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    // If the control reaches here, it means the user has the required role
    next();
  };
};

export default verifyRoles;
