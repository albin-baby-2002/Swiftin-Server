import { NextFunction, Request, Response } from "express";

import mongoose from "mongoose";
import { ZodError, z } from "zod";
import bcrypt from "bcrypt";
import { User } from "../../Models/userModel";
import { TGetReqQuery } from "../../Types/getReqQueryType";
import { AddUserSchema } from "../../Schemas/addUserSchema";
import { EditUserSchema } from "../../Schemas/editUserSchema";
import { HttpStatusCode } from "axios";
import { HTTP_STATUS_CODES } from "../../Enums/statusCodes";

export const getAllUsersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let queryParams = req.query as unknown as TGetReqQuery;

    let search = "";

    if (queryParams.search) {
      search = queryParams.search.trim();
    }

    let page = 1;

    if (Number(queryParams.page)) {
      page = Number(queryParams.page);
    }

    let limit = 5;

    let filterQuery = { username: {}, "roles.Admin": { $exists: false } };

    filterQuery.username = { $regex: search, $options: "i" };


    const users = await User.aggregate([
      {
        $match: filterQuery,
      },

      {
        $sort: { joinedDate: -1 },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },

      {
        $project: {
          username: 1,
          email: 1,
          verified: 1,
          blocked: 1,
          joinedDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$joinedDate",
            },
          },
        },
      },
    ]);

    const totalUsersMatchQuery = await User.aggregate([
      {
        $match: filterQuery,
      },
    ]);

    const totalUsers = totalUsersMatchQuery.length;

    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(HttpStatusCode.Ok).json({ users, totalPages });
    
  } catch (err) {
    console.log(err);

    next(err);
  }
};

export const addNewUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userData = req.body;

    const validationResult = AddUserSchema.safeParse(userData);

    if (!validationResult.success) {
      const validationError: ZodError = validationResult.error;

      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: validationError.errors[0].message });
    }

    if (validationResult.success) {
      const { email, username, password, phone } = validationResult.data;

      const duplicate = await User.findOne({ email });

      if (duplicate) return res.sendStatus(HTTP_STATUS_CODES.CONFLICT); // Conflict

      const hashedPwd = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        password: hashedPwd,
        email,
        verified: true,
        phone,
      });

      newUser.save();

      res.status(HTTP_STATUS_CODES.CREATED).json({ userId: newUser._id, email: newUser.email });
    }
  } catch (err) {
    console.log(err);

    next(err);
  }
};

export const getUserDataHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let userID = req.params.userID;

    const user = await User.findById(userID);

    if (!user) {
      return res
        .status(HTTP_STATUS_CODES.BAD_REQUEST)
        .json({ message: "Invalid UserID Failed To Fetch Data" });
    }

    return res.status(HttpStatusCode.Ok).json({ user });
  } catch (err) {
    console.log(err);

    next(err);
  }
};

export const editUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userData = req.body;

    const userID = req.params.userID;

    const validationResult = EditUserSchema.safeParse(userData);

    if (!validationResult.success) {
      const validationError: ZodError = validationResult.error;

      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: validationError.errors[0].message });
    }

    if (validationResult.success) {
      const { email, username, phone } = validationResult.data;

      const updatedUser = await User.findByIdAndUpdate(userID, {
        username,
        email,
        phone,
      });

      if (!updatedUser) {
        res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "Failed to Update User" });
      }

      res.status(HttpStatusCode.Ok).json({ message: "success" });
    }
  } catch (err) {
    console.log(err);

    next(err);
  }
};

export const blockUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = req.params.userID;

    const updatedUser = await User.findByIdAndUpdate(userID, {
      blocked: true,
    });

    if (!updatedUser) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "Failed to Block User" });
    }

    res.status(HttpStatusCode.Ok).json({ message: "success" });
  } catch (err) {
    console.log(err);

    next(err);
  }
};

export const unBlockUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = req.params.userID;

    const updatedUser = await User.findByIdAndUpdate(userID, {
      blocked: false,
    });

    if (!updatedUser) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "Failed to Block User" });
    }

    res.status(HttpStatusCode.Ok).json({ message: "success" });
  } catch (err) {
    console.log(err);

    next(err);
  }
};
