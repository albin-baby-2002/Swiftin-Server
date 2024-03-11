import { NextFunction, Request, Response } from "express";

import { HotelListing } from "../../Models/hotelLisitingModal";
import { HotelReservation } from "../../Models/reservationModal";

interface GetReservationsQuery {
  search: string;
  page: number;
}

export const getAllReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let queryParams = req.query as unknown as GetReservationsQuery;

    let search = "";

    if (queryParams.search) {
      search = queryParams.search.trim();
    }

    let page = 1;

    if (Number(queryParams.page)) {
      page = Number(queryParams.page);
    }

    let limit = 5;

    let filterQuery = { hotelName: {} };

    filterQuery.hotelName = { $regex: search, $options: "i" };

    console.log(" page number ", page);

    const reservations = await HotelReservation.aggregate([
      {
        $lookup: {
          from: "hotellistings",
          localField: "listingID",
          foreignField: "_id",
          as: "listingData",
        },
      },
      {
        $unwind: { path: "$listingData", preserveNullAndEmptyArrays: true },
      },

      {
        $project: {
          userID: 1,
          listingID: 1,
          checkInDate: 1,
          checkOutDate: 1,
          reservationFee: 1,
          rooms: 1,
          paymentStatus: 1,
          reservationStatus: 1,
          mainImage: "$listingData.mainImage",
          address: "$listingData.address",
        },
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
        $project: {
          userID: 1,
          listingID: 1,
          checkInDate: 1,
          checkOutDate: 1,
          reservationFee: 1,
          rooms: 1,
          paymentStatus: 1,
          reservationStatus: 1,
          mainImage: 1,
          hotelName: "$addressData.addressLine",
          location: "$addressData.state",
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
    ]);

    // console.log("\t \t \t \t", properties, "get properties");

    const totalReservationMatchingQuery = await HotelReservation.aggregate([
      {
        $lookup: {
          from: "hotellistings",
          localField: "listingID",
          foreignField: "_id",
          as: "listingData",
        },
      },
      {
        $unwind: { path: "$listingData", preserveNullAndEmptyArrays: true },
      },

      {
        $project: {
          userID: 1,
          listingID: 1,
          address: "$listingData.address",
        },
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
        $project: {
          userID: 1,
          listing: 1,

          hotelName: "$addressData.addressLine",
        },
        
      },
      {
        $match: filterQuery,
      },
    ]);

    const totalReservations = totalReservationMatchingQuery.length;

    const totalPages = Math.ceil(totalReservations / limit);

    return res.status(200).json({ reservations, totalPages });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
