"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const propertyControllers_1 = require("../../Controllers/PropertyControllers/propertyControllers");
const router = express_1.default.Router();
router.post("/list", propertyControllers_1.listPropertyHandler);
exports.default = router;
