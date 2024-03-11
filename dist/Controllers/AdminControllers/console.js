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
exports.getChartData = exports.getConsoleData = void 0;
const userModel_1 = require("../../Models/userModel");
const hotelLisitingModal_1 = require("../../Models/hotelLisitingModal");
const reservationModal_1 = require("../../Models/reservationModal");
const getConsoleData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        console.log(hosts, "hosts", users);
        return res
            .status(200)
            .json({ users, listings, reservations, hosts: hosts.length });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getConsoleData = getConsoleData;
const getChartData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let timeBasisForusersChart = req.query.usersChart;
        function getDatesAndQueryData(timeBaseForChart, chartType) {
            let startDate, endDate;
            let groupingQuery, sortQuery;
            if (timeBaseForChart === "yearly") {
                startDate = new Date(new Date().getFullYear(), 0, 1);
                endDate = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);
                groupingQuery = {
                    _id: {
                        month: { $month: { $toDate: "$joinedDate" } },
                        year: { $year: { $toDate: "$joinedDate" } },
                    },
                    users: { $sum: 1 },
                };
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
                        $dateToString: { format: "%Y-%m-%d", date: "$joinedDate" },
                    },
                    users: { $sum: 1 },
                };
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
                    _id: { $hour: "$joinedDate" },
                    users: { $sum: 1 },
                };
                sortQuery = { "_id.hour": 1 };
            }
            if (chartType === "user") {
                return { groupingQuery, sortQuery, startDate, endDate };
            }
            //   } else if (chartType === "orderType") {
            //     return { startDate, endDate };
            //   } else if (chartType === "categoryBasedChart") {
            //     return { startDate, endDate };
            //   } else if (chartType === "orderNoChart") {
            //     return { groupingQuery, sortQuery, startDate, endDate };
            //   }
        }
        const usersChartInfo = getDatesAndQueryData(timeBasisForusersChart, "user");
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
            }, {
                $sort: usersChartInfo === null || usersChartInfo === void 0 ? void 0 : usersChartInfo.sortQuery
            }
        ]);
        console.log(usersChartData);
        return res.status(200).json({ usersChartData });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getChartData = getChartData;
