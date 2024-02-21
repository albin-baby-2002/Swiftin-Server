import express from "express";
import { authController } from "../../Controllers/AuthControllers/loginController";
import {
  addNewUserHandler,
  blockUserHandler,
  editUserHandler,
  getAllUsers,
  getUserDataHandler,
  unBlockUserHandler,
} from "../../Controllers/AdminControllers/userManagement";

const router = express.Router();

router.get("/users", getAllUsers);

router.post("/user/add", addNewUserHandler);

router.get("/user/:userID", getUserDataHandler);
router.patch("/user/:userID", editUserHandler);
router.patch("/user/block/:userID", blockUserHandler);
router.patch("/user/unblock/:userID", unBlockUserHandler);

export default router;
