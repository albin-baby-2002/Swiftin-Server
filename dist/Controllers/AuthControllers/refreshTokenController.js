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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const userModel_1 = __importDefault(require("../../Models/userModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const handleRefreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = req.cookies;
    console.log("req for refresh");
    console.log(cookies);
    if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt))
        return res.sendStatus(401); // unauthorized
    const refreshToken = cookies.jwt;
    try {
        const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
        const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
        if (!ACCESS_SECRET || !REFRESH_SECRET) {
            throw new Error("Failed to create token");
        }
        const foundUser = yield userModel_1.default.findOne({ refreshToken });
        if (!foundUser)
            return res.sendStatus(403); //Forbidden
        jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET, (err, decoded) => {
            let decodedID = new mongoose_1.default.Types.ObjectId(decoded.id);
            let userID = new mongoose_1.default.Types.ObjectId(foundUser._id);
            if (err || !userID.equals(decodedID)) {
                console.log(foundUser, decoded);
                return res.sendStatus(403);
            }
            const roles = Object.values(foundUser.roles).filter((role) => role);
            const accessToken = jsonwebtoken_1.default.sign({
                UserInfo: {
                    id: foundUser._id,
                    username: decoded.username,
                    roles: roles,
                },
            }, ACCESS_SECRET, { expiresIn: "50s" });
            res.json({ roles, accessToken, user: decoded.username });
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = handleRefreshToken;
