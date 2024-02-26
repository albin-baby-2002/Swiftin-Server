import { NextFunction, Request, Response } from "express";

import mongoose from "mongoose";
import { HotelListing } from "../../Models/hotelLisitingModal";
import { z } from "zod";

interface SearchQuery {
  search: string;
  page: number;
}

interface CustomRequest extends Request {
  userInfo?: {
    id: string;
    username: string;
    roles: number[];
  };
}

export const hotelDataBySearch = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let queryParams = req.query as unknown as SearchQuery;

    let search = "";

    if (queryParams.search) {
      search = queryParams.search.trim();
    }

    let page = 1;

    if (Number(queryParams.page)) {
      page = Number(queryParams.page);
    }

    let limit = 5;

    let filterQuery = { listingTitle: {} };

    filterQuery.listingTitle = { $regex: search, $options: "i" };

    const properties = await HotelListing.aggregate([
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
        $lookup: {
          from: "hoteladdresses",
          localField: "address",
          foreignField: "_id",
          as: "addressData",
        },
      },

      {
        $unwind: { path: "$addressData", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "hostData",
        },
      },

      {
        $unwind: { path: "$hostData", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          totalRooms: 1,
          amenities: 1,
          mainImage: 1,
          listingTitle: 1,
          roomType: 1,
          approvedForReservation: 1,
          isActiveForReservation: 1,
          rentPerNight: 1,
          hostName: "$hostData.username",
          location: "$addressData.city",
          buildingName: "$addressData.addressLine",
        },
      },
    ]);

    const totalPropertiesMatchingQuery = await HotelListing.aggregate([
      {
        $match: filterQuery,
      },
    ]);

    const totalProperties = totalPropertiesMatchingQuery.length;

    const totalPages = Math.ceil(totalProperties / limit);

    return res.status(200).json({ properties, totalPages });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
