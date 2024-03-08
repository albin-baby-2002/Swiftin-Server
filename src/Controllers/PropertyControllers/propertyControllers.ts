import { NextFunction, Request, Response } from "express";

import { ZodError, z } from "zod";
import { HotelAddress } from "../../Models/hotelAddressModel";

import { HotelListing } from "../../Models/hotelLisitingModal";
import { HotelReservation } from "../../Models/reservationModal";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import { RazorPayDetails } from "../../Models/razorPayDetailsModal";
import { ListingData } from "../GeneralData/LisitingData";
import { User } from "../../Models/userModel";
import { Review } from "../../Models/reviewModel";

const HotelListingSchema = z.object({
  addressLine: z.string().min(3, " Min length For address is 3").max(20),
  city: z.string().min(3, " Min length For city is 3").max(15),
  district: z.string().min(3, " Min length For district is 3").max(15),
  state: z.string().min(3, " Min length is 3").max(15),
  totalRooms: z.number().min(1),
  maxGuests: z.number().min(1),
  bedsPerRoom: z.number().min(1),
  bathroomPerRoom: z.number().min(1),
  amenities: z.array(z.string()),
  hotelLicenseUrl: z.string().min(1),
  aboutHotel: z.string().min(20),
  listingTitle: z.string().min(10).max(60),
  roomType: z.string().min(3),
  rentPerNight: z.number().min(1000),

  mainImage: z.string().refine((value) => {
    return value;
  }, "Main Img Is Compulsory"),

  otherImages: z.array(z.string()).refine((values) => {
    let pics = values.filter((val) => val);

    return pics.length >= 4;
  }, "Needed Four Other Images"),

  pinCode: z.string().refine((value) => {
    const INDIAN_PINCODE_REGEX = /^[1-9][0-9]{5}$/;
    return INDIAN_PINCODE_REGEX.test(value);
  }, "Invalid Indian Pincode"),
});

type propertyListingData = z.infer<typeof HotelListingSchema>;

export interface CustomRequest extends Request {
  userInfo?: {
    id: string;
    username: string;
    roles: number[];
  };
}

interface GetListingsReservationsQuery {
  search: string;
  page: number;
}

