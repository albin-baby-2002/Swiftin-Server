import { NextFunction, Request, Response } from "express";
import { HotelReservation } from "../../Models/reservationModal";
import { TGetReqQuery } from "../../Types/getReqQueryType";
import { HTTP_STATUS_CODES } from "../../Enums/statusCodes";


export const getAllReservationsHandler = async (
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

    let filterQuery = { hotelName: {} };

    filterQuery.hotelName = { $regex: search, $options: "i" };


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

    return res.status(HTTP_STATUS_CODES.OK).json({ reservations, totalPages });
  } catch (err) {
    console.log(err);

    next(err);
  }
};
