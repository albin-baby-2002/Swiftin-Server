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
exports.editListingHandler = exports.getSingleListingData = exports.deActivateListing = exports.activateListing = exports.getAllHostListings = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const hotelLisitingModal_1 = require("../../Models/hotelLisitingModal");
const zod_1 = require("zod");
const EditListingSchema = zod_1.z.object({
    totalRooms: zod_1.z.number().min(1),
    maxGuestsPerRoom: zod_1.z.number().min(1),
    bedsPerRoom: zod_1.z.number().min(1),
    bathroomPerRoom: zod_1.z.number().min(1),
    amenities: zod_1.z.array(zod_1.z.string()),
    aboutHotel: zod_1.z.string().min(20),
    listingTitle: zod_1.z.string().min(10).max(30),
    roomType: zod_1.z.string().min(3),
    rentPerNight: zod_1.z.number().min(1000),
});
const getAllHostListings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userID = new mongoose_1.default.Types.ObjectId((_a = req.userInfo) === null || _a === void 0 ? void 0 : _a.id);
        if (!userID) {
            return res.status(400).json({ message: "failed to identify host " });
        }
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
        let filterQuery = { listingTitle: {}, userID };
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
                    roomType: 1,
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
        const totalProperties = totalPropertiesMatchingQuery.length;
        const totalPages = Math.ceil(totalProperties / limit);
        return res.status(200).json({ properties, totalPages });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getAllHostListings = getAllHostListings;
const activateListing = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const userID = new mongoose_1.default.Types.ObjectId((_b = req.userInfo) === null || _b === void 0 ? void 0 : _b.id);
        if (!userID) {
            return res.status(400).json({ message: "failed to identify host " });
        }
        const listingID = new mongoose_1.default.Types.ObjectId(req.params.listingID);
        if (!listingID) {
            return res.status(400).json({ message: "failed to identify listing " });
        }
        const listing = yield hotelLisitingModal_1.HotelListing.findOne({ _id: listingID, userID });
        if (!listing) {
            return res.status(400).json({
                message: "failed to identify the specific listing of the host",
            });
        }
        if (!(listing === null || listing === void 0 ? void 0 : listing.approvedForReservation)) {
            return res.status(400).json({
                message: "Admin haven't approved your listing",
            });
        }
        if (listing.isActiveForReservation) {
            return res.status(400).json({
                message: "the listing is already in active state",
            });
        }
        listing.isActiveForReservation = true;
        yield listing.save();
        return res
            .status(200)
            .json({ message: " listing activated for reservations successfully " });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.activateListing = activateListing;
const deActivateListing = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const userID = new mongoose_1.default.Types.ObjectId((_c = req.userInfo) === null || _c === void 0 ? void 0 : _c.id);
        if (!userID) {
            return res.status(400).json({ message: "failed to identify host " });
        }
        const listingID = new mongoose_1.default.Types.ObjectId(req.params.listingID);
        if (!listingID) {
            return res.status(400).json({ message: "failed to identify listing " });
        }
        const listing = yield hotelLisitingModal_1.HotelListing.findOne({ _id: listingID, userID });
        if (!listing) {
            return res.status(400).json({
                message: "failed to identify the specific listing of the host",
            });
        }
        if (!(listing === null || listing === void 0 ? void 0 : listing.approvedForReservation)) {
            return res.status(400).json({
                message: "Admin haven't approved your listing. You can't to manage this listing",
            });
        }
        if (!listing.isActiveForReservation) {
            return res.status(400).json({
                message: "the listing is already not in active state",
            });
        }
        listing.isActiveForReservation = false;
        yield listing.save();
        return res
            .status(200)
            .json({ message: " listing activated for reservations successfully " });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.deActivateListing = deActivateListing;
const getSingleListingData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const userID = new mongoose_1.default.Types.ObjectId((_d = req.userInfo) === null || _d === void 0 ? void 0 : _d.id);
        if (!userID) {
            return res.status(400).json({ message: "failed to identify host " });
        }
        const listingID = new mongoose_1.default.Types.ObjectId(req.params.listingID);
        if (!listingID) {
            return res.status(400).json({ message: "failed to identify listing " });
        }
        let filterQuery = { userID, _id: listingID };
        console.log(filterQuery);
        const listing = yield hotelLisitingModal_1.HotelListing.aggregate([
            {
                $match: filterQuery,
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
                },
            },
        ]);
        console.log(listing, "get single listing");
        return res.status(200).json({ listing: listing[0] });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getSingleListingData = getSingleListingData;
const editListingHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const userID = new mongoose_1.default.Types.ObjectId((_e = req.userInfo) === null || _e === void 0 ? void 0 : _e.id);
        if (!userID) {
            return res.status(400).json({ message: "failed to identify host " });
        }
        const listingID = new mongoose_1.default.Types.ObjectId(req.params.listingID);
        if (!listingID) {
            return res.status(400).json({ message: "failed to identify listing " });
        }
        const propertyData = req.body;
        console.log("\t \t \t \t ", propertyData, "...listing ");
        const validationResult = EditListingSchema.safeParse(propertyData);
        if (!validationResult.success) {
            const validationError = validationResult.error;
            res.status(400).json({ message: validationError.errors[0].message });
        }
        if (validationResult.success) {
            const { totalRooms, bedsPerRoom, bathroomPerRoom, amenities, listingTitle, roomType, aboutHotel, rentPerNight, } = validationResult.data;
            const listing = yield hotelLisitingModal_1.HotelListing.findOne({ _id: listingID, userID });
            if (!listing) {
                return res.status(400).json({
                    message: "failed to identify the specific listing of the host",
                });
            }
            const updatedListing = yield hotelLisitingModal_1.HotelListing.findByIdAndUpdate(listingID, {
                totalRooms,
                bedsPerRoom,
                bathroomPerRoom,
                amenities,
                listingTitle,
                roomType,
                aboutHotel,
                rentPerNight,
            }, { new: true });
            if (updatedListing)
                return res
                    .status(200)
                    .json({ message: "successfully updated the listing" });
            return res.send(500).json({ message: "failed to update the listing" });
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.editListingHandler = editListingHandler;
