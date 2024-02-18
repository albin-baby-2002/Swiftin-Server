import express from "express";
const app = express();

import * as dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/dbConnection";
import credentials from "./Middlewares/Credentials";
import corsOptions from "./config/corsOptions";
import registerRoute from "./Routes/AuthRoutes/RegisterRoute";
import otpRoute from "./Routes/AuthRoutes/otpRoute";
import authRoute from "./Routes/AuthRoutes/AuthRoute";
import refreshTokenRoute from "./Routes/AuthRoutes/RefreshTokenRoute";
import googleAuthRoute from "./Routes/AuthRoutes/googleAuthRoute";
import logoutRoute from "./Routes/AuthRoutes/LogoutRoute";
import verifyJWT from "./Middlewares/JwtVerification";
import verifyRoles from "./Middlewares/VerifyRoles";
import ROLES_LIST from "./config/allowedRoles";
import adminRoutes from "./Routes/AdminRoutes/AdminRoutes";
import userRoutes from "./Routes/UserRoutes/UserRoutes"

const PORT = process.env.PORT || 3500;

// connect to mongodb database

connectDB();

// access-control-allow-credentials
app.use((req, res, next) => {
  console.log(`Requested URL: ${req.url}`);
  next();
});

app.use(credentials);

app.use(cors(corsOptions));

app.use("/public", express.static(path.join(__dirname, "..", "public")));

console.log(path.join(__dirname, "..", "public"));

app.use(cookieParser());

app.use(express.json());

app.use("/register", registerRoute);

app.use("/otp/", otpRoute);
app.use("/auth", authRoute);
app.use("/auth/google", googleAuthRoute);
app.use("/refreshToken", refreshTokenRoute);
app.use("/logout", logoutRoute);

// authenticate users using jwt for private routes

app.use(verifyJWT);

app.use("/admin/", verifyRoles(ROLES_LIST.Admin), adminRoutes);
app.use("/user/", verifyRoles(ROLES_LIST.User), userRoutes );

// app.use("/user", verifyRoles(ROLES_LIST.User), userRouter);

// 404 Error Middleware

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: "Not Found" });
});

// Error Handler

// app.use(errorHandler);

// running the server application

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
