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
exports.resendOtpHandler = exports.verifyOtpHandler = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const otpDataModel_1 = require("../../Models/otpDataModel");
const mongoose_1 = __importDefault(require("mongoose"));
const userVerificationHelper_1 = require("../../Helpers/userVerificationHelper");
const resendAttempts_1 = __importDefault(require("../../Models/resendAttempts"));
const userModel_1 = require("../../Models/userModel");
const statusCodes_1 = require("../../Enums/statusCodes");
const verifyOtpHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { otp, email, userId } = req.body;
        userId = new mongoose_1.default.Types.ObjectId(userId);
        if (!otp) {
            return res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "All fields are required." });
        }
        if (!email || !userId) {
            return res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "email or userId is empty" });
        }
        const otpVerificationData = yield otpDataModel_1.OTP.findOne({
            userId,
        });
        if (otpVerificationData) {
            if (yield bcrypt_1.default.compare(otp, otpVerificationData.otp)) {
                const updateUser = yield userModel_1.User.updateOne({ _id: userId }, { $set: { verified: true } });
                if (updateUser) {
                    return res.status(statusCodes_1.HTTP_STATUS_CODES.OK).json({ message: "success" });
                }
                else {
                    return res.status(statusCodes_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Failed updating user data" });
                }
            }
            else {
                return res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: " Enter the right otp" });
            }
        }
        else {
            return res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "OTP Expired" });
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.verifyOtpHandler = verifyOtpHandler;
const resendOtpHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { email, userId } = req.body;
        userId = new mongoose_1.default.Types.ObjectId(userId);
        if (!email || !userId) {
            return res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "email or userId is empty" });
        }
        const user = yield userModel_1.User.findById(userId);
        const resendAttempts = yield resendAttempts_1.default.findOne({
            email: user === null || user === void 0 ? void 0 : user.email,
        });
        if (resendAttempts && (resendAttempts === null || resendAttempts === void 0 ? void 0 : resendAttempts.attempts) >= 3) {
            return res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({
                message: "Too many OTP resend attempts. Please try again after 5 minutes",
            });
        }
        if (user) {
            yield (0, userVerificationHelper_1.sendOtpEmail)(user);
            if (resendAttempts) {
                resendAttempts.attempts = resendAttempts.attempts + 1 || 1;
                yield resendAttempts.save();
            }
            else {
                const newResendAttempt = new resendAttempts_1.default({
                    userID: user._id,
                    email: user.email,
                    attempts: 1,
                });
                yield newResendAttempt.save();
            }
            return res.sendStatus(statusCodes_1.HTTP_STATUS_CODES.OK);
        }
        else {
            return res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "email or userId is empty" });
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.resendOtpHandler = resendOtpHandler;
