"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleAuthController_1 = require("../../Controllers/AuthControllers/googleAuthController");
const router = express_1.default.Router();
router.post("/", googleAuthController_1.googleAuthHandler);
exports.default = router;
