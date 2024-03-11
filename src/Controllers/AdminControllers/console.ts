import { NextFunction, Request, Response } from "express";
import { User } from "../../Models/userModel";
import { HotelListing } from "../../Models/hotelLisitingModal";
import { HotelReservation } from "../../Models/reservationModal";

export const getConsoleData = async (
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

type time =  "weekly" | "daily" | "yearly";

export const getChartData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let timeBasisForusersChart  = req.query.usersChart as unknown as time;

    function getDatesAndQueryData(
      timeBaseForChart: "weekly" | "daily" | "yearly",
      chartType: "user" | "listings"
    ) {
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
      },{
        $sort:usersChartInfo?.sortQuery  as any
      }
    ]);
    console.log(usersChartData);
    
        return res.status(200).json({usersChartData})
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
