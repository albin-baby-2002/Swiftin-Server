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
exports.getAllReservationsHandler = void 0;
const reservationModal_1 = require("../../Models/reservationModal");
const getAllReservationsHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        let filterQuery = { hotelName: {} };
        filterQuery.hotelName = { $regex: search, $options: "i" };
        console.log(" page number ", page);
        const reservations = yield reservationModal_1.HotelReservation.aggregate([
            {
                $lookup: {
                    from: "hotellistings",
                    localField: "listingID",
                    foreignField: "_id",
                    as: "listingData",
                },
            },
            {
                $unwind: { path: "$listingData", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    userID: 1,
                    listingID: 1,
                    checkInDate: 1,
                    checkOutDate: 1,
                    reservationFee: 1,
                    rooms: 1,
                    paymentStatus: 1,
                    reservationStatus: 1,
                    mainImage: "$listingData.mainImage",
                    address: "$listingData.address",
                },
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
                $project: {
                    userID: 1,
                    listingID: 1,
                    checkInDate: 1,
                    checkOutDate: 1,
                    reservationFee: 1,
                    rooms: 1,
                    paymentStatus: 1,
                    reservationStatus: 1,
                    mainImage: 1,
                    hotelName: "$addressData.addressLine",
                    location: "$addressData.state",
                },
            },
            {
                $match: filterQuery,
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
        ]);
        // console.log("\t \t \t \t", properties, "get properties");
        const totalReservationMatchingQuery = yield reservationModal_1.HotelReservation.aggregate([
            {
                $lookup: {
                    from: "hotellistings",
                    localField: "listingID",
                    foreignField: "_id",
                    as: "listingData",
                },
            },
            {
                $unwind: { path: "$listingData", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    userID: 1,
                    listingID: 1,
                    address: "$listingData.address",
                },
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
                $project: {
                    userID: 1,
                    listing: 1,
                    hotelName: "$addressData.addressLine",
                },
            },
            {
                $match: filterQuery,
            },
        ]);
        const totalReservations = totalReservationMatchingQuery.length;
        const totalPages = Math.ceil(totalReservations / limit);
        return res.status(200).json({ reservations, totalPages });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getAllReservationsHandler = getAllReservationsHandler;
