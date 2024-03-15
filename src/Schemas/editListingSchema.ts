import { z } from "zod";

export const EditListingSchema = z.object({
  totalRooms: z.number().min(1),
  maxGuestsPerRoom: z.number().min(1),
  bedsPerRoom: z.number().min(1),
  bathroomPerRoom: z.number().min(1),
  amenities: z.array(z.string()),
  aboutHotel: z.string().min(20),
  listingTitle: z.string().min(10).max(60),
  roomType: z.string().min(3),
  rentPerNight: z.number().min(1000),
});

export const EditListingImageSchema = z.object({
  mainImage: z.string().refine((value) => {
    return value;
  }, "Main Img Is Compulsory"),

  otherImages: z.array(z.string()).refine((values) => {
    let pics = values.filter((val) => val.trim());

    return pics.length >= 4;
  }, "Needed Four Other Images"),
});

export const EditListingAddressSchema = z.object({
  addressLine: z.string().min(3, " Min length For address is 3").max(20),
  city: z.string().min(3, " Min length For city is 3").max(15),
  district: z.string().min(3, " Min length For district is 3").max(15),
  state: z.string().min(3, " Min length is 3").max(15),
  pinCode: z.string().refine((value) => {
    const INDIAN_PINCODE_REGEX = /^[1-9][0-9]{5}$/;
    return INDIAN_PINCODE_REGEX.test(value);
  }, "Invalid Indian Pincode"),
});
