import express from "express";
import  {
  googleAuthHandler,
} from "../../Controllers/AuthControllers/googleAuthController";
const router = express.Router();

router.post("/", googleAuthHandler);

export default router;
