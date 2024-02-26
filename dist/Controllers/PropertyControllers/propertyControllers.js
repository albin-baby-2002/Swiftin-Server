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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservePropertyHandler = exports.listPropertyHandler = void 0;
const zod_1 = require("zod");
const hotelAddressModel_1 = require("../../Models/hotelAddressModel");
const hotelLisitingModal_1 = require("../../Models/hotelLisitingModal");
const reservationModal_1 = require("../../Models/reservationModal");
const mongoose_1 = __importDefault(require("mongoose"));
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
    listingTitle: zod_1.z.string().min(10).max(60),
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
    var _a;
    try {
        const propertyListingData = req.body;
        console.log("\t \t \t \t ", propertyListingData, "...listing ");
        const validationResult = HotelListingSchema.safeParse(propertyListingData);
        if (!validationResult.success) {
            const validationError = validationResult.error;
            res.status(400).json({ message: validationError.errors[0].message });
        }
        if (validationResult.success) {
            const { addressLine, district, city, state, pinCode, totalRooms, maxGuests, bedsPerRoom, bathroomPerRoom, amenities, mainImage, otherImages, listingTitle, roomType, hotelLicenseUrl, aboutHotel, rentPerNight, } = validationResult.data;
            let userID = (_a = req.userInfo) === null || _a === void 0 ? void 0 : _a.id;
            if (!userID)
                throw new Error("Failed to identify user from req.userInfo.Id");
            let newListing = new hotelLisitingModal_1.HotelListing({
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
            yield newListing.save();
            let hotelAddress = new hotelAddressModel_1.HotelAddress({
                listingID: newListing._id,
                userID,
                addressLine,
                city,
                district,
                state,
                pinCode,
            });
            yield hotelAddress.save();
            newListing.address = hotelAddress._id;
            yield newListing.save();
            return res.status(201).json({ message: "new Listing created" });
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.listPropertyHandler = listPropertyHandler;
const reservePropertyHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const userID = new mongoose_1.default.Types.ObjectId((_b = req.userInfo) === null || _b === void 0 ? void 0 : _b.id);
        if (!userID) {
            return res.status(400).json({ message: "failed to identify host " });
        }
        let { listingID, checkInDate, checkOutDate, rooms } = req.body;
        listingID = new mongoose_1.default.Types.ObjectId(listingID);
        if (!listingID || !checkInDate || !checkOutDate || !rooms) {
            return res.status(400).json({
                message: "Failed : all data fields are necessary . Try Again ",
            });
        }
        let listingData = yield hotelLisitingModal_1.HotelListing.findById(listingID);
        if (!listingData)
            return res.status(400).json({ message: "failed to identify listing " });
        if (!listingData.approvedForReservation ||
            !listingData.isActiveForReservation) {
            return res
                .status(400)
                .json({ message: "Sorry the property is not available for listing " });
        }
        const startDate = new Date(checkInDate);
        const endDate = new Date(checkOutDate);
        let numberOfDays = 0;
        let dateWiseReservation = listingData.dateWiseReservationData || {};
        for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
            let dateString = new Date(date).toISOString().split("T")[0];
            if (!dateWiseReservation.hasOwnProperty(dateString)) {
                dateWiseReservation[dateString] = rooms;
            }
            else {
                let existingValue = dateWiseReservation[dateString];
                if (existingValue + rooms > listingData.totalRooms) {
                    return res.status(400).json({
                        message: "Unfortunately adequate rooms  not  available in given days",
                    });
                }
                dateWiseReservation[dateString] = existingValue + rooms;
            }
            numberOfDays++;
        }
        listingData.dateWiseReservationData = dateWiseReservation;
        const response = yield hotelLisitingModal_1.HotelListing.findByIdAndUpdate(listingID, {
            dateWiseReservationData: dateWiseReservation,
        });
        console.log(response);
        const fee = (listingData === null || listingData === void 0 ? void 0 : listingData.rentPerNight) * numberOfDays * rooms;
        const reservationData = new reservationModal_1.HotelReservation({
            userID,
            listingID,
            checkInDate,
            checkOutDate,
            rooms,
            feePaid: fee,
        });
        yield reservationData.save();
        return res.status(200).json({ message: "successfully made reservation" });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.reservePropertyHandler = reservePropertyHandler;
