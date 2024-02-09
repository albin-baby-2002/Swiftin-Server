"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyOtpController_1 = require("../../Controllers/verifyOtpController");
const router = express_1.default.Router();
router.post("/", verifyOtpController_1.verifyOtpHandler);
exports.default = router;
