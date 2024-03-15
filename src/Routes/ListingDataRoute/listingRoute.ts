import express from "express";
import { ListingDataHandler } from "../../Controllers/GeneralData/LisitingData";


const router = express.Router();

router.get("/details/:listingID", ListingDataHandler);

export default router;
