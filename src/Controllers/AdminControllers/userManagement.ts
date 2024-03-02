import { NextFunction, Request, Response } from "express";

import mongoose from "mongoose";
import { ZodError, z } from "zod";
import bcrypt from "bcrypt";
import { User } from "../../Models/userModel";

interface GetUsersQuery {
  search: string;
  page: number;
}

const AddUserSchema = z.object({
  email: z.string().email("Enter a valid email"),
  username: z.string().min(5, "user name should have min 5 character"),
  phone: z
    .string()
    .refine((value) => {
      if (!value) return true;
      const IND_PHONE_REGEX = /^(\+91[\-\s]?)?[6789]\d{9}$/;
      return IND_PHONE_REGEX.test(value);
    }, "Invalid phone . It Should be 10 digits")
    .optional(),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          "minimum 8 char & min one (uppercase & lowercase letter, special char & number)",
      }
    ),
});

const EditUserSchema = z.object({
  email: z.string().email("Enter a valid email"),
  username: z.string().min(5, "user name should have min 5 character"),
  phone: z
    .string()
    .refine((value) => {
      if (!value) return true;

      const IND_PHONE_REGEX = /^(\+91[\-\s]?)?[6789]\d{9}$/;
      return IND_PHONE_REGEX.test(value);
    }, "Invalid phone . It Should be 10 digits")
    .optional(),
});

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let queryParams = req.query as unknown as GetUsersQuery;

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

    console.log(" page number ", page);

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

    return res.status(200).json({ users, totalPages });
  } catch (err: any) {
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

      res.status(400).json({ message: validationError.errors[0].message });
    }

    if (validationResult.success) {
      const { email, username, password, phone } = validationResult.data;

      const duplicate = await User.findOne({ email });

      if (duplicate) return res.sendStatus(409); // Conflict

      const hashedPwd = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        password: hashedPwd,
        email,
        verified: true,
        phone,
      });

      newUser.save();

      res.status(201).json({ userId: newUser._id, email: newUser.email });
    }
  } catch (err: any) {
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
        .status(400)
        .json({ message: "Invalid UserID Failed To Fetch Data" });
    }

    return res.status(200).json({ user });
  } catch (err: any) {
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

      res.status(400).json({ message: validationError.errors[0].message });
    }

    if (validationResult.success) {
      const { email, username, phone } = validationResult.data;

      const updatedUser = await User.findByIdAndUpdate(userID, {
        username,
        email,
        phone,
      });

      if (!updatedUser) {
        res.status(400).json({ message: "Failed to Update User" });
      }

      res.status(200).json({ message: "success" });
    }
  } catch (err: any) {
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
      res.status(400).json({ message: "Failed to Block User" });
    }

    res.status(200).json({ message: "success" });
  } catch (err: any) {
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
      res.status(400).json({ message: "Failed to Block User" });
    }

    res.status(200).json({ message: "success" });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
