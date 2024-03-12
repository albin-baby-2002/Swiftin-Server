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
exports.getAllHosts = exports.disapproveListing = exports.approveListing = exports.getAllListings = void 0;
const hotelLisitingModal_1 = require("../../Models/hotelLisitingModal");
const getAllListings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        console.log(" page number ", page);
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
        console.log("\t \t \t \t", properties, "get properties");
        const totalPropertiesMatchingQuery = yield hotelLisitingModal_1.HotelListing.aggregate([
            {
                $match: filterQuery,
            },
        ]);
        const totalUsers = totalPropertiesMatchingQuery.length;
        const totalPages = Math.ceil(totalUsers / limit);
        return res.status(200).json({ properties, totalPages });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getAllListings = getAllListings;
const approveListing = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let listingID = req.params.listingID;
        if (!listingID)
            throw new Error(" Failed to get listingID param for approving listings");
        let listing = yield hotelLisitingModal_1.HotelListing.findById(listingID);
        if (listing) {
            if (!(listing === null || listing === void 0 ? void 0 : listing.approvedForReservation)) {
                listing.approvedForReservation = true;
                listing.isActiveForReservation = true;
                yield listing.save();
                return res
                    .status(200)
                    .json({ message: "property approved for reservation" });
            }
            else {
                return res.status(400).json({ message: " property already approved" });
            }
        }
        throw new Error("failed to get listing data ");
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.approveListing = approveListing;
const disapproveListing = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let listingID = req.params.listingID;
        if (!listingID)
            throw new Error(" Failed to get listingID param for approving listings");
        let listing = yield hotelLisitingModal_1.HotelListing.findById(listingID);
        if (listing) {
            if (listing === null || listing === void 0 ? void 0 : listing.approvedForReservation) {
                listing.approvedForReservation = false;
                listing.isActiveForReservation = false;
                yield listing.save();
                return res
                    .status(200)
                    .json({ message: "property successfully disapproved" });
            }
            else {
                return res
                    .status(400)
                    .json({ message: " property already in disapproval" });
            }
        }
        throw new Error("failed to get listing data ");
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.disapproveListing = disapproveListing;
const getAllHosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        let filterQuery = { username: {} };
        filterQuery.username = { $regex: search, $options: "i" };
        const hosts = yield hotelLisitingModal_1.HotelListing.aggregate([
            {
                $group: { _id: "$userID", listings: { $sum: 1 } },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userData",
                },
            },
            {
                $unwind: { path: "$userData", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    username: "$userData.username",
                    email: "$userData.email",
                    blocked: "$userData.blocked",
                    joinedDate: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$userData.joinedDate",
                        },
                    },
                    listings: 1,
                },
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
        ]);
        console.log(hosts);
        const totalHosts = yield hotelLisitingModal_1.HotelListing.aggregate([
            {
                $group: { _id: "$userID", listings: { $sum: 1 } },
            },
        ]);
        const total = totalHosts.length;
        const totalPages = Math.ceil(total / limit);
        return res.status(200).json({ hosts, totalPages });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getAllHosts = getAllHosts;