export const listPropertyHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const propertyListingData = req.body;

    console.log("\t \t \t \t ", propertyListingData, "...listing ");

    const validationResult = HotelListingSchema.safeParse(propertyListingData);

    if (!validationResult.success) {
      const validationError: ZodError = validationResult.error;

      res.status(400).json({ message: validationError.errors[0].message });
    }

    if (validationResult.success) {
      const {
        addressLine,
        district,
        city,
        state,
        pinCode,
        totalRooms,
        maxGuests,
        bedsPerRoom,
        bathroomPerRoom,
        amenities,
        mainImage,
        otherImages,
        listingTitle,
        roomType,
        hotelLicenseUrl,
        aboutHotel,
        rentPerNight,
      } = validationResult.data;

      let userID = req.userInfo?.id;

      if (!userID)
        throw new Error("Failed to identify user from req.userInfo.Id");

      let newListing = new HotelListing({
        userID,
        totalRooms,
        maxGuestsPerRoom: maxGuests,
        bedsPerRoom,
        bathroomPerRoom,
        amenities,
        mainImage,
        otherImages,
        listingTitle,
        roomType,
        hotelLicenseUrl,
        aboutHotel,
        rentPerNight,
      });

      await newListing.save();

      let hotelAddress = new HotelAddress({
        listingID: newListing._id,
        userID,
        addressLine,
        city,
        district,
        state,
        pinCode,
      });

      await hotelAddress.save();

      newListing.address = hotelAddress._id;

      await newListing.save();

      return res.status(201).json({ message: "new Listing created" });
    }
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const checkAvailability = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(400).json({ message: "failed to identify user " });
    }

    let { listingID, checkInDate, checkOutDate, rooms } = req.body;

    listingID = new mongoose.Types.ObjectId(listingID);

    if (!listingID || !checkInDate || !checkOutDate || !rooms) {
      return res.status(400).json({
        message: "Failed : all data fields are necessary . Try Again ",
      });
    }

    let listingData = await HotelListing.findById(listingID);

    if (!listingData)
      return res.status(400).json({ message: "failed to identify listing " });

    if (
      !listingData.approvedForReservation ||
      !listingData.isActiveForReservation
    ) {
      return res
        .status(400)
        .json({ message: "Sorry the property is not available for listing " });
    }

    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);

    let dateWiseReservation: { [key: string]: number } =
      listingData.dateWiseReservationData || {};

    for (
      let date = new Date(startDate);
      date < endDate;
      date.setDate(date.getDate() + 1)
    ) {
      let dateString = new Date(date).toISOString().split("T")[0];

      if (!dateWiseReservation.hasOwnProperty(dateString)) {
        dateWiseReservation[dateString] = rooms;
      } else {
        let existingValue = dateWiseReservation[dateString];

        if (existingValue + rooms > listingData.totalRooms) {
          return res.status(400).json({
            message:
              "Unfortunately adequate rooms  not  available in given days",
          });
        }

        dateWiseReservation[dateString] = existingValue + rooms;
      }
    }

    return res
      .status(200)
      .json({ message: " Success: Rooms are available for the given days" });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const createReservationOrderHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("instance");

    let KEY_ID = await process.env.RAZORPAY_KEY_ID;
    let KEY_SECRET = await process.env.RAZORPAY_KEY_SECRET;

    console.log("instance", KEY_ID, KEY_SECRET);
    if (!KEY_ID || !KEY_SECRET) {
      return res.sendStatus(500);
    }

    const instance = await new Razorpay({
      key_id: KEY_ID,
      key_secret: KEY_SECRET,
    });

    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(400).json({ message: "failed to identify host " });
    }

    let { listingID, checkInDate, checkOutDate, rooms } = req.body;

    listingID = new mongoose.Types.ObjectId(listingID);

    if (!listingID || !checkInDate || !checkOutDate || !rooms) {
      return res.status(400).json({
        message: "Failed : all data fields are necessary . Try Again ",
      });
    }

    let listingData = await HotelListing.findById(listingID);

    if (!listingData)
      return res.status(400).json({ message: "failed to identify listing " });

    if (
      !listingData.approvedForReservation ||
      !listingData.isActiveForReservation
    ) {
      return res
        .status(400)
        .json({ message: "Sorry the property is not available for listing " });
    }

    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);

    let numberOfDays = 0;

    let dateWiseReservation: { [key: string]: number } =
      listingData.dateWiseReservationData || {};

    for (
      let date = new Date(startDate);
      date < endDate;
      date.setDate(date.getDate() + 1)
    ) {
      let dateString = new Date(date).toISOString().split("T")[0];

      if (!dateWiseReservation.hasOwnProperty(dateString)) {
        dateWiseReservation[dateString] = rooms;
      } else {
        let existingValue = dateWiseReservation[dateString];

        if (existingValue + rooms > listingData.totalRooms) {
          return res.status(400).json({
            message:
              "Unfortunately adequate rooms  not  available in given days",
          });
        }

        dateWiseReservation[dateString] = existingValue + rooms;
      }

      numberOfDays++;
    }

    console.log("instance after day");

    listingData.dateWiseReservationData = dateWiseReservation;

    const response = await HotelListing.findByIdAndUpdate(listingID, {
      dateWiseReservationData: dateWiseReservation,
    });

    console.log(response);

    const fee = (listingData?.rentPerNight * numberOfDays * rooms * 10) / 100;

    const reservationData = new HotelReservation({
      userID,
      listingID,
      checkInDate,
      checkOutDate,
      rooms,
      reservationFee: fee,
      paymentStatus: "pending",
      reservationStatus: "paymentPending",
    });

    await reservationData.save();

    let reservationID = reservationData.id;

    await HotelListing.findByIdAndUpdate(listingID, {
      $push: { reservations: reservationID },
    });

    const amount = reservationData.reservationFee * 100;

    const receipt = reservationData._id.toString();

    const currency = "INR";

    const options = {
      amount: amount,
      currency: currency,
      receipt: receipt,
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500);

    reservationData.razorpayOrderID = order.id;

    await reservationData.save();

    return res.status(200).json({
      message: "successfully made reservation",
      order,
      reservationID: reservationData._id,
    });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const validatePaymentAndCompleteReservation = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("instance");

    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(400).json({ message: "failed to identify host " });
    }

    let {
      reservationID,
      listingID,
      amount,
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    reservationID = new mongoose.Types.ObjectId(reservationID);

    listingID = new mongoose.Types.ObjectId(listingID);

    if (
      !listingID ||
      !reservationID ||
      !amount ||
      !orderCreationId ||
      !razorpayPaymentId ||
      !razorpayOrderId ||
      !razorpaySignature
    ) {
      return res.status(400).json({
        message: "Failed : all data fields are necessary . Try Again ",
      });
    }

    let listingData = await HotelListing.findById(listingID);

    if (!listingData)
      return res.status(400).json({ message: "failed to identify listing " });

    if (
      !listingData.approvedForReservation ||
      !listingData.isActiveForReservation
    ) {
      return res
        .status(400)
        .json({ message: "Sorry the property is not available for listing " });
    }

    let reservationData = await HotelReservation.findById(reservationID);

    if (!reservationData)
      return res
        .status(400)
        .json({ message: "failed to find the reservation data " });

    console.log(
      new mongoose.Types.ObjectId(reservationData.listingID).equals(listingID),
      "first"
    );

    console.log(reservationData.razorpayOrderID == orderCreationId, "second");

    console.log(
      reservationData.reservationFee * 100 == Number(amount),
      "third"
    );

    if (
      !new mongoose.Types.ObjectId(reservationData.listingID).equals(
        listingID
      ) ||
      reservationData.razorpayOrderID !== orderCreationId ||
      reservationData.reservationFee * 100 !== Number(amount)
    ) {
      return res
        .status(400)
        .json({ message: "failed to validate payment data inconsistency" });
    }

    const paymentDetails = new RazorPayDetails({
      userID,
      listingID,
      reservationID,
      amountPaid: amount,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    });

    await paymentDetails.save();

    reservationData.paymentStatus = "paid";
    reservationData.reservationStatus = "success";

    await reservationData.save();

    return res.status(200).json({ message: "payment verified successfully" });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const getAllUserBookings = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("instance");

    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(400).json({ message: "failed to identify user " });
    }

    const data = await HotelReservation.aggregate([
      {
        $match: {
          userID: userID,
          reservationStatus: "success",
        },
      },
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
          checkInDate: {
            $dateToString: {
              format: "%d-%m-%Y",
              date: "$checkInDate",
            },
          },
          checkOutDate: {
            $dateToString: {
              format: "%d-%m-%Y",
              date: "$checkOutDate",
            },
          },

          rooms: 1,
          maxGuests: "$listingData.maxGuestsPerRoom",
          image: "$listingData.mainImage",
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
    ]);

    console.log(data);
    return res.status(200).json({ bookings: data });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const cancelReservationHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("instance");

    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(400).json({ message: "failed to identify user " });
    }

    const reservationID = new mongoose.Types.ObjectId(req.params.reservationID);

    if (!reservationID) {
      return res
        .status(400)
        .json({ message: "failed to identify reservation " });
    }

    const reservation = await HotelReservation.findOne({
      _id: reservationID,
      userID,
    });

    if (!reservation) {
      return res.status(400).json({
        message: "failed to identify the specific reservation of user",
      });
    }

    const listingID = reservation.listingID;

    let listingData = await HotelListing.findById(listingID);

    if (!listingData)
      return res.status(400).json({ message: "failed to identify listing " });

    if (!reservation.checkInDate || !reservation.checkOutDate) {
      return res
        .status(400)
        .json({ message: "failed to get reservationData " });
    }

    const startDate = new Date(reservation.checkInDate);
    const endDate = new Date(reservation.checkOutDate);

    let dateWiseReservation: { [key: string]: number } =
      listingData.dateWiseReservationData || {};

    let roomsBooked = reservation.rooms;

    for (
      let date = new Date(startDate);
      date < endDate;
      date.setDate(date.getDate() + 1)
    ) {
      let dateString = new Date(date).toISOString().split("T")[0];

      if (dateWiseReservation.hasOwnProperty(dateString)) {
        let existingValue = dateWiseReservation[dateString];

        if (existingValue >= roomsBooked) {
          dateWiseReservation[dateString] = existingValue - roomsBooked;
        }
      }
    }

    const updatedListingData = await HotelListing.findByIdAndUpdate(listingID, {
      dateWiseReservationData: dateWiseReservation,
    });

    reservation.reservationStatus = "cancelled";

    await reservation.save();

    await User.findByIdAndUpdate(userID, {
      $inc: { wallet: reservation.reservationFee },
    });

    reservation.paymentStatus = "refunded";

    await reservation.save();

    return res
      .status(200)
      .json({ message: "reservation cancelled successFully" });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const getAllListingsReservations = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(400).json({ message: "failed to identify host " });
    }

    let queryParams = req.query as unknown as GetListingsReservationsQuery;

    let search = "";

    if (queryParams.search) {
      search = queryParams.search.trim();
    }

    let page = 1;

    if (Number(queryParams.page)) {
      page = Number(queryParams.page);
    }

    let limit = 5;

    let filterQuery = {
      hotelName: {},

      hostID: userID,
    };

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
        $lookup: {
          from: "hoteladdresses",
          localField: "listingData.address",
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
          as: "userData",
        },
      },

      {
        $unwind: { path: "$userData", preserveNullAndEmptyArrays: true },
      },

      {
        $project: {
          checkInDate: {
            $dateToString: {
              format: "%d-%m-%Y",
              date: "$checkInDate",
            },
          },
          checkOutDate: {
            $dateToString: {
              format: "%d-%m-%Y",
              date: "$checkOutDate",
            },
          },

          reservationFee: 1,
          rooms: 1,
          paymentStatus: 1,
          reservationStatus: 1,
          hostID: "$listingData.userID",
          image: "$listingData.mainImage",
          hotelName: "$addressData.addressLine",
          customerName: "$userData.username",
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

    const totalReservations = await HotelReservation.aggregate([
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
        $lookup: {
          from: "hoteladdresses",
          localField: "listingData.address",
          foreignField: "_id",
          as: "addressData",
        },
      },

      {
        $unwind: { path: "$addressData", preserveNullAndEmptyArrays: true },
      },

      {
        $project: {
          hostID: "$listingData.userID",
          hotelName: "$addressData.addressLine",
        },
      },
      {
        $match: filterQuery,
      },
    ]);

    console.log(totalReservations);

    const totalPages = Math.ceil(totalReservations.length / limit);

    return res.status(200).json({ reservations, totalPages });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const hostCancelReservation = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("instance");

    const hostID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!hostID) {
      return res.status(400).json({ message: "failed to identify user " });
    }

    const reservationID = new mongoose.Types.ObjectId(req.params.reservationID);

    if (!reservationID) {
      return res
        .status(400)
        .json({ message: "failed to identify reservation " });
    }

    type TreservationData = {
      userID: string;
      listingID: string;
      hostID: string;
      hotelName: string;
      checkInDate: string;
      checkOutDate: string;
      rooms: number;
      reservationFee: number;
    };

    let reservationData: TreservationData[] = await HotelReservation.aggregate([
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
          rooms: 1,
          reservationFee: 1,
          hostID: "$listingData.userID",
          hotelName: "$addressData.addressLine",
        },
      },
      {
        $match: { hostID, _id: reservationID },
      },
    ]);

    if (!reservationData) {
      return res.status(400).json({
        message: "failed to identify the specific reservation ",
      });
    }

    let reservation = reservationData[0];
    // console.log(reservationData);

    const listingID = reservation.listingID;

    let listingData = await HotelListing.findById(listingID);

    if (!listingData)
      return res.status(400).json({ message: "failed to identify listing " });

    if (!reservation.checkInDate || !reservation.checkOutDate) {
      return res
        .status(400)
        .json({ message: "failed to get reservationData " });
    }

    const startDate = new Date(reservation.checkInDate);
    const endDate = new Date(reservation.checkOutDate);

    let dateWiseReservation: { [key: string]: number } =
      listingData.dateWiseReservationData || {};

    let roomsBooked = reservation.rooms;

    for (
      let date = new Date(startDate);
      date < endDate;
      date.setDate(date.getDate() + 1)
    ) {
      let dateString = new Date(date).toISOString().split("T")[0];

      if (dateWiseReservation.hasOwnProperty(dateString)) {
        let existingValue = dateWiseReservation[dateString];

        if (existingValue >= roomsBooked) {
          dateWiseReservation[dateString] = existingValue - roomsBooked;
        }
      }
    }

    console.log(dateWiseReservation, "after \t \t");

    const updatedListingData = await HotelListing.findByIdAndUpdate(
      listingID,
      {
        dateWiseReservationData: dateWiseReservation,
      },
      { new: true }
    );

    console.log(updatedListingData, "updated listing \t \t");

    const updatedUserData = await User.findByIdAndUpdate(
      reservation.userID,
      {
        $inc: { wallet: reservation.reservationFee },
      },
      { new: true }
    );

    console.log(updatedUserData, "updated listing \t \t");

    let updatedReservation = await HotelReservation.findByIdAndUpdate(
      reservationID,
      { reservationStatus: "cancelled", paymentStatus: "refunded" },
      { new: true }
    );
    console.log(updatedReservation, "updated listing \t \t");

    return res
      .status(200)
      .json({ message: "reservation cancelled successFully" });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const getWishlistData = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(400).json({ message: "failed to identify user " });
    }

    const wishLists = await User.aggregate([
      {
        $match: {
          _id: userID,
        },
      },
      {
        $project: {
          wishlist: 1,
        },
      },
      {
        $lookup: {
          from: "hotellistings",
          localField: "wishlist",
          foreignField: "_id",
          as: "wishlistData",
        },
      },

      {
        $project: {
          wishlistData: 1,
          hasValue: {
            $cond: {
              if: { $eq: [{ $size: "$wishlistData" }, 0] },
              then: false,
              else: true,
            },
          },
        },
      },

      {
        $match: { hasValue: true },
      },
      {
        $unwind: { path: "$wishlistData", preserveNullAndEmptyArrays: true },
      },

      {
        $replaceRoot: {
          newRoot: "$wishlistData",
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
          mainImage: 1,
          hotelName: "$addressData.addressLine",
        },
      },
    ]);

    console.log(wishLists);

    return res.status(200).json({ wishLists });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

