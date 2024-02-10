import express from "express";
import handleGoogleAuth from "../../Controllers/googleAuthController";


const router = express.Router();

router.post("/", handleGoogleAuth);

export default router;
