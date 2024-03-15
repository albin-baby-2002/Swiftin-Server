"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditListingAddressSchema = exports.EditListingImageSchema = exports.EditListingSchema = void 0;
const zod_1 = require("zod");
exports.EditListingSchema = zod_1.z.object({
    totalRooms: zod_1.z.number().min(1),
    maxGuestsPerRoom: zod_1.z.number().min(1),
    bedsPerRoom: zod_1.z.number().min(1),
    bathroomPerRoom: zod_1.z.number().min(1),
    amenities: zod_1.z.array(zod_1.z.string()),
    aboutHotel: zod_1.z.string().min(20),
    listingTitle: zod_1.z.string().min(10).max(60),
    roomType: zod_1.z.string().min(3),
    rentPerNight: zod_1.z.number().min(1000),
});
exports.EditListingImageSchema = zod_1.z.object({
    mainImage: zod_1.z.string().refine((value) => {
        return value;
    }, "Main Img Is Compulsory"),
    otherImages: zod_1.z.array(zod_1.z.string()).refine((values) => {
        let pics = values.filter((val) => val.trim());
        return pics.length >= 4;
    }, "Needed Four Other Images"),
});
exports.EditListingAddressSchema = zod_1.z.object({
    addressLine: zod_1.z.string().min(3, " Min length For address is 3").max(20),
    city: zod_1.z.string().min(3, " Min length For city is 3").max(15),
    district: zod_1.z.string().min(3, " Min length For district is 3").max(15),
    state: zod_1.z.string().min(3, " Min length is 3").max(15),
    pinCode: zod_1.z.string().refine((value) => {
        const INDIAN_PINCODE_REGEX = /^[1-9][0-9]{5}$/;
        return INDIAN_PINCODE_REGEX.test(value);
    }, "Invalid Indian Pincode"),
});
