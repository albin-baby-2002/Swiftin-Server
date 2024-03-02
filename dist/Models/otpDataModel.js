"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const OtpDataSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: "3m",
        default: Date.now,
    },
});
exports.OTP = mongoose_1.default.model("OtpData", OtpDataSchema);
