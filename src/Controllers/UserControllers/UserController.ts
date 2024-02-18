import { NextFunction, Request, Response } from "express";
import User from "../../Models/userModel";
import { PersonalAddress } from "../../Models/personalAddress";
import mongoose, { ObjectId } from "mongoose";

interface CustomRequest extends Request {
  userInfo?: {
    id: string;
    username: string;
    roles: number[];
  };
}

export const getProfileInfo = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userInfo?.id) {
      return res.status(400).json({ message: "failed to load user data" });
    }

    let userID = new mongoose.Types.ObjectId(req.userInfo.id);

    console.log(userID);

    const userData = await User.aggregate([
      {
        $match: {
          _id: userID,
        },
      },
      {
        $lookup: {
          from: "personaladdresses",
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
          username: 1,
          email: 1,
          aboutYou: 1,
          phone: 1,
          wallet: 1,
          image: 1,
          address: 1,
          addressLine: "$addressData.addressLine",
          locality: "$addressData.locality",
          city: "$addressData.city",
          state: "$addressData.state",
          district: "$addressData.district",
          country: "$addressData.country",
          pinCode: "$addressData.pinCode",
        },
      },
    ]);

    console.log(userData);

    return res.status(200).json({ userData: userData[0] });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const editProfileHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = req.userInfo?.id;

    if (!userID) {
      return res.status(400).json({ message: "failed to identify user " });
    }

    const {
      username,
      phone,
      aboutYou,
      addressLine,
      locality,
      city,
      district,
      state,
      country,
      pinCode,
    } = req.body;

    console.log(req.body);

    const user = await User.findById(userID);

    if (user) {
      user.username = username;
      user.phone = phone;
      user.aboutYou = aboutYou;

      await user.save();

      if (!user?.address) {
        const address = new PersonalAddress({
          userID: user?._id,
          addressLine,
          locality,
          city,
          district,
          state,
          country,
          pinCode,
        });

        await address.save();

        user.address = address._id;

        await user.save();

        return res.sendStatus(200);
      }

      const address = await PersonalAddress.findByIdAndUpdate(user.address, {
        addressLine,
        locality,
        city,
        district,
        state,
        country,
        pinCode,
      });

      console.log("success");
      return res.sendStatus(200);
    }
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const profileImgChangeHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userID = req.userInfo?.id;

    if (!userID) {
      return res.status(400).json({ message: "failed to identify user " });
    }

    const { publicID } = req.body;

    console.log(req.body, "img upload ");

    const user = await User.findById(userID);

    if (user) {
      user.image = publicID;

      await user.save();

      return res.sendStatus(200);
    }
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
