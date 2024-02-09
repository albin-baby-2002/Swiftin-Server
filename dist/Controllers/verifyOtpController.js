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
exports.verifyOtpHandler = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const otpDataModel_1 = __importDefault(require("../Models/otpDataModel"));
const userModel_1 = __importDefault(require("../Models/userModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const verifyOtpHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { otp, email, userId } = req.body;
        userId = new mongoose_1.default.Types.ObjectId(userId);
        if (!otp || !email || !userId) {
            return res.status(400).json({ message: "All fields are required." });
        }
        const otpVerificationData = yield otpDataModel_1.default.findOne({
            userId,
        });
        if (otpVerificationData) {
            if (yield bcrypt_1.default.compare(otp, otpVerificationData.otp)) {
                const updateUser = yield userModel_1.default.updateOne({ _id: userId }, { $set: { verified: true } });
                if (updateUser) {
                    return res.status(200).json({ message: "success" });
                }
                else {
                    return res.status(500).json({ message: "Failed updating user data" });
                }
            }
            else {
                return res.status(400).json({ message: " wrong otp" });
            }
        }
        else {
            return res.status(400).json({ message: "OTP Expired" });
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.verifyOtpHandler = verifyOtpHandler;
