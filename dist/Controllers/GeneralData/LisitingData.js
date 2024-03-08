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
exports.ListingData = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const hotelLisitingModal_1 = require("../../Models/hotelLisitingModal");
const reviewModel_1 = require("../../Models/reviewModel");
const ListingData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listingID = new mongoose_1.default.Types.ObjectId(req.params.listingID);
        if (!listingID) {
            return res.status(400).json({ message: "failed to identify listing " });
        }
        let filterQuery = { _id: listingID };
        const listing = yield hotelLisitingModal_1.HotelListing.aggregate([
            {
                $match: filterQuery,
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
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "hostData",
                },
            },
            {
                $unwind: { path: "$hostData", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    userID: 1,
                    totalRooms: 1,
                    amenities: 1,
                    maxGuestsPerRoom: 1,
                    listingTitle: 1,
                    bedsPerRoom: 1,
                    bathroomPerRoom: 1,
                    roomType: 1,
                    aboutHotel: 1,
                    rentPerNight: 1,
                    mainImage: 1,
                    otherImages: 1,
                    hostID: "$hostData._id",
                    host: "$hostData.username",
                    hostImg: "$hostData.image",
                    hotelName: "$addressData.addressLine",
                    city: "$addressData.city",
                    district: "$addressData.district",
                    state: "$addressData.state",
                    pinCode: "$addressData.pinCode",
                },
            },
        ]);
        const reviewData = yield reviewModel_1.Review.aggregate([
            {
                $match: {
                    listingID: listingID,
                },
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
                    userID: 1,
                    listingID: 1,
                    rating: 1,
                    reviewMessage: 1,
                    username: "$userData.username",
                    image: "$userData.image"
                }
            }
        ]);
        console.log(reviewData, "review \t \t \t");
        console.log(listing, "get single listing");
        return res.status(200).json({ listing: listing[0], reviewData });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.ListingData = ListingData;
