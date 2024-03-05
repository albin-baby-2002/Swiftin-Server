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
import loginRoute from "./Routes/AuthRoutes/loginRoute";
import refreshTokenRoute from "./Routes/AuthRoutes/RefreshTokenRoute";
import googleAuthRoute from "./Routes/AuthRoutes/googleAuthRoute";
import logoutRoute from "./Routes/AuthRoutes/LogoutRoute";
import SearchPageRoute from "./Routes/SearchPageRoute/SearchPageRoute";
import listingDataRoute from "./Routes/ListingDataRoute/listingRoute";

import verifyRoles from "./Middlewares/VerifyRoles";
import ROLES_LIST from "./config/allowedRoles";
import adminRoutes from "./Routes/AdminRoutes/AdminRoutes";
import userRoutes from "./Routes/UserRoutes/UserRoutes";
import propertyRoutes from "./Routes/PropertyRoutes/propertyRoutes";
import { verifyJWT } from "./Middlewares/JwtVerification";
import { checkIsUserBlocked } from "./Middlewares/checkIsUserBlocked";
import { chatRouter } from "./Routes/ChatRoutes/chatRoutes";
import { messageRouter } from "./Routes/MessageRoutes/messageRoute";
import { Server, Socket } from "socket.io";
import { Console } from "console";

interface TUserData {
  _id: string;
  username: string;
  email: string;
  image: string;
}

export interface Tmessage {
  sender: Sender;
  content: string;
  chat: Chat;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sender {
  _id: string;
  username: string;
  email: string;
  image: string;
}

export interface Chat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: TUserData[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  latestMessage: string;
}

const PORT = process.env.PORT || 3500;

// connect to mongodb database

connectDB();

// access-control-allow-credentials
app.use((req, res, next) => {
  // console.log(`Requested URL: ${req.url}`);
  next();
});

app.use(credentials);

app.use(cors(corsOptions));

app.use("/public", express.static(path.join(__dirname, "..", "public")));

// console.log(path.join(__dirname, "..", "public"));

app.use(cookieParser());

app.use(express.json());

app.use("/register", registerRoute);

app.use("/otp/", otpRoute);
app.use("/auth", loginRoute);
app.use("/auth/google", googleAuthRoute);
app.use("/refreshToken", checkIsUserBlocked, refreshTokenRoute);
app.use("/logout", logoutRoute);
app.use("/search", SearchPageRoute);
app.use("/listing/", listingDataRoute);

// authenticate users using jwt for private routes

app.use(verifyJWT);

app.use("/admin", verifyRoles(ROLES_LIST.Admin), adminRoutes);
app.use("/user", checkIsUserBlocked, verifyRoles(ROLES_LIST.User), userRoutes);
app.use("/chat", verifyRoles(ROLES_LIST.User), chatRouter);
app.use("/messages", verifyRoles(ROLES_LIST.User), messageRouter);
app.use("/property", verifyRoles(ROLES_LIST.User), propertyRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  return res.status(500).json({ message: "server facing unexpected errors" });
});

// 404 Error Middleware

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: "Not Found" });
});

// Error Handler

// app.use(errorHandler);

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

  io.on("connection", (socket): void => {
    console.log("intial connection from client");

    socket.on("setup", (userData) => {
      console.log(userData, "setup");

      socket.join(userData);
      socket.emit("connection");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:");
    });

    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("join chat", room);
    });

    socket.on("typing", (room) => {
      console.log("typing",room);
      socket.in(room).emit("typing now",{room});
    });
    socket.on("stop typing", (room) => {
     console.log('stop typing')
      socket.in(room).emit("stop typing",{room});
    });

    socket.on("new message", (newMessage: Tmessage) => {
      let chat = newMessage.chat;

      console.log(newMessage, "new message \t \t");

      if (!chat.users) return console.log("chat.users is not defined");

      chat.users.forEach((user) => {
        if (user._id === newMessage.sender._id) return;

        console.log(user._id, "message send to \t \t ");
        socket.in(user._id).emit("message recieved", newMessage);
      });
    });
  });
});
