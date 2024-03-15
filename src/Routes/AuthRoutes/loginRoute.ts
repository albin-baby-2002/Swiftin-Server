import express from "express";
import {   loginHandler } from "../../Controllers/AuthControllers/loginController";

const router = express.Router();

router.post("/", loginHandler);

export default router;
