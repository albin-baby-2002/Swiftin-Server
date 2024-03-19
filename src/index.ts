import * as dotenv from "dotenv";
dotenv.config();

import listingDataRoute from "./Routes/ListingDataRoute/listingRoute";
import SearchPageRoute from "./Routes/SearchPageRoute/SearchPageRoute";
import refreshTokenRoute from "./Routes/AuthRoutes/RefreshTokenRoute";
import googleAuthRoute from "./Routes/AuthRoutes/googleAuthRoute";
import registerRoute from "./Routes/AuthRoutes/RegisterRoute";
import logoutRoute from "./Routes/AuthRoutes/LogoutRoute";
import { Request, Response, NextFunction } from "express";
import credentials from "./Middlewares/Credentials";
import corsOptions from "./config/corsOptions";
import connectDB from "./config/dbConnection";
import cookieParser from "cookie-parser";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";

import { Server } from "socket.io";
import { TMessage } from "./Types/chatTypes";
import { ROLES_LIST } from "./Enums/userRoles";
import otpRoute from "./Routes/AuthRoutes/otpRoute";
import verifyRoles from "./Middlewares/VerifyRoles";
import loginRoute from "./Routes/AuthRoutes/loginRoute";
import { HTTP_STATUS_CODES } from "./Enums/statusCodes";
import userRoutes from "./Routes/UserRoutes/UserRoutes";
import { verifyJWT } from "./Middlewares/JwtVerification";
import adminRoutes from "./Routes/AdminRoutes/AdminRoutes";
import { chatRouter } from "./Routes/ChatRoutes/chatRoutes";
import { messageRouter } from "./Routes/MessageRoutes/messageRoute";
import { checkIsUserBlocked } from "./Middlewares/checkIsUserBlocked";

const app = express();

const PORT = process.env.PORT || 3500;

// connect to mongodb database

connectDB();

// access-control-allow-credentials

app.use(credentials);

// console req url

app.use((req, res, next) => {
  console.log(`Requested URL: ${req.url}`);
  next();
});

app.use(cors(corsOptions));

app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.use(cookieParser());

app.use(express.json());

app.get("/api", (req, res, next) => {
  res.status(200).json({ message: "welcome to swiftin api" });
});
app.use("/api/register", registerRoute);
app.use("/api/otp", otpRoute);
app.use("/api/auth", loginRoute);
app.use("/api/auth/google", googleAuthRoute);
app.use("/api/refreshToken", refreshTokenRoute);
app.use("/api/logout", logoutRoute);
app.use("/api/search", SearchPageRoute);
app.use("/api/listing", listingDataRoute);

// authenticate users using jwt for private routes

app.use(verifyJWT);

app.use("/api/admin", verifyRoles(ROLES_LIST.Admin), adminRoutes);

// check is user blocked by admin before providing access to routes

app.use(checkIsUserBlocked);

app.use("/api/user", verifyRoles(ROLES_LIST.User), userRoutes);
app.use("/api/chat", verifyRoles(ROLES_LIST.User), chatRouter);
app.use("/api/messages", verifyRoles(ROLES_LIST.User), messageRouter);

// error handler

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  return res
    .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
    .json({ message: "server facing unexpected errors" });
});

// 404 Error Middleware

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: "Not Found" });
});

// running the server application

let server;

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  server = app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );

  const io = new Server(server, {
    pingTimeout: 60000,
    cors: corsOptions,
  });

  io.use((socket, next) => {
    const token = socket.handshake.query.token;

    if (typeof token != "string" || !process.env.ACCESS_TOKEN_SECRET)
      return next(
        new Error(
          "token not recieved or failed to get secret to verify accessToken"
        )
      );

    // Validate JWT token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
      if (err) {
        return next(new Error("Unauthorized"));
      } else {
        return next();
      }
    });
  });

  io.on("connection", (socket): void => {
    socket.on("setup", (userData) => {
      socket.join(userData);
      socket.emit("setup complete");
    });

    socket.on("disconnect", () => {});

    socket.on("join chat", (room) => {
      socket.join(room);
    });

    socket.on("typing", (room) => {
      socket.in(room).emit("typing now", { room });
    });
    socket.on("stop typing", (room) => {
      socket.in(room).emit("stop typing", { room });
    });

    socket.on("new message", (newMessage: TMessage) => {
      let chat = newMessage.chat;

      if (!chat.users) return console.log("chat.users is not defined");

      chat.users.forEach((user) => {
        if (user._id === newMessage.sender._id) return;

        socket.in(user._id).emit("message recieved", newMessage);
      });
    });
  });

  io.use((socket, next) => {
    socket.on("error", (error) => {
      if (error.message === "Unauthorized") {
        // Send a 403 Forbidden response
        socket.emit("unauthorized", {
          message: "You are not authorized to connect.",
        });
      }
    });
    next();
  });
});
