import { NextFunction, Request, Response } from "express";
import { Message } from "../../Models/messageModel";
import { User } from "../../Models/userModel";
import { Chat } from "../../Models/chatModel";
import { HTTP_STATUS_CODES } from "../../Enums/statusCodes";

interface CustomRequest extends Request {
  userInfo?: {
    id: string;
    username: string;
    roles: number[];
  };
}

export const sendMessageHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content, chatID } = req.body;

    if (!content || !chatID) {
      return res
        .status(HTTP_STATUS_CODES.BAD_REQUEST)
        .json({ message: " missing chatID or content of message " });
    }

    const userID = req.userInfo?.id;

    if (!userID) {
      return res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
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

    res.status(HTTP_STATUS_CODES.OK).json(message);
  } catch (err) {
    console.log(err);

    next(err);
  }
};

export const getAllMessagesOfChatHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const chatID = req.params.chatID;

    if (!chatID) {
      return res
        .status(HTTP_STATUS_CODES.BAD_REQUEST)
        .json({ message: "failed to identify chat" });
    }

    const messages = await Message.find({ chat: chatID })
      .populate("sender", "username email image")
      .populate("chat");

    return res.status(HTTP_STATUS_CODES.OK).json(messages);
  } catch (err) {
    console.log(err);

    next(err);
  }
};
