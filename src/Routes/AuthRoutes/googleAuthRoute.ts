import express from "express";
import handleGoogleAuth from "../../Controllers/AuthControllers/googleAuthController";

const router = express.Router();

router.post("/", handleGoogleAuth);

export default router;
