"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const express_1 = __importDefault(require("express"));
const chatControllers_1 = require("../../Controllers/ChatControllers/chatControllers");
exports.chatRouter = express_1.default.Router();
exports.chatRouter.post("/", chatControllers_1.GetExistingConversationOrCreateNew);
exports.chatRouter.get("/users", chatControllers_1.SearchUsersForChat);
exports.chatRouter.get("/data", chatControllers_1.getAllConversationsData);
