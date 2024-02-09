import express from "express";
import handleRefreshToken from "../../Controllers/refreshTokenController";


const router = express.Router();

router.get("/",handleRefreshToken );

export default router;
