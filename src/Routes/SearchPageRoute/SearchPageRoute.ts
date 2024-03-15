import express from "express";
import {  listingsDataBySearchHandler } from "../../Controllers/GeneralData/SearchPage";

const router = express.Router();

router.get("/", listingsDataBySearchHandler);

export default router;
