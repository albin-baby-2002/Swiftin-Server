"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const otpDataSchema = new mongoose_1.default.Schema({
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
// otpDataSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
const otp = mongoose_1.default.model("OtpData", otpDataSchema);
exports.default = otp;
