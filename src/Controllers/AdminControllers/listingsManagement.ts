import { NextFunction, Request, Response } from "express";

import mongoose from "mongoose";
import { HotelListing } from "../../Models/hotelLisitingModal";

interface GetListingsQuery {
  search: string;
  page: number;
}

export const getAllListings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let queryParams = req.query as unknown as GetListingsQuery;

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

    console.log(" page number ", page);

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
          userID: 1,
          totalRooms: 1,
          amenities: 1,
          mainImage: 1,
          listingTitle: 1,
          hotelLicenseUrl: 1,
          approvedForReservation: 1,
          isActiveForReservation: 1,
          hostName: "$hostData.username",
          location: "$addressData.city",
          buildingName: "$addressData.addressLine",
        },
      },
    ]);

    console.log("\t \t \t \t", properties, "get properties");

    const totalPropertiesMatchingQuery = await HotelListing.aggregate([
      {
        $match: filterQuery,
      },
    ]);

    const totalUsers = totalPropertiesMatchingQuery.length;

    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json({ properties, totalPages });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const approveListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let listingID = req.params.listingID;

    if (!listingID)
      throw new Error(" Failed to get listingID param for approving listings");

    let listing = await HotelListing.findById(listingID);

    if (listing) {
      if (!listing?.approvedForReservation) {
        listing.approvedForReservation = true;
        listing.isActiveForReservation = true;

        await listing.save();

        return res
          .status(200)
          .json({ message: "property approved for reservation" });
      } else {
        return res.status(400).json({ message: " property already approved" });
      }
    }

    throw new Error("failed to get listing data ");
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const disapproveListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let listingID = req.params.listingID;

    if (!listingID)
      throw new Error(" Failed to get listingID param for approving listings");

    let listing = await HotelListing.findById(listingID);

    if (listing) {
      if (listing?.approvedForReservation) {
        listing.approvedForReservation = false;
        listing.isActiveForReservation = false;

        await listing.save();

        return res
          .status(200)
          .json({ message: "property successfully disapproved" });
      } else {
        return res
          .status(400)
          .json({ message: " property already in disapproval" });
      }
    }

    throw new Error("failed to get listing data ");
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
