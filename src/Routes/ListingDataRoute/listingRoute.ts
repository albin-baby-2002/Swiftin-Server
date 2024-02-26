import express from "express";
import { ListingData } from "../../Controllers/GeneralData/LisitingData";


const router = express.Router();

router.get("/details/:listingID", ListingData);

export default router;
