import { NextFunction, Request, Response } from "express";
import { Message } from "../../Models/messageModel";
import { User } from "../../Models/userModel";
import { Chat } from "../../Models/chatModel";

interface CustomRequest extends Request {
  userInfo?: {
    id: string;
    username: string;
    roles: number[];
  };
}

export const sendMessage = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content, chatID } = req.body;

    if (!content || !chatID) {
      return res
        .status(400)
        .json({ message: " missing chatID or content of message " });
    }

    const userID = req.userInfo?.id;

    if (!userID) {
      return res
        .status(500)
        .json({ message: " Failed to identify user from req " });
    }

    let message = new Message({
      sender: userID,
      content,
      chat: chatID,
    });

    await message.save();

    message = await message.populate("sender", "username email image");

    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username image email",
    });

    await Chat.findByIdAndUpdate(chatID, {
      latestMessage: message,
    });

    res.status(200).json(message);
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};

export const getAllMessagesOfChat = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const chatID = req.params.chatID;

    if (!chatID) {
      return res.status(400).json({ message: "failed to identify chat" }) ;
    }

    const messages = await Message.find({ chat: chatID })
      .populate("sender", "username email image")
      .populate("chat");

    return res.status(200).json(messages);
  } catch (err: any) {
    console.log(err);

    next(err);
  }
};