// add to wishlist

export const AddToWishlist = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(400).json({ message: "failed to identify user " });
    }

    let listingID = new mongoose.Types.ObjectId(req.params.listingID);

    const userData = await User.findById(userID);

    if (!listingID) {
      return res.status(400).json({
        message: "Failed to identify  the listingID. Try Again ",
      });
    }

    let listingData = await HotelListing.findById(listingID);

    if (!listingData)
      return res.status(400).json({ message: "failed to identify listing " });

    if (
      !listingData.approvedForReservation ||
      !listingData.isActiveForReservation
    ) {
      return res
        .status(400)
        .json({ message: "Sorry the property is not available now " });
    }

    if (
      userData?.wishlist.includes(
        listingID as unknown as mongoose.Schema.Types.ObjectId
      )
    )
      return res
        .status(400)
        .json({ message: "Hotel already exist in wishlist" });

    const updatedUser = await User.findByIdAndUpdate(userID, {
      $push: {
        wishlist: listingID,
      },
    });

    return res.status(200).json({
      message: "successfully added to wishlist",
    });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

// remove from wishlist

export const removeFromWishlist = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(400).json({ message: "failed to identify user " });
    }

    let listingID = new mongoose.Types.ObjectId(req.params.listingID);

    const userData = await User.findById(userID);

    if (!listingID) {
      return res.status(400).json({
        message: "Failed to identify  the listingID. Try Again ",
      });
    }

    let listingData = await HotelListing.findById(listingID);

    if (!listingData)
      return res.status(400).json({ message: "failed to identify listing " });

    if (
      !userData?.wishlist.includes(
        listingID as unknown as mongoose.Schema.Types.ObjectId
      )
    )
      return res
        .status(400)
        .json({ message: "Hotel already removed from  wishlist" });

    const updatedUser = await User.findByIdAndUpdate(userID, {
      $pull: {
        wishlist: listingID,
      },
    });

    return res.status(200).json({
      message: "successfully removed from wishlist",
    });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const addReview = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(400).json({ message: "failed to identify user " });
    }

    let listingID = new mongoose.Types.ObjectId(req.params.listingID);

    const userData = await User.findById(userID);

    if (!listingID) {
      return res.status(400).json({
        message: "Failed to identify  the listingID. Try Again ",
      });
    }

    let listingData = await HotelListing.findById(listingID);

    if (!listingData)
      return res.status(400).json({ message: "failed to identify listing " });

    const { rating, reviewMessage } = req.body;

    if (!rating || !reviewMessage) {
      return res.status(400).json({ message: "All fields are mandatory " });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating value should be between 1 and 5 " });
    }

    const existingReview = await Review.find({ userID, listingID });

    if (existingReview.length >= 1) {
      return res
        .status(400)
        .json({ message: "You already made a review on this property " });
    }

    let AvgRating = listingData.AvgRating;

    let totalReviews = listingData.reviews.length;

    AvgRating = (AvgRating * totalReviews + rating) / (totalReviews + 1);

    const review = new Review({
      userID,
      listingID,
      rating,
      reviewMessage,
    });

    await review.save();

    const updatedListing = await HotelListing.findByIdAndUpdate(listingID, {
      AvgRating,
      $push: { reviews: review._id },
    });

    console.log(updatedListing);
    return res.status(200).json({ message: "review added" });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
