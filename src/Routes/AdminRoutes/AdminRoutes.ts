import express from "express";

import {
  addNewUserHandler,
  blockUserHandler,
  editUserHandler,
  getAllUsers,
  getUserDataHandler,
  unBlockUserHandler,
} from "../../Controllers/AdminControllers/userManagement";
import {
  approveListing,
  disapproveListing,
  getAllHosts,
  getAllListings,
} from "../../Controllers/AdminControllers/listingsManagement";
import { getAllReservations } from "../../Controllers/AdminControllers/getReservations";
import { getCardData, getChartData } from "../../Controllers/AdminControllers/console";

const router = express.Router();

router.get("/users", getAllUsers);

router.post("/user/add", addNewUserHandler);

router.get("/user/:userID", getUserDataHandler);
router.patch("/user/:userID", editUserHandler);
router.patch("/user/block/:userID", blockUserHandler);
router.patch("/user/unblock/:userID", unBlockUserHandler);

router.get("/listings", getAllListings);
router.patch("/listings/approve/:listingID", approveListing);
router.patch("/listings/disapprove/:listingID",disapproveListing );

router.get("/reservations",getAllReservations);
router.get("/hosts",getAllHosts);

router.get("/console",getCardData)
router.get("/charts",getChartData)

export default router;
