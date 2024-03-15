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
exports.getChartDataHandler = exports.getCardDataHandler = void 0;
const userModel_1 = require("../../Models/userModel");
const hotelLisitingModal_1 = require("../../Models/hotelLisitingModal");
const reservationModal_1 = require("../../Models/reservationModal");
const statusCodes_1 = require("../../Enums/statusCodes");
const getCardDataHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModel_1.User.find().countDocuments();
        const hosts = yield hotelLisitingModal_1.HotelListing.aggregate([
            {
                $group: { _id: "$userID" },
            },
        ]);
        const listings = yield hotelLisitingModal_1.HotelListing.find({
            approvedForReservation: true,
        }).countDocuments();
        const reservations = yield reservationModal_1.HotelReservation.find({
            reservationStatus: "success",
        }).countDocuments();
        return res
            .status(statusCodes_1.HTTP_STATUS_CODES.OK)
            .json({ users, listings, reservations, hosts: hosts.length });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getCardDataHandler = getCardDataHandler;
const getChartDataHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let timeBasisForusersChart = "daily";
        let timeBasisForListingsChart = "daily";
        let timeBasisForReservationsChart = "daily";
        if (req.query.usersChart &&
            (req.query.usersChart === "daily" ||
                req.query.usersChart === "weekly" ||
                req.query.usersChart === "yearly")) {
            timeBasisForusersChart = req.query.usersChart;
        }
        if (req.query.listingsChart &&
            (req.query.listingsChart === "daily" ||
                req.query.listingsChart === "weekly" ||
                req.query.listingsChart === "yearly")) {
            timeBasisForListingsChart = req.query.listingsChart;
        }
        if (req.query.reservationsChart &&
            (req.query.reservationsChart === "daily" ||
                req.query.reservationsChart === "weekly" ||
                req.query.reservationsChart === "yearly")) {
            timeBasisForReservationsChart = req.query.reservationsChart;
        }
        let fieldToQuery = {
            users: "joinedDate",
            listings: "createdAt",
            reservations: "dateOfTransaction",
        };
        function getDatesAndQueryData(timeBaseForChart, chartType) {
            let startDate, endDate;
            let groupingQuery = {};
            let sortQuery;
            if (timeBaseForChart === "yearly") {
                startDate = new Date(new Date().getFullYear(), 0, 1);
                endDate = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);
                groupingQuery = {
                    _id: {
                        month: { $month: { $toDate: `$${fieldToQuery[chartType]}` } },
                        year: { $year: { $toDate: `$${fieldToQuery[chartType]}` } },
                    },
                };
                groupingQuery[chartType] = { $sum: 1 };
                sortQuery = { "_id.year": 1, "_id.month": 1 };
            }
            if (timeBaseForChart === "weekly") {
                startDate = new Date();
                endDate = new Date();
                const timezoneOffset = startDate.getTimezoneOffset();
                startDate.setDate(startDate.getDate() - 6);
                startDate.setUTCHours(0, 0, 0, 0);
                startDate.setUTCMinutes(startDate.getUTCMinutes() + timezoneOffset);
                endDate.setUTCHours(0, 0, 0, 0);
                endDate.setDate(endDate.getDate() + 1);
                endDate.setUTCMinutes(endDate.getUTCMinutes() + timezoneOffset);
                groupingQuery = {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: `$${fieldToQuery[chartType]}`,
                        },
                    },
                };
                groupingQuery[chartType] = { $sum: 1 };
                sortQuery = { _id: 1 };
            }
            if (timeBaseForChart === "daily") {
                startDate = new Date();
                endDate = new Date();
                const timezoneOffset = startDate.getTimezoneOffset();
                startDate.setUTCHours(0, 0, 0, 0);
                endDate.setUTCHours(0, 0, 0, 0);
                endDate.setDate(endDate.getDate() + 1);
                startDate.setUTCMinutes(startDate.getUTCMinutes() + timezoneOffset);
                endDate.setUTCMinutes(endDate.getUTCMinutes() + timezoneOffset);
                groupingQuery = {
                    _id: { $hour: `$${fieldToQuery[chartType]}` },
                };
                groupingQuery[chartType] = { $sum: 1 };
                sortQuery = { "_id.hour": 1 };
            }
            return { groupingQuery, sortQuery, startDate, endDate };
        }
        const usersChartInfo = getDatesAndQueryData(timeBasisForusersChart, "users");
        const listingsChartInfo = getDatesAndQueryData(timeBasisForListingsChart, "listings");
        const reservationsChartInfo = getDatesAndQueryData(timeBasisForReservationsChart, "reservations");
        let usersChartData = yield userModel_1.User.aggregate([
            {
                $match: {
                    joinedDate: {
                        $gte: usersChartInfo === null || usersChartInfo === void 0 ? void 0 : usersChartInfo.startDate,
                        $lte: usersChartInfo === null || usersChartInfo === void 0 ? void 0 : usersChartInfo.endDate,
                    },
                },
            },
            {
                $group: usersChartInfo === null || usersChartInfo === void 0 ? void 0 : usersChartInfo.groupingQuery,
            },
            {
                $sort: usersChartInfo === null || usersChartInfo === void 0 ? void 0 : usersChartInfo.sortQuery,
            },
        ]);
        const listingsChartData = yield hotelLisitingModal_1.HotelListing.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: listingsChartInfo === null || listingsChartInfo === void 0 ? void 0 : listingsChartInfo.startDate,
                        $lte: listingsChartInfo === null || listingsChartInfo === void 0 ? void 0 : listingsChartInfo.endDate,
                    },
                },
            },
            {
                $group: listingsChartInfo === null || listingsChartInfo === void 0 ? void 0 : listingsChartInfo.groupingQuery,
            },
            {
                $sort: listingsChartInfo === null || listingsChartInfo === void 0 ? void 0 : listingsChartInfo.sortQuery,
            },
        ]);
        const reservationsChartData = yield reservationModal_1.HotelReservation.aggregate([
            {
                $match: {
                    dateOfTransaction: {
                        $gte: reservationsChartInfo === null || reservationsChartInfo === void 0 ? void 0 : reservationsChartInfo.startDate,
                        $lte: reservationsChartInfo === null || reservationsChartInfo === void 0 ? void 0 : reservationsChartInfo.endDate,
                    },
                    reservationStatus: "success",
                },
            },
            {
                $group: reservationsChartInfo === null || reservationsChartInfo === void 0 ? void 0 : reservationsChartInfo.groupingQuery,
            },
            {
                $sort: reservationsChartInfo === null || reservationsChartInfo === void 0 ? void 0 : reservationsChartInfo.sortQuery,
            },
        ]);
        return res
            .status(statusCodes_1.HTTP_STATUS_CODES.OK)
            .json({ usersChartData, listingsChartData, reservationsChartData });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getChartDataHandler = getChartDataHandler;
