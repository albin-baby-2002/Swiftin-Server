import express from "express";
import { authController } from "../../Controllers/authController";
import { getAllUsers } from "../../Controllers/AdminControllers/userManagement";

const router = express.Router();

router.get("/users", getAllUsers);

export default router;
