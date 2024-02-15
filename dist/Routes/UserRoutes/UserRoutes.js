"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../../Controllers/UserControllers/UserController");
const router = express_1.default.Router();
router.get("/profile", UserController_1.getProfileInfo);
router.patch("/profile", UserController_1.editProfileHandler);
router.patch("/profileImg", UserController_1.profileImgChangeHandler);
exports.default = router;
