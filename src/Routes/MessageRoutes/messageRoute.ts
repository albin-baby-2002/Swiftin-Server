import express from "express";
import { getAllMessagesOfChat, sendMessage } from "../../Controllers/MessageControllers/MessageController";

export const messageRouter = express.Router();

messageRouter.post("/send", sendMessage);
messageRouter.get("/:chatID",getAllMessagesOfChat );
