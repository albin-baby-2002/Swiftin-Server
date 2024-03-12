import { NextFunction, Request, Response } from "express";
import { User } from "../../Models/userModel";
import { HotelListing } from "../../Models/hotelLisitingModal";
import { HotelReservation } from "../../Models/reservationModal";
import { ListingData } from "../GeneralData/LisitingData";
import { Console } from "console";

export const getCardData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find().countDocuments();

    const hosts = await HotelListing.aggregate([
      {
        $group: { _id: "$userID" },
      },
    ]);

    const listings = await HotelListing.find({
      approvedForReservation: true,
    }).countDocuments();

    const reservations = await HotelReservation.find({
      reservationStatus: "success",
    }).countDocuments();

    console.log(hosts, "hosts", users);

    return res
      .status(200)
      .json({ users, listings, reservations, hosts: hosts.length });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

type time = "weekly" | "daily" | "yearly";

type chart = "users" | "listings" | "reservations";

export const getChartData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let timeBasisForusersChart: time = "daily";

    let timeBasisForListingsChart: time = "daily";

    let timeBasisForReservationsChart: time = "daily";

    if (
      req.query.usersChart &&
      (req.query.usersChart === "daily" ||
        req.query.usersChart === "weekly" ||
        req.query.usersChart === "yearly")
    ) {
      timeBasisForusersChart = req.query.usersChart;
    }

    if (
      req.query.listingsChart &&
      (req.query.listingsChart === "daily" ||
        req.query.listingsChart === "weekly" ||
        req.query.listingsChart === "yearly")
    ) {
      timeBasisForListingsChart = req.query.listingsChart;
    }

    if (
      req.query.reservationsChart &&
      (req.query.reservationsChart === "daily" ||
        req.query.reservationsChart === "weekly" ||
        req.query.reservationsChart === "yearly")
    ) {
      timeBasisForReservationsChart = req.query.reservationsChart;
    }

    let fieldToQuery: { [key in chart]: string } = {
      users: "joinedDate",
      listings: "createdAt",
      reservations: "dateOfTransaction",
    };

    function getDatesAndQueryData(timeBaseForChart: time, chartType: chart) {
      let startDate, endDate;

      let groupingQuery: any = {};
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

    const usersChartInfo = getDatesAndQueryData(
      timeBasisForusersChart,
      "users"
    );

    const listingsChartInfo = getDatesAndQueryData(
      timeBasisForListingsChart,
      "listings"
    );

    const reservationsChartInfo = getDatesAndQueryData(
      timeBasisForReservationsChart,
      "reservations"
    );

    console.log(reservationsChartInfo?.groupingQuery, "QUERY");

    let usersChartData = await User.aggregate([
      {
        $match: {
          joinedDate: {
            $gte: usersChartInfo?.startDate,
            $lte: usersChartInfo?.endDate,
          },
        },
      },
      {
        $group: usersChartInfo?.groupingQuery as unknown as { _id: any },
      },
      {
        $sort: usersChartInfo?.sortQuery as any,
      },
    ]);

    const listingsChartData = await HotelListing.aggregate([
      {
        $match: {
          createdAt: {
            $gte: listingsChartInfo?.startDate,
            $lte: listingsChartInfo?.endDate,
          },
        },
      },
      {
        $group: listingsChartInfo?.groupingQuery,
      },
      {
        $sort: listingsChartInfo?.sortQuery as any,
      },
    ]);
    const reservationsChartData = await HotelReservation.aggregate([
      {
        $match: {
          dateOfTransaction: {
            $gte: reservationsChartInfo?.startDate,
            $lte: reservationsChartInfo?.endDate,
          },
          reservationStatus:"success"
        },
      },
      {
        $group: reservationsChartInfo?.groupingQuery,
      },
      {
        $sort: reservationsChartInfo?.sortQuery as any,
      },
    ]);
    
    console.log(reservationsChartData)

    return res.status(200).json({ usersChartData, listingsChartData,reservationsChartData });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
