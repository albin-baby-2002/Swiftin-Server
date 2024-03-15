"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const LisitingData_1 = require("../../Controllers/GeneralData/LisitingData");
const router = express_1.default.Router();
router.get("/details/:listingID", LisitingData_1.ListingDataHandler);
exports.default = router;
