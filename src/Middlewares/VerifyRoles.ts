import { NextFunction, Request, Response } from "express";

interface CustomRequest extends Request {
  userInfo?: {
    username: string;
    roles: number[];
  };
}
const verifyRoles = (...allowedRoles: number[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req?.userInfo?.roles) {
      return res.sendStatus(401);
    }

    const rolesArray = [...allowedRoles];
    const result = req.userInfo.roles.some((role) => rolesArray.includes(role));

    if (!result) {
      return res.sendStatus(401);
    }

    // If the control reaches here, it means the user has the required role
    next();
  };
};

export default verifyRoles;
