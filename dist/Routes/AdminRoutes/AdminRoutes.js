"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userManagement_1 = require("../../Controllers/AdminControllers/userManagement");
const listingsControllers_1 = require("../../Controllers/AdminControllers/listingsControllers");
const reservationControllers_1 = require("../../Controllers/AdminControllers/reservationControllers");
const consoleControllers_1 = require("../../Controllers/AdminControllers/consoleControllers");
const hostControllers_1 = require("../../Controllers/AdminControllers/hostControllers");
const router = express_1.default.Router();
// get all user data
router.get("/users", userManagement_1.getAllUsersHandler);
// admin add new user
router.post("/user/add", userManagement_1.addNewUserHandler);
// get single user data or edit single user data 
router.route("/user/:userID").get(userManagement_1.getUserDataHandler).patch(userManagement_1.editUserHandler);
// block a user
router.patch("/user/block/:userID", userManagement_1.blockUserHandler);
// unblock a user
router.patch("/user/unblock/:userID", userManagement_1.unBlockUserHandler);
// get all listings data
router.get("/listings", listingsControllers_1.getAllListingsHandler);
// approve a listing
router.patch("/listing/approve/:listingID", listingsControllers_1.approveListingHandler);
// disapprove a listing
router.patch("/listing/disapprove/:listingID", listingsControllers_1.disapproveListingHandler);
// get all reservations data
router.get("/reservations", reservationControllers_1.getAllReservationsHandler);
// get all hosts data
router.get("/hosts", hostControllers_1.getAllHostsHandler);
// get cards data for console
router.get("/cards", consoleControllers_1.getCardDataHandler);
// get chart data for console
router.get("/charts", consoleControllers_1.getChartDataHandler);
exports.default = router;
