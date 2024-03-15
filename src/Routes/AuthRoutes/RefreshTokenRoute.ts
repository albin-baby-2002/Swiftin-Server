import express from "express";
import  { refreshTokenHandler } from "../../Controllers/AuthControllers/refreshTokenController";

const router = express.Router();

router.get("/", refreshTokenHandler);

export default router;
