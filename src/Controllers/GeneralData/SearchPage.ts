import { NextFunction, Request, Response } from "express";

import mongoose from "mongoose";
import { HotelListing } from "../../Models/hotelLisitingModal";
import { z } from "zod";

interface SearchQuery {
  search: string;
  page: number;
  rooms: number;
  guests: number;
  sortBy: "highToLow" | "lowToHigh";
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
      console.log("yes");
      search = queryParams.search.trim();
    }

    let page = 1;

    if (Number(queryParams.page)) {
      page = Number(queryParams.page);
    }

    let rooms = 1;

    if (Number(queryParams.rooms)) {
      rooms = Number(queryParams.rooms);
    }

    let guests = 1;

    if (Number(queryParams.guests)) {
      guests = Number(queryParams.guests);
    }

    let sortBy: -1 | 1 = -1;

    if (queryParams.sortBy) {
      let sort = queryParams.sortBy.trim();

      if (sort === "highToLow") {
        sortBy = -1;
      } else {
        sortBy = 1;
      }
    }

    let limit = 4;

    console.log(search, "search");

    let filterQuery = {
      $or: [
        { state: { $regex: search, $options: "i" } },
        { district: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ],
      totalRooms: { $gte: rooms },
      maxGuestsPerRoom: { $gte: guests },
      approvedForReservation: true,
      isActiveForReservation: true,
    };

    const properties = await HotelListing.aggregate([
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
          maxGuestsPerRoom: 1,
          roomType: 1,
          approvedForReservation: 1,
          isActiveForReservation: 1,
          rentPerNight: 1,
          hostName: "$hostData.username",
          city: "$addressData.city",
          district: "$addressData.district",
          state: "$addressData.state",
          location: "$addressData.city",
          buildingName: "$addressData.addressLine",
        },
      },
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
        $sort: { rentPerNight: sortBy },
      },
    ]);

    const totalPropertiesMatchingQuery = await HotelListing.aggregate([
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
        $project: {
          totalRooms: 1,
          maxGuestsPerRoom: 1,
          approvedForReservation: 1,
          isActiveForReservation: 1,
          city: "$addressData.city",
          district: "$addressData.district",
          state: "$addressData.state",
        },
      },
      {
        $match: filterQuery,
      },
    ]);

    const totalProperties = totalPropertiesMatchingQuery.length;

    const totalPages = Math.ceil(totalProperties / limit);

    return res
      .status(200)
      .json({ properties, totalPages, totalHotels: totalProperties });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
