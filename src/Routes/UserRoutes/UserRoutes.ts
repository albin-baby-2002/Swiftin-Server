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
  editListingHandler,
  getAllHostListings,
  getSingleListingData,
} from "../../Controllers/UserControllers/listingsController";

const router = express.Router();

router.route("/profile").get(getProfileInfo).patch(editProfileHandler);

router.patch("/profileImg", profileImgChangeHandler);

router.get("/listings", getAllHostListings);

router.route("/listing/:listingID").get( getSingleListingData) .patch(editListingHandler) ;

router.patch("/listings/activate/:listingID", activateListing);
router.patch("/listings/deactivate/:listingID", deActivateListing);

export default router;
