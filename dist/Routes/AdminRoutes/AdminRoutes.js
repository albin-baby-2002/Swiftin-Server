"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userManagement_1 = require("../../Controllers/AdminControllers/userManagement");
const listingsManagement_1 = require("../../Controllers/AdminControllers/listingsManagement");
const router = express_1.default.Router();
router.get("/users", userManagement_1.getAllUsers);
router.post("/user/add", userManagement_1.addNewUserHandler);
router.get("/user/:userID", userManagement_1.getUserDataHandler);
router.patch("/user/:userID", userManagement_1.editUserHandler);
router.patch("/user/block/:userID", userManagement_1.blockUserHandler);
router.patch("/user/unblock/:userID", userManagement_1.unBlockUserHandler);
router.get("/listings", listingsManagement_1.getAllListings);
router.patch("/listings/approve/:listingID", listingsManagement_1.approveListing);
router.patch("/listings/disapprove/:listingID", listingsManagement_1.disapproveListing);
exports.default = router;
