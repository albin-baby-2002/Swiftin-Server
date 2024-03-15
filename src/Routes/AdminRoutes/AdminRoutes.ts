import express from "express";

import {
  addNewUserHandler,
  blockUserHandler,
  editUserHandler,
  getAllUsersHandler,
  getUserDataHandler,
  unBlockUserHandler,
} from "../../Controllers/AdminControllers/userManagement";
import {
  approveListingHandler,
  disapproveListingHandler,
  getAllListingsHandler,
} from "../../Controllers/AdminControllers/listingsControllers";
import { getAllReservationsHandler } from "../../Controllers/AdminControllers/reservationControllers";
import {
  getCardDataHandler,
  getChartDataHandler,
} from "../../Controllers/AdminControllers/consoleControllers";
import { getAllHostsHandler } from "../../Controllers/AdminControllers/hostControllers";

const router = express.Router();

// get all user data

router.get("/users", getAllUsersHandler);

// admin add new user

router.post("/user/add", addNewUserHandler);

// get single user data or edit single user data 

router.route("/user/:userID").get(getUserDataHandler).patch(editUserHandler);

// block a user

router.patch("/user/block/:userID", blockUserHandler);

// unblock a user

router.patch("/user/unblock/:userID", unBlockUserHandler);

// get all listings data

router.get("/listings", getAllListingsHandler);

// approve a listing

router.patch("/listing/approve/:listingID", approveListingHandler);

// disapprove a listing

router.patch("/listing/disapprove/:listingID", disapproveListingHandler);

// get all reservations data

router.get("/reservations", getAllReservationsHandler);

// get all hosts data

router.get("/hosts", getAllHostsHandler);

// get cards data for console

router.get("/cards", getCardDataHandler);

// get chart data for console

router.get("/charts", getChartDataHandler);

export default router;
