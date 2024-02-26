import express from "express";
import { hotelDataBySearch } from "../../Controllers/GeneralData/SearchPage";


const router = express.Router();

router.get("/", hotelDataBySearch );

export default router;
