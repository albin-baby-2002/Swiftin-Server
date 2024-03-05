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
exports.hotelDataBySearch = void 0;
const hotelLisitingModal_1 = require("../../Models/hotelLisitingModal");
const hotelDataBySearch = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let queryParams = req.query;
        let search = "";
        if (queryParams.search) {
            console.log("yes");
            search = queryParams.search.trim();
        }
        let page = 1;
        if (Number(queryParams.page)) {
            page = Number(queryParams.page);
        }
        let rooms = 1;
        if (Number(queryParams.rooms)) {
            rooms = Number(queryParams.rooms);
        }
        let guests = 1;
        if (Number(queryParams.guests)) {
            guests = Number(queryParams.guests);
        }
        let sortBy = -1;
        if (queryParams.sortBy) {
            let sort = queryParams.sortBy.trim();
            if (sort === "highToLow") {
                sortBy = -1;
            }
            else {
                sortBy = 1;
            }
        }
        let limit = 4;
        console.log(search, "search");
        let filterQuery = {
            $or: [
                { state: { $regex: search, $options: "i" } },
                { district: { $regex: search, $options: "i" } },
                { city: { $regex: search, $options: "i" } },
            ],
            totalRooms: { $gte: rooms },
            maxGuestsPerRoom: { $gte: guests },
            approvedForReservation: true,
            isActiveForReservation: true,
        };
        const properties = yield hotelLisitingModal_1.HotelListing.aggregate([
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
                    totalRooms: 1,
                    amenities: 1,
                    mainImage: 1,
                    listingTitle: 1,
                    maxGuestsPerRoom: 1,
                    roomType: 1,
                    approvedForReservation: 1,
                    isActiveForReservation: 1,
                    rentPerNight: 1,
                    hostName: "$hostData.username",
                    city: "$addressData.city",
                    district: "$addressData.district",
                    state: "$addressData.state",
                    location: "$addressData.city",
                    buildingName: "$addressData.addressLine",
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
            {
                $sort: { rentPerNight: sortBy },
            },
        ]);
        const totalPropertiesMatchingQuery = yield hotelLisitingModal_1.HotelListing.aggregate([
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
                    totalRooms: 1,
                    maxGuestsPerRoom: 1,
                    approvedForReservation: 1,
                    isActiveForReservation: 1,
                    city: "$addressData.city",
                    district: "$addressData.district",
                    state: "$addressData.state",
                },
            },
            {
                $match: filterQuery,
            },
        ]);
        const totalProperties = totalPropertiesMatchingQuery.length;
        const totalPages = Math.ceil(totalProperties / limit);
        return res
            .status(200)
            .json({ properties, totalPages, totalHotels: totalProperties });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.hotelDataBySearch = hotelDataBySearch;
