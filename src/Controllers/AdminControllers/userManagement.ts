import { NextFunction, Request, Response } from "express";
import User from "../../Models/userModel";
import mongoose from "mongoose";

interface GetUsersQuery {
  search: string;
  page: number;
}

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

    let limit = 20;

    let filterQuery = { username: {}, "roles.Admin": { $exists: false } };

    filterQuery.username = { $regex: search, $options: "i" };

    console.log(" page number ", page);

    const users = await User.aggregate([
      {
        $match: filterQuery,
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

    return res.status(200).json({ users });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
