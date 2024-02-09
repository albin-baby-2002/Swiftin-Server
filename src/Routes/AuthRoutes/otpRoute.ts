import express from "express";
import { verifyOtpHandler } from "../../Controllers/verifyOtpController";

const router = express.Router();

router.post("/", verifyOtpHandler);

export default router;
