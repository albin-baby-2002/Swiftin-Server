"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPropertyHandler = void 0;
const zod_1 = require("zod");
const HotelListingSchema = zod_1.z.object({
    addressLine: zod_1.z.string().min(3, " Min length For address is 3").max(20),
    city: zod_1.z.string().min(3, " Min length For city is 3").max(15),
    district: zod_1.z.string().min(3, " Min length For district is 3").max(15),
    state: zod_1.z.string().min(3, " Min length is 3").max(15),
    totalRooms: zod_1.z.number().min(1),
    maxGuests: zod_1.z.number().min(1),
    bedsPerRoom: zod_1.z.number().min(1),
    bathroomPerRoom: zod_1.z.number().min(1),
    amenities: zod_1.z.array(zod_1.z.string()),
    hotelLicenseUrl: zod_1.z.string().min(1),
    aboutHotel: zod_1.z.string().min(20),
    listingTitle: zod_1.z.string().min(10).max(20),
    roomType: zod_1.z.string().min(3),
    rentPerNight: zod_1.z.number().min(1000),
    mainImage: zod_1.z.string().refine((value) => {
        return value;
    }, "Main Img Is Compulsory"),
    otherImages: zod_1.z.array(zod_1.z.string()).refine((values) => {
        let pics = values.filter((val) => val);
        return pics.length >= 4;
    }, "Needed Four Other Images"),
    pinCode: zod_1.z.string().refine((value) => {
        const INDIAN_PINCODE_REGEX = /^[1-9][0-9]{5}$/;
        return INDIAN_PINCODE_REGEX.test(value);
    }, "Invalid Indian Pincode"),
});
const listPropertyHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const propertyListingData = req.body;
        const validationResult = HotelListingSchema.safeParse(propertyListingData);
        if (!validationResult.success) {
            const validationError = validationResult.error;
            res.status(400).json({ message: validationError.errors[0].message });
        }
        if (validationResult.success) {
            const { addressLine, district, city, state, pinCode, totalRooms, maxGuests, bedsPerRoom, bathroomPerRoom, amenities, mainImage, otherImages, listingTitle, roomType, hotelLicenseUrl, aboutHotel, rentPerNight, } = validationResult.data;
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.listPropertyHandler = listPropertyHandler;
