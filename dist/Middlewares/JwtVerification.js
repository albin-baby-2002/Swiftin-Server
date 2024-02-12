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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyJWT = (req, res, next) => {
    console.log("JWT ENTERED");
    const authHeader = (req.headers.authorization ||
        req.headers.Authorization);
    console.log(authHeader);
    if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer ")))
        return res.sendStatus(401); // unauthorized
    try {
        const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
        if (!ACCESS_SECRET) {
            throw new Error("Failed to verify token");
        }
        const token = authHeader.split(" ")[1];
        jsonwebtoken_1.default.verify(token, ACCESS_SECRET, (err, decoded) => {
            if (err)
                return res.sendStatus(403); // forbidden
            req.userInfo = req.userInfo || { id: "", username: "", roles: [] };
            req.userInfo.id = decoded.UserInfo.id;
            req.userInfo.username = decoded.UserInfo.username;
            req.userInfo.roles = decoded.UserInfo.roles;
        });
        next();
        console.log("jwt passed");
    }
    catch (err) {
        next(err);
    }
};
exports.default = verifyJWT;
