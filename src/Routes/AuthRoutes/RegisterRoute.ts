import express from "express";
import { newUserRegister } from "../../Controllers/registerController";

const router = express.Router();

router.post("/", newUserRegister);

export default router;
