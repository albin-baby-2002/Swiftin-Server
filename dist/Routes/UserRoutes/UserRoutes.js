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
router.patch("/listing/images/:listingID", listingsController_1.editListingImagesHandler);
router.patch("/listings/activate/:listingID", listingsController_1.activateListing);
router.patch("/listings/deactivate/:listingID", listingsController_1.deActivateListing);
router
    .route("/listing/address/:listingID")
    .get(listingsController_1.getListingAddress)
    .patch(listingsController_1.editListingAddress);
router
    .route("/listing/:listingID")
    .get(listingsController_1.getSingleListingData)
    .patch(listingsController_1.editListingHandler);
exports.default = router;
