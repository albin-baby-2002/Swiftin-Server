import { NextFunction, Request, Response } from "express";

import { HotelListing } from "../../Models/hotelLisitingModal";
import { HTTP_STATUS_CODES } from "../../Enums/statusCodes";
import { TGetReqQuery } from "../../Types/getReqQueryType";



export const getAllHostsHandler = async (
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

    let filterQuery = { username: {} };

    filterQuery.username = { $regex: search, $options: "i" };

    const hosts = await HotelListing.aggregate([
      {
        $group: { _id: "$userID", listings: { $sum: 1 } },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: { path: "$userData", preserveNullAndEmptyArrays: true },
      },

      {
        $project: {
          username: "$userData.username",
          email: "$userData.email",
          blocked: "$userData.blocked",
          joinedDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$userData.joinedDate",
            },
          },
          listings: 1,
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    const totalHosts = await HotelListing.aggregate([
      {
        $group: { _id: "$userID", listings: { $sum: 1 } },
      },
    ]);

    const total = totalHosts.length;

    const totalPages = Math.ceil(total / limit);

    return res.status(HTTP_STATUS_CODES.OK).json({ hosts, totalPages });
  } catch (err) {
    console.log(err);

    next(err);
  }
};
