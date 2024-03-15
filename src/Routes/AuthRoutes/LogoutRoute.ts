import express from "express";

import { logoutHanlder } from "../../Controllers/AuthControllers/logoutController";

const router = express.Router();

router.get("/", logoutHanlder);

export default router;
