import { NextFunction, Request, Response } from "express";

import { ZodError, z } from "zod";
import { HotelAddress } from "../../Models/hotelAddressModel";

import { HotelListing } from "../../Models/hotelLisitingModal";

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
  listingTitle: z.string().min(10).max(20),
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
