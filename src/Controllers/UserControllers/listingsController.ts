import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { HotelListing } from "../../Models/hotelLisitingModal";
import { ZodError, z } from "zod";
import { HotelAddress } from "../../Models/hotelAddressModel";
import { EditListingAddressSchema, EditListingImageSchema, EditListingSchema } from "../../Schemas/editListingSchema";
import { TGetReqQuery } from "../../Types/getReqQueryType";
import { HTTP_STATUS_CODES } from "../../Enums/statusCodes";





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
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify host " });
    }

    let queryParams = req.query as unknown as TGetReqQuery;

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
          roomType: 1,
          approvedForReservation: 1,
          isActiveForReservation: 1,
          hostName: "$hostData.username",
          location: "$addressData.city",
          buildingName: "$addressData.addressLine",
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

    return res.status(HTTP_STATUS_CODES.OK).json({ properties, totalPages });
  } catch (err) {
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
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify host " });
    }

    const listingID = new mongoose.Types.ObjectId(req.params.listingID);

    if (!listingID) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify listing " });
    }

    const listing = await HotelListing.findOne({ _id: listingID, userID });

    if (!listing) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        message: "failed to identify the specific listing of the host",
      });
    }

    if (!listing?.approvedForReservation) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        message: "Admin haven't approved your listing",
      });
    }

    if (listing.isActiveForReservation) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        message: "the listing is already in active state",
      });
    }

    listing.isActiveForReservation = true;

    await listing.save();

    return res
      .status(HTTP_STATUS_CODES.OK)
      .json({ message: " listing activated for reservations successfully " });
  } catch (err) {
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
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify host " });
    }

    const listingID = new mongoose.Types.ObjectId(req.params.listingID);

    if (!listingID) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify listing " });
    }

    const listing = await HotelListing.findOne({ _id: listingID, userID });

    if (!listing) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        message: "failed to identify the specific listing of the host",
      });
    }

    if (!listing?.approvedForReservation) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        message:
          "Admin haven't approved your listing. You can't to manage this listing",
      });
    }

    if (!listing.isActiveForReservation) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        message: "the listing is already not in active state",
      });
    }

    listing.isActiveForReservation = false;

    await listing.save();

    return res
      .status(HTTP_STATUS_CODES.OK)
      .json({ message: " listing activated for reservations successfully " });
  } catch (err) {
    console.log(err);

    next(err);
  }
};

export const getSingleListingData = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify host " });
    }

    const listingID = new mongoose.Types.ObjectId(req.params.listingID);

    if (!listingID) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify listing " });
    }

    let filterQuery = { userID, _id: listingID };


    const listing = await HotelListing.aggregate([
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
          mainImage: 1,
          otherImages: 1,
        },
      },
    ]);


    return res.status(HTTP_STATUS_CODES.OK).json({ listing: listing[0] });
  } catch (err) {
    console.log(err);

    next(err);
  }
};

export const editListingHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify host " });
    }

    const listingID = new mongoose.Types.ObjectId(req.params.listingID);

    if (!listingID) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify listing " });
    }

    const propertyData = req.body;


    const validationResult = EditListingSchema.safeParse(propertyData);

    if (!validationResult.success) {
      const validationError: ZodError = validationResult.error;

      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: validationError.errors[0].message });
    }

    if (validationResult.success) {
      const {
        totalRooms,
        bedsPerRoom,
        bathroomPerRoom,
        amenities,
        listingTitle,
        roomType,
        aboutHotel,
        rentPerNight,
      } = validationResult.data;

      const listing = await HotelListing.findOne({ _id: listingID, userID });

      if (!listing) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          message: "failed to identify the specific listing of the host",
        });
      }

      const updatedListing = await HotelListing.findByIdAndUpdate(
        listingID,
        {
          totalRooms,
          bedsPerRoom,
          bathroomPerRoom,
          amenities,
          listingTitle,
          roomType,
          aboutHotel,
          rentPerNight,
        },
        { new: true }
      );

      if (updatedListing)
        return res
          .status(HTTP_STATUS_CODES.OK)
          .json({ message: "successfully updated the listing" });

      return res.send(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "failed to update the listing" });
    }
  } catch (err) {
    console.log(err);

    next(err);
  }
};

export const editListingImagesHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify host " });
    }

    const listingID = new mongoose.Types.ObjectId(req.params.listingID);

    if (!listingID) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify listing " });
    }

    const imageData = req.body;


    const validationResult = EditListingImageSchema.safeParse(imageData);

    if (!validationResult.success) {
      const validationError: ZodError = validationResult.error;

      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: validationError.errors[0].message });
    }

    if (validationResult.success) {
      const { mainImage, otherImages } = validationResult.data;

      const listing = await HotelListing.findOne({ _id: listingID, userID });

      if (!listing) {
        return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          message: "failed to identify the specific listing of the host",
        });
      }

      const updatedListing = await HotelListing.findByIdAndUpdate(
        listingID,
        {
          mainImage,
          otherImages,
        },
        { new: true }
      );

      if (updatedListing)
        return res
          .status(HTTP_STATUS_CODES.OK)
          .json({ message: "successfully updated the images" });

      return res.send(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "failed to update the listing" });
    }
  } catch (err) {
    console.log(err);

    next(err);
  }
};

export const getListingAddress = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify host " });
    }

    const listingID = new mongoose.Types.ObjectId(req.params.listingID);

    if (!listingID) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify listing " });
    }

    let filterQuery = { userID, _id: listingID };


    const listing = await HotelListing.aggregate([
      {
        $match: filterQuery,
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
          addressLine: "$addressData.addressLine",
          city: "$addressData.city",
          district: "$addressData.district",
          state: "$addressData.state",
          pinCode: "$addressData.pinCode",
        },
      },
    ]);


    return res.status(HTTP_STATUS_CODES.OK).json({ ...listing[0] });
  } catch (err) {
    console.log(err);

    next(err);
  }
};

export const editListingAddress = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = new mongoose.Types.ObjectId(req.userInfo?.id);

    if (!userID) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify host " });
    }

    const listingID = new mongoose.Types.ObjectId(req.params.listingID);

    if (!listingID) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify listing " });
    }

    const listing = await HotelListing.findOne({ _id: listingID, userID });

    if (!listing) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        message: "failed to identify the specific listing of the host",
      });
    }

    const addressID = listing.address;

    const addressData = req.body;


    const validationResult = EditListingAddressSchema.safeParse(addressData);

    if (!validationResult.success) {
      const validationError: ZodError = validationResult.error;

      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ message: validationError.errors[0].message });
    }

    if (validationResult.success) {
      const { addressLine, city, district, state, pinCode } =
        validationResult.data;

      const updatedAddress = await HotelAddress.findByIdAndUpdate(
        addressID,
        { addressLine, city, district, state, pinCode },
        { new: true }
      );

      if (updatedAddress)
        return res
          .status(HTTP_STATUS_CODES.OK)
          .json({ message: "successfully updated the address" });

      return res.send(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "failed to update the address" });
    }
  } catch (err) {
    console.log(err);

    next(err);
  }
};
