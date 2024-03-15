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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllConversationsData = exports.GetExistingConversationOrCreateNew = exports.SearchUsersForChat = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = require("../../Models/userModel");
const chatModel_1 = require("../../Models/chatModel");
const statusCodes_1 = require("../../Enums/statusCodes");
const SearchUsersForChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let search = "";
        if (req.query.search) {
            search = req.query.search.trim();
        }
        const query = {
            $or: [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ],
            "roles.Admin": { $ne: 5150 },
            blocked: false,
            verified: true,
            _id: { $ne: (_a = req.userInfo) === null || _a === void 0 ? void 0 : _a.id },
        };
        const Users = yield userModel_1.User.find(query, { username: 1, email: 1, image: 1 });
        return res.status(statusCodes_1.HTTP_STATUS_CODES.OK).json({ Users });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.SearchUsersForChat = SearchUsersForChat;
const GetExistingConversationOrCreateNew = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        const recipientID = new mongoose_1.default.Types.ObjectId(req.body.recipientID);
        if (!recipientID) {
            return res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "Recipient id not received" });
        }
        let conversation = yield chatModel_1.Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: (_b = req.userInfo) === null || _b === void 0 ? void 0 : _b.id } } },
                { users: { $elemMatch: { $eq: recipientID } } },
            ],
        })
            .populate({ path: "users", select: "username email image" })
            .populate("latestMessage");
        conversation = yield userModel_1.User.populate(conversation, {
            path: "latestMessage.sender",
            select: "username email image",
        });
        if (conversation.length > 0) {
            return res.status(statusCodes_1.HTTP_STATUS_CODES.OK).json({ conversation: conversation[0] });
        }
        else {
            let conversation = new chatModel_1.Chat({
                chatName: "sender",
                isGroupChat: false,
                users: [recipientID, (_c = req.userInfo) === null || _c === void 0 ? void 0 : _c.id],
            });
            yield conversation.save();
            conversation = yield chatModel_1.Chat.findById(conversation._id).populate({
                path: "users",
                select: "username email image",
            });
            return res.status(statusCodes_1.HTTP_STATUS_CODES.OK).json({ conversation });
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.GetExistingConversationOrCreateNew = GetExistingConversationOrCreateNew;
const getAllConversationsData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    try {
        let conversations = yield chatModel_1.Chat.find({
            users: { $elemMatch: { $eq: (_d = req.userInfo) === null || _d === void 0 ? void 0 : _d.id } },
        })
            .populate({ path: "users", select: "username email image" })
            .populate({ path: "groupAdmin", select: "username email image" })
            .populate("latestMessage")
            .sort({ updatedAt: -1 });
        return res.status(statusCodes_1.HTTP_STATUS_CODES.OK).json({ conversations, userID: (_e = req.userInfo) === null || _e === void 0 ? void 0 : _e.id });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getAllConversationsData = getAllConversationsData;
