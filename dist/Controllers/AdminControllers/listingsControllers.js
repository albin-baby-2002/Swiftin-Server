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
exports.disapproveListingHandler = exports.approveListingHandler = exports.getAllListingsHandler = void 0;
const hotelLisitingModal_1 = require("../../Models/hotelLisitingModal");
const statusCodes_1 = require("../../Enums/statusCodes");
const getAllListingsHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let queryParams = req.query;
        let search = "";
        if (queryParams.search) {
            search = queryParams.search.trim();
        }
        let page = 1;
        if (Number(queryParams.page)) {
            page = Number(queryParams.page);
        }
        let limit = 5;
        let filterQuery = { listingTitle: {} };
        filterQuery.listingTitle = { $regex: search, $options: "i" };
        const properties = yield hotelLisitingModal_1.HotelListing.aggregate([
            {
                $match: filterQuery,
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
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
                    mainImage: 1,
                    listingTitle: 1,
                    hotelLicenseUrl: 1,
                    approvedForReservation: 1,
                    isActiveForReservation: 1,
                    hostName: "$hostData.username",
                    location: "$addressData.city",
                    buildingName: "$addressData.addressLine",
                },
            },
        ]);
        const totalPropertiesMatchingQuery = yield hotelLisitingModal_1.HotelListing.aggregate([
            {
                $match: filterQuery,
            },
        ]);
        const totalUsers = totalPropertiesMatchingQuery.length;
        const totalPages = Math.ceil(totalUsers / limit);
        return res.status(statusCodes_1.HTTP_STATUS_CODES.OK).json({ properties, totalPages });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getAllListingsHandler = getAllListingsHandler;
const approveListingHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let listingID = req.params.listingID;
        if (!listingID)
            return res
                .status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST)
                .json({ message: "ListingID not found in params" });
        let listing = yield hotelLisitingModal_1.HotelListing.findById(listingID);
        if (listing) {
            if (!(listing === null || listing === void 0 ? void 0 : listing.approvedForReservation)) {
                listing.approvedForReservation = true;
                listing.isActiveForReservation = true;
                yield listing.save();
                return res
                    .status(statusCodes_1.HTTP_STATUS_CODES.OK)
                    .json({ message: "property approved for reservation" });
            }
            else {
                return res
                    .status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST)
                    .json({ message: " property already approved" });
            }
        }
        else {
            return res
                .status(statusCodes_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
                .json({ message: "Failed to get listing data from db" });
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.approveListingHandler = approveListingHandler;
const disapproveListingHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let listingID = req.params.listingID;
        if (!listingID)
            return res
                .status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST)
                .json({ message: "ListingID not found in params" });
        let listing = yield hotelLisitingModal_1.HotelListing.findById(listingID);
        if (listing) {
            if (listing === null || listing === void 0 ? void 0 : listing.approvedForReservation) {
                listing.approvedForReservation = false;
                listing.isActiveForReservation = false;
                yield listing.save();
                return res
                    .status(statusCodes_1.HTTP_STATUS_CODES.OK)
                    .json({ message: "property successfully disapproved" });
            }
            else {
                return res
                    .status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST)
                    .json({ message: " property already in disapproval" });
            }
        }
        else {
            return res
                .status(statusCodes_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
                .json({ message: "Failed to get listing data from db" });
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.disapproveListingHandler = disapproveListingHandler;
