"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SearchPage_1 = require("../../Controllers/GeneralData/SearchPage");
const router = express_1.default.Router();
router.get("/", SearchPage_1.listingsDataBySearchHandler);
exports.default = router;
