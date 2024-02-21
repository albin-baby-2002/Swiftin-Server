import { NextFunction, Request, Response } from "express";

import { ZodError, z } from "zod";

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

export const listPropertyHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const propertyListingData = req.body;

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
    }
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
