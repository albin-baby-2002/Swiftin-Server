import { NextFunction, Request, Response } from "express";

import mongoose from "mongoose";
import { HotelListing } from "../../Models/hotelLisitingModal";
import { User } from "../../Models/userModel";
import { Chat } from "../../Models/chatModel";

interface CustomRequest extends Request {
  userInfo?: {
    id: string;
    username: string;
    roles: number[];
  };
}

export const SearchUsersForChat = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let search = "";

    if (req.query.search) {
      search = (req.query.search as String).trim();
    }

    const query = {
      $or: [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
      blocked: false,
      verified: true,
      _id: { $ne: req.userInfo?.id },
    };

    const Users = await User.find(query,{username:1,email:1,image:1});
    
 

    return res.status(200).json({ Users });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const GetExistingConversationOrCreateNew = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipientID = new mongoose.Types.ObjectId(req.body.recipientID);

    if (!recipientID) {
      return res.status(400).json({ message: "Recipient id not received" });
    }

    let conversation = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.userInfo?.id } } },
        { users: { $elemMatch: { $eq: recipientID } } },
      ],
    })
      .populate({ path: "users", select: "username email image" })
      .populate("latestMessage");

    conversation = await User.populate(conversation, {
      path: "latestMessage.sender",
      select: "username email image",
    });

    if (conversation.length > 0) {
      return res.status(200).json({ conversation:conversation[0] });
    } else {
      let conversation = new Chat({
        chatName: "sender",
        isGroupChat: false,
        users: [recipientID, req.userInfo?.id],
      });

      await conversation.save();

      conversation = await Chat.findById(conversation._id).populate({
        path: "users",
        select: "username email image",
      });

      return res.status(200).json({ conversation });
    }
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const getAllConversationsData = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let conversations = await Chat.find({
      users: { $elemMatch: { $eq: req.userInfo?.id } },
    })
      .populate({ path: "users", select: "username email image" })
      .populate({ path: "groupAdmin", select: "username email image" })
      .populate("latestMessage")
      .sort({updatedAt:-1});
      
      console.log(conversations)
      

    return res.status(200).json({ conversations,userID:req.userInfo?.id });
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
