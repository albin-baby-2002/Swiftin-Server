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
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dbConnection_1 = __importDefault(require("./config/dbConnection"));
const Credentials_1 = __importDefault(require("./Middlewares/Credentials"));
const corsOptions_1 = __importDefault(require("./config/corsOptions"));
const RegisterRoute_1 = __importDefault(require("./Routes/AuthRoutes/RegisterRoute"));
const otpRoute_1 = __importDefault(require("./Routes/AuthRoutes/otpRoute"));
const AuthRoute_1 = __importDefault(require("./Routes/AuthRoutes/AuthRoute"));
const RefreshTokenRoute_1 = __importDefault(require("./Routes/AuthRoutes/RefreshTokenRoute"));
const googleAuthRoute_1 = __importDefault(require("./Routes/AuthRoutes/googleAuthRoute"));
const PORT = process.env.PORT || 3500;
// connect to mongodb database
(0, dbConnection_1.default)();
// access-control-allow-credentials
app.use((req, res, next) => {
    console.log(`Requested URL: ${req.url}`, req.headers.cookie);
    next();
});
app.use(Credentials_1.default);
app.use((0, cors_1.default)(corsOptions_1.default));
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "..", "public")));
console.log(path_1.default.join(__dirname, "..", "public"));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use("/register", RegisterRoute_1.default);
app.use("/verify/otp", otpRoute_1.default);
app.use("/auth", AuthRoute_1.default);
app.use("/auth/google", googleAuthRoute_1.default);
app.use("/refreshToken", RefreshTokenRoute_1.default);
// authenticate users using jwt for private routes
// app.use(verifyJWT);
// app.use("/admin/users", verifyRoles(ROLES_LIST.Admin), userManagementRoutes);
// app.use("/user", verifyRoles(ROLES_LIST.User), userRouter);
// 404 Error Middleware
app.use("*", (req, res, next) => {
    res.status(404).json({ error: "Not Found" });
});
// Error Handler
// app.use(errorHandler);
// running the server application
mongoose_1.default.connection.once("open", () => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
