"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const OtpController_1 = require("../../Controllers/OtpController");
const router = express_1.default.Router();
router.post("/verify", OtpController_1.verifyOtpHandler);
router.post("/resend", OtpController_1.resendOtpHandler);
exports.default = router;
