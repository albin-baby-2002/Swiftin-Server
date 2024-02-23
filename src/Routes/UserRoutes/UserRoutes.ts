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

const router = express.Router();

router.route("/profile").get(getProfileInfo).patch(editProfileHandler);
router.patch("/profileImg", profileImgChangeHandler);

router.get("/listings", getAllHostListings);

router.patch("/listing/images/:listingID", editListingImagesHandler);

router.patch("/listings/activate/:listingID", activateListing);
router.patch("/listings/deactivate/:listingID", deActivateListing);

router
  .route("/listing/address/:listingID")
  .get(getListingAddress)
  .patch(editListingAddress);

router
  .route("/listing/:listingID")
  .get(getSingleListingData)
  .patch(editListingHandler);

export default router;
