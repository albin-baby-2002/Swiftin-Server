import express from "express";
import { getUserDataHandler } from "../../Controllers/AdminControllers/userManagement";
import { editProfileHandler, getProfileInfo } from "../../Controllers/UserControllers/UserController";

const router = express.Router();

router.get("/profile", getProfileInfo);
router.patch("/profile", editProfileHandler);

export default router;
