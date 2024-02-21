import express from "express";
import {  loginController } from "../../Controllers/AuthControllers/loginController";

const router = express.Router();

router.post("/", loginController);

export default router;
