"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const listingRoute_1 = __importDefault(require("./Routes/ListingDataRoute/listingRoute"));
const SearchPageRoute_1 = __importDefault(require("./Routes/SearchPageRoute/SearchPageRoute"));
const RefreshTokenRoute_1 = __importDefault(require("./Routes/AuthRoutes/RefreshTokenRoute"));
const googleAuthRoute_1 = __importDefault(require("./Routes/AuthRoutes/googleAuthRoute"));
const RegisterRoute_1 = __importDefault(require("./Routes/AuthRoutes/RegisterRoute"));
const LogoutRoute_1 = __importDefault(require("./Routes/AuthRoutes/LogoutRoute"));
const Credentials_1 = __importDefault(require("./Middlewares/Credentials"));
const corsOptions_1 = __importDefault(require("./config/corsOptions"));
const dbConnection_1 = __importDefault(require("./config/dbConnection"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const userRoles_1 = require("./Enums/userRoles");
const otpRoute_1 = __importDefault(require("./Routes/AuthRoutes/otpRoute"));
const VerifyRoles_1 = __importDefault(require("./Middlewares/VerifyRoles"));
const loginRoute_1 = __importDefault(require("./Routes/AuthRoutes/loginRoute"));
const statusCodes_1 = require("./Enums/statusCodes");
const UserRoutes_1 = __importDefault(require("./Routes/UserRoutes/UserRoutes"));
const JwtVerification_1 = require("./Middlewares/JwtVerification");
const AdminRoutes_1 = __importDefault(require("./Routes/AdminRoutes/AdminRoutes"));
const chatRoutes_1 = require("./Routes/ChatRoutes/chatRoutes");
const messageRoute_1 = require("./Routes/MessageRoutes/messageRoute");
const checkIsUserBlocked_1 = require("./Middlewares/checkIsUserBlocked");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3500;
// connect to mongodb database
(0, dbConnection_1.default)();
// access-control-allow-credentials
app.use(Credentials_1.default);
// console req url
app.use((req, res, next) => {
    console.log(`Requested URL: ${req.url}`);
    next();
});
app.use((0, cors_1.default)(corsOptions_1.default));
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "..", "public")));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use("/register", RegisterRoute_1.default);
app.use("/otp", otpRoute_1.default);
app.use("/auth", loginRoute_1.default);
app.use("/auth/google", googleAuthRoute_1.default);
app.use("/refreshToken", RefreshTokenRoute_1.default);
app.use("/logout", LogoutRoute_1.default);
app.use("/search", SearchPageRoute_1.default);
app.use("/listing", listingRoute_1.default);
// authenticate users using jwt for private routes
app.use(JwtVerification_1.verifyJWT);
app.use("/admin", (0, VerifyRoles_1.default)(userRoles_1.ROLES_LIST.Admin), AdminRoutes_1.default);
// check is user blocked by admin before providing access to routes
app.use(checkIsUserBlocked_1.checkIsUserBlocked);
app.use("/user", (0, VerifyRoles_1.default)(userRoles_1.ROLES_LIST.User), UserRoutes_1.default);
app.use("/chat", (0, VerifyRoles_1.default)(userRoles_1.ROLES_LIST.User), chatRoutes_1.chatRouter);
app.use("/messages", (0, VerifyRoles_1.default)(userRoles_1.ROLES_LIST.User), messageRoute_1.messageRouter);
// error handler
app.use((err, req, res, next) => {
    return res
        .status(statusCodes_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: "server facing unexpected errors" });
});
// 404 Error Middleware
app.use("*", (req, res, next) => {
    res.status(statusCodes_1.HTTP_STATUS_CODES.NOT_FOUND).json({ error: "Not Found" });
});
// running the server application
let server;
mongoose_1.default.connection.once("open", () => {
    console.log("Connected to MongoDB");
    server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    const io = new socket_io_1.Server(server, {
        pingTimeout: 60000,
        cors: corsOptions_1.default,
    });
    io.use((socket, next) => {
        const token = socket.handshake.query.token;
        if (typeof token != "string" || !process.env.ACCESS_TOKEN_SECRET)
            return next(new Error("token not recieved or failed to get secret to verify accessToken"));
        // Validate JWT token
        jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
            if (err) {
                return next(new Error("Unauthorized"));
            }
            else {
                return next();
            }
        });
    });
    io.on("connection", (socket) => {
        socket.on("setup", (userData) => {
            socket.join(userData);
            socket.emit("setup complete");
        });
        socket.on("disconnect", () => { });
        socket.on("join chat", (room) => {
            socket.join(room);
        });
        socket.on("typing", (room) => {
            socket.in(room).emit("typing now", { room });
        });
        socket.on("stop typing", (room) => {
            socket.in(room).emit("stop typing", { room });
        });
        socket.on("new message", (newMessage) => {
            let chat = newMessage.chat;
            if (!chat.users)
                return console.log("chat.users is not defined");
            chat.users.forEach((user) => {
                if (user._id === newMessage.sender._id)
                    return;
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
