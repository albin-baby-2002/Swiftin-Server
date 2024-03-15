"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllMessagesOfChatHandler = exports.sendMessageHandler = void 0;
const messageModel_1 = require("../../Models/messageModel");
const userModel_1 = require("../../Models/userModel");
const chatModel_1 = require("../../Models/chatModel");
const statusCodes_1 = require("../../Enums/statusCodes");
const sendMessageHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { content, chatID } = req.body;
        if (!content || !chatID) {
            return res
                .status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST)
                .json({ message: " missing chatID or content of message " });
        }
        const userID = (_a = req.userInfo) === null || _a === void 0 ? void 0 : _a.id;
        if (!userID) {
            return res
                .status(statusCodes_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
                .json({ message: " Failed to identify user from req " });
        }
        let message = new messageModel_1.Message({
            sender: userID,
            content,
            chat: chatID,
        });
        yield message.save();
        message = yield message.populate("sender", "username email image");
        message = yield message.populate("chat");
        message = yield userModel_1.User.populate(message, {
            path: "chat.users",
            select: "username image email",
        });
        yield chatModel_1.Chat.findByIdAndUpdate(chatID, {
            latestMessage: message,
        });
        res.status(statusCodes_1.HTTP_STATUS_CODES.OK).json(message);
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.sendMessageHandler = sendMessageHandler;
const getAllMessagesOfChatHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chatID = req.params.chatID;
        if (!chatID) {
            return res
                .status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST)
                .json({ message: "failed to identify chat" });
        }
        const messages = yield messageModel_1.Message.find({ chat: chatID })
            .populate("sender", "username email image")
            .populate("chat");
        return res.status(statusCodes_1.HTTP_STATUS_CODES.OK).json(messages);
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getAllMessagesOfChatHandler = getAllMessagesOfChatHandler;
