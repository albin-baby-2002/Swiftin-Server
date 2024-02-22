"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../../Controllers/UserControllers/UserController");
const listingsController_1 = require("../../Controllers/UserControllers/listingsController");
const router = express_1.default.Router();
router.route("/profile").get(UserController_1.getProfileInfo).patch(UserController_1.editProfileHandler);
router.patch("/profileImg", UserController_1.profileImgChangeHandler);
router.get("/listings", listingsController_1.getAllHostListings);
router.patch("/listings/activate/:listingID", listingsController_1.activateListing);
router.patch("/listings/deactivate/:listingID", listingsController_1.deActivateListing);
exports.default = router;
