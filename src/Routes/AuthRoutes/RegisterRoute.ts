import express from "express";
import { newUserRegisterHandler } from "../../Controllers/AuthControllers/registerController";

const router = express.Router();

router.post("/", newUserRegisterHandler);

export default router;
