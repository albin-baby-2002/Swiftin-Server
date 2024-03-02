"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const OtpResendAttemptsSchema = new mongoose_1.default.Schema({
    userID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    attempts: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        expires: "5m",
        default: Date.now,
    },
});
const OtpResendAttempts = mongoose_1.default.model("otpReSends", OtpResendAttemptsSchema);
exports.default = OtpResendAttempts;
