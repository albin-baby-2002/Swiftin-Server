import express from "express";
import { authController } from "../../Controllers/authController";


const router = express.Router();

router.post("/",authController );

export default router;
