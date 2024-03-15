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
exports.getAllHostsHandler = void 0;
const hotelLisitingModal_1 = require("../../Models/hotelLisitingModal");
const statusCodes_1 = require("../../Enums/statusCodes");
const getAllHostsHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const totalHosts = yield hotelLisitingModal_1.HotelListing.aggregate([
            {
                $group: { _id: "$userID", listings: { $sum: 1 } },
            },
        ]);
        const total = totalHosts.length;
        const totalPages = Math.ceil(total / limit);
        return res.status(statusCodes_1.HTTP_STATUS_CODES.OK).json({ hosts, totalPages });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getAllHostsHandler = getAllHostsHandler;
