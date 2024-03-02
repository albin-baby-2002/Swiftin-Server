"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose = require("mongoose");
const MessageModelSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    content: {
        type: String,
        trim: true,
        required: true
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        require: true
    },
}, {
    timestamps: true,
});
exports.Message = mongoose.model("Message", MessageModelSchema);
