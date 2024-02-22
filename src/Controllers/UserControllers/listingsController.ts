import { NextFunction, Request, Response } from "express";
import User from "../../Models/userModel";
import mongoose from "mongoose";
import { HotelListing } from "../../Models/hotelLisitingModal";

interface GetHostListingsQuery {
  search: string;
  page: number;
}

interface CustomRequest extends Request {
  userInfo?: {
    id: string;
    username: string;
    roles: number[];
  };
}

export const getAllHostListings = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(400).json({ message: "failed to identify host " });
    }

    let queryParams = req.query as unknown as GetHostListingsQuery;

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

    const properties = await HotelListing.aggregate([
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
        },
      },
    ]);

    const totalPropertiesMatchingQuery = await HotelListing.aggregate([
      {
        $match: filterQuery,
      },
    ]);

    const totalProperties = totalPropertiesMatchingQuery.length;

    const totalPages = Math.ceil(totalProperties / limit);

    return res.status(200).json({ properties, totalPages });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const activateListing = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(400).json({ message: "failed to identify host " });
    }

    const listingID = new mongoose.Types.ObjectId(req.params.listingID);

    if (!listingID) {
      return res.status(400).json({ message: "failed to identify listing " });
    }

    const listing = await HotelListing.findOne({ _id: listingID, userID });
    
    if(!listing){
        return res.status(400).json({ message: "failed to identify the specific listing of the host" });
    }
    
    if(!listing?.approvedForReservation){
        return res
          .status(400)
          .json({
            message: "Admin haven't approved your listing",
          });
    }
    
    if(listing.isActiveForReservation){
        
         return res.status(400).json({
           message: "the listing is already in active state",
         });
    }
    
    
    listing.isActiveForReservation = true;
    
    await listing.save();
    
    
    return res.status(200).json({message:' listing activated for reservations successfully '})
    

  } catch (err: any) {
    console.log(err);

    next(err);
  }
};


export const deActivateListing = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(400).json({ message: "failed to identify host " });
    }

    const listingID = new mongoose.Types.ObjectId(req.params.listingID);

    if (!listingID) {
      return res.status(400).json({ message: "failed to identify listing " });
    }

    const listing = await HotelListing.findOne({ _id: listingID, userID });

    if (!listing) {
      return res
        .status(400)
        .json({
          message: "failed to identify the specific listing of the host",
        });
    }

    if (!listing?.approvedForReservation) {
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

    await listing.save();

    return res
      .status(200)
      .json({ message: " listing activated for reservations successfully " });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
