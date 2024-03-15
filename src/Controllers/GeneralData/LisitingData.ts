import { NextFunction, Request, Response } from "express";

import mongoose from "mongoose";
import { HotelListing } from "../../Models/hotelLisitingModal";
import { Review } from "../../Models/reviewModel";
import { HTTP_STATUS_CODES } from "../../Enums/statusCodes";

interface CustomRequest extends Request {
  userInfo?: {
    id: string;
    username: string;
    roles: number[];
  };
}

export const ListingDataHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const listingID = new mongoose.Types.ObjectId(req.params.listingID);

    if (!listingID) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify listing " });
    }

    let filterQuery = { _id: listingID };

    const listing = await HotelListing.aggregate([
      {
        $match: filterQuery,
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
          maxGuestsPerRoom: 1,
          listingTitle: 1,
          bedsPerRoom: 1,
          bathroomPerRoom: 1,
          roomType: 1,
          aboutHotel: 1,
          rentPerNight: 1,
          mainImage: 1,
          otherImages: 1,
          hostID: "$hostData._id",
          host: "$hostData.username",
          hostImg: "$hostData.image",
          hotelName: "$addressData.addressLine",
          city: "$addressData.city",
          district: "$addressData.district",
          state: "$addressData.state",
          pinCode: "$addressData.pinCode",
        },
      },
    ]);

    const reviewData = await Review.aggregate([
      {
        $match: {
          listingID: listingID,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: { path: "$userData", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          userID: 1,
          listingID: 1,
          rating: 1,
          reviewMessage: 1,
          username: "$userData.username",
          image: "$userData.image",
        },
      },
    ]);


    return res.status(HTTP_STATUS_CODES.OK).json({ listing: listing[0], reviewData });
  } catch (err) {
    console.log(err);

    next(err);
  }
};
