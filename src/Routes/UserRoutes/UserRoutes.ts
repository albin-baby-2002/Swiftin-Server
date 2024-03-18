import express from "express";
import { getUserDataHandler } from "../../Controllers/AdminControllers/userManagement";
import {
  editProfileHandler,
  getProfileInfo,
  profileImgChangeHandler,
} from "../../Controllers/UserControllers/UserController";
import {
  activateListing,
  deActivateListing,
  editListingAddress,
  editListingHandler,
  editListingImagesHandler,
  getAllHostListings,
  getListingAddress,
  getSingleListingData,
} from "../../Controllers/UserControllers/listingsController";
import {
  AddToWishlist,
  addReview,
  cancelReservationHandler,
  checkAvailability,
  createReservationOrderHandler,
  getAllListingsReservations,
  getAllUserBookings,
  getWishlistData,
  hostCancelReservation,
  listPropertyHandler,
  removeFromWishlist,
  validatePaymentAndCompleteReservation,
} from "../../Controllers/PropertyControllers/propertyControllers";

const router = express.Router();

// get profile info of the user and edit it

router.route("/profile").get(getProfileInfo).patch(editProfileHandler);

// edit profile image of the user

router.patch("/profileImg", profileImgChangeHandler);

// listings hosted by user data

router.get("/listings", getAllHostListings);

// create order for a listing

router.post("/listing/reserve/createOrder", createReservationOrderHandler);

// handle payment success

router.post("/listing/reserve/success", validatePaymentAndCompleteReservation);

// check is rooms available on a given date for a listing

router.post("/listing/checkAvailability", checkAvailability);

// activate and deactivate reservations for listing hosted by user

router.patch("/listings/activate/:listingID", activateListing);
router.patch("/listings/deactivate/:listingID", deActivateListing);

// get wishlist data and add and remove from wishlist
router.get("/listing/wishlist/", getWishlistData);
router.patch("/listing/wishlist/add/:listingID", AddToWishlist);
router.patch("/listing/wishlist/remove/:listingID", removeFromWishlist);

router.post("/listing/review/add/:listingID", addReview);

// edit images of hosting listed by user

router.patch("/listing/images/:listingID", editListingImagesHandler);

// get and modify address of listings hosted by user

router
  .route("/listing/address/:listingID")
  .get(getListingAddress)
  .patch(editListingAddress);

// get the data of single listing hosted by user and edit its general info

router
  .route("/listing/:listingID")
  .get(getSingleListingData)
  .patch(editListingHandler);

// get data of all bookings by user

router.get("/bookings", getAllUserBookings);

// cancel a reservation by user

router.patch("/bookings/:reservationID", cancelReservationHandler);
// give data of all reservation to host

router.get("/reservations/received", getAllListingsReservations);

// cancel reservation by host

router.patch(
  "/reservations/received/cancel/:reservationID",
  hostCancelReservation
);

// listing new property

router.post("/property/list", listPropertyHandler);

export default router;
