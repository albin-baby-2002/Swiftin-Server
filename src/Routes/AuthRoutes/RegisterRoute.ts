import express from "express";
import { newUserRegister } from "../../Controllers/AuthControllers/registerController";

const router = express.Router();

router.post("/", newUserRegister);

export default router;
