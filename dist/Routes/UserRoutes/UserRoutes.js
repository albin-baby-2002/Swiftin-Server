"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../../Controllers/UserControllers/UserController");
const listingsController_1 = require("../../Controllers/UserControllers/listingsController");
const propertyControllers_1 = require("../../Controllers/PropertyControllers/propertyControllers");
const router = express_1.default.Router();
// get profile info of the user and edit it
router.route("/profile").get(UserController_1.getProfileInfo).patch(UserController_1.editProfileHandler);
// edit profile image of the user
router.patch("/profileImg", UserController_1.profileImgChangeHandler);
// listings hosted by user data
router.get("/listings", listingsController_1.getAllHostListings);
router.post("/listing/reserve/createOrder", propertyControllers_1.createReservationOrderHandler);
router.post("/listing/reserve/success", propertyControllers_1.validatePaymentAndCompleteReservation);
router.post("/listing/checkAvailability", propertyControllers_1.checkAvailability);
// activate and deactivate reservations for listing hosted by user
router.patch("/listings/activate/:listingID", listingsController_1.activateListing);
router.patch("/listings/deactivate/:listingID", listingsController_1.deActivateListing);
router.get("/listing/wishlist/", propertyControllers_1.getWishlistData);
router.patch("/listing/wishlist/add/:listingID", propertyControllers_1.AddToWishlist);
router.patch("/listing/wishlist/remove/:listingID", propertyControllers_1.removeFromWishlist);
router.post("/listing/review/add/:listingID", propertyControllers_1.addReview);
// edit images of hosting listed by user
router.patch("/listing/images/:listingID", listingsController_1.editListingImagesHandler);
// get and modify address of listings hosted by user
router
    .route("/listing/address/:listingID")
    .get(listingsController_1.getListingAddress)
    .patch(listingsController_1.editListingAddress);
// get the data of single listing hosted by user and edit its general info
router
    .route("/listing/:listingID")
    .get(listingsController_1.getSingleListingData)
    .patch(listingsController_1.editListingHandler);
router.get("/bookings", propertyControllers_1.getAllUserBookings);
router.patch("/bookings/:reservationID", propertyControllers_1.cancelReservationHandler);
router.get("/reservations/received", propertyControllers_1.getAllListingsReservations);
router.patch("/reservations/received/cancel/:reservationID", propertyControllers_1.hostCancelReservation);
exports.default = router;
