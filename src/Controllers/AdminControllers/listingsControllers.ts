import { NextFunction, Request, Response } from "express";

import { HotelListing } from "../../Models/hotelLisitingModal";
import { HTTP_STATUS_CODES } from "../../Enums/statusCodes";
import { TGetReqQuery } from "../../Types/getReqQueryType";



export const getAllListingsHandler = async (
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

    const totalPropertiesMatchingQuery = await HotelListing.aggregate([
      {
        $match: filterQuery,
      },
    ]);

    const totalUsers = totalPropertiesMatchingQuery.length;

    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(HTTP_STATUS_CODES.OK).json({ properties, totalPages });
  } catch (err) {
    console.log(err);

    next(err);
  }
};

export const approveListingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let listingID = req.params.listingID;

    if (!listingID)
      return res
        .status(HTTP_STATUS_CODES.BAD_REQUEST)
        .json({ message: "ListingID not found in params" });

    let listing = await HotelListing.findById(listingID);

    if (listing) {
      if (!listing?.approvedForReservation) {
        listing.approvedForReservation = true;
        listing.isActiveForReservation = true;

        await listing.save();

        return res
          .status(HTTP_STATUS_CODES.OK)
          .json({ message: "property approved for reservation" });
      } else {
        return res
          .status(HTTP_STATUS_CODES.BAD_REQUEST)
          .json({ message: " property already approved" });
      }
    } else {
      return res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to get listing data from db" });
    }
  } catch (err) {
    console.log(err);

    next(err);
  }
};

export const disapproveListingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let listingID = req.params.listingID;

    if (!listingID)
      return res
        .status(HTTP_STATUS_CODES.BAD_REQUEST)
        .json({ message: "ListingID not found in params" });

    let listing = await HotelListing.findById(listingID);

    if (listing) {
      if (listing?.approvedForReservation) {
        listing.approvedForReservation = false;
        listing.isActiveForReservation = false;

        await listing.save();

        return res
          .status(HTTP_STATUS_CODES.OK)
          .json({ message: "property successfully disapproved" });
      } else {
        return res
          .status(HTTP_STATUS_CODES.BAD_REQUEST)
          .json({ message: " property already in disapproval" });
      }
    } else {
      return res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to get listing data from db" });
    }
  } catch (err) {
    console.log(err);

    next(err);
  }
};
