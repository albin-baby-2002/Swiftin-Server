import express from "express";
import { getUserDataHandler } from "../../Controllers/AdminControllers/userManagement";
import { listPropertyHandler } from "../../Controllers/PropertyControllers/propertyControllers";


const router = express.Router();

router.post("/list",listPropertyHandler );


export default router;
