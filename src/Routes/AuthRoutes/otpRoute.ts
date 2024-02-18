import express from "express";
import {
  resendOtpHandler,
  verifyOtpHandler,
} from "../../Controllers/OtpController";

const router = express.Router();

router.post("/verify", verifyOtpHandler);

router.post("/resend", resendOtpHandler);

export default router;
