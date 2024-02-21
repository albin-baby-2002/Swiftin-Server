import express from "express";

import handleLogout from "../../Controllers/AuthControllers/logoutController";

const router = express.Router();

router.get("/", handleLogout);

export default router;
