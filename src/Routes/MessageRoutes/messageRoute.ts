import express from "express";
import {
  getAllMessagesOfChatHandler,
  sendMessageHandler,
} from "../../Controllers/MessageControllers/MessageController";

export const messageRouter = express.Router();

messageRouter.post("/send", sendMessageHandler);
messageRouter.get("/:chatID", getAllMessagesOfChatHandler);
