import { NextFunction, Request, Response } from "express";

import { ZodError, z } from "zod";
import { HotelAddress } from "../../Models/hotelAddressModel";

import { HotelListing } from "../../Models/hotelLisitingModal";
import { HotelReservation } from "../../Models/reservationModal";
import mongoose from "mongoose";

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

export const reservePropertyHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
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

    listingData.dateWiseReservationData = dateWiseReservation;

    const response = await HotelListing.findByIdAndUpdate(listingID, {
      dateWiseReservationData: dateWiseReservation,
    });

    console.log(response);

    const fee = listingData?.rentPerNight * numberOfDays * rooms;

    const reservationData = new HotelReservation({
      userID,
      listingID,
      checkInDate,
      checkOutDate,
      rooms,
      feePaid: fee,
    });

    await reservationData.save();

    return res.status(200).json({ message: "successfully made reservation" });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
