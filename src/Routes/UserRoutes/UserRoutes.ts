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
  cancelReservationHandler,
  checkAvailability,
  createReservationOrderHanlder,
  getAllListingsReservations,
  getAllUserBookings,
  validatePaymentAndCompleteReservation,
} from "../../Controllers/PropertyControllers/propertyControllers";

const router = express.Router();

// get profile info of the user and edit it

router.route("/profile").get(getProfileInfo).patch(editProfileHandler);

// edit profile image of the user

router.patch("/profileImg", profileImgChangeHandler);

// listings hosted by user data

router.get("/listings", getAllHostListings);

router.post("/listing/reserve/createOrder", createReservationOrderHanlder);
router.post("/listing/reserve/success", validatePaymentAndCompleteReservation);

router.post("/listing/checkAvailability", checkAvailability);

// activate and deactivate reservations for listing hosted by user

router.patch("/listings/activate/:listingID", activateListing);
router.patch("/listings/deactivate/:listingID", deActivateListing);

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

router.get("/bookings", getAllUserBookings);
router.patch("/bookings/:reservationID", cancelReservationHandler);

router.get("/reservations/received", getAllListingsReservations);


export default router;
