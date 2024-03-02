"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.sendOtpEmail = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv = __importStar(require("dotenv"));
const otpDataModel_1 = require("../Models/otpDataModel");
dotenv.config();
const sendOtpEmail = ({ _id, email }) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    console.log("otp", otp);
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.USER_AUTH_FROM_EMAIL,
            pass: process.env.USER_AUTH_SMTP_PASS,
        },
    });
    const mailOptions = {
        from: "sejibaby54@gmail.com",
        to: email,
        subject: "For email verification from SwiftIn",
        html: `<P> Your OTP for verification is ${otp} . Don't share your otp !</p> <p> The otp is only valid for 5 minutes</p> `,
    };
    const hashedOtp = yield bcrypt_1.default.hash(otp, 10);
    const existingOtpData = yield otpDataModel_1.OTP.findOne({ userId: _id });
    if (existingOtpData) {
        const deletedOldOtpData = yield otpDataModel_1.OTP.deleteOne({ userId: _id });
        // redirect if deletion failed
    }
    const otpdata = new otpDataModel_1.OTP({
        userId: _id,
        otp: hashedOtp,
    });
    yield otpdata.save();
    yield transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return false;
        }
        else {
            console.log("email has send ", info.response);
            return true;
        }
    });
});
exports.sendOtpEmail = sendOtpEmail;
