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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../Models/userModel"));
const google_auth_library_1 = require("google-auth-library");
const axios_1 = __importDefault(require("axios"));
const handleGoogleAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, "postmessage");
        const code = req.body.code;
        if (!code)
            return res.status(400).json({ message: "invalid code" });
        const { tokens } = yield oAuth2Client.getToken(code);
        if (tokens.access_token) {
            console.log(tokens.access_token, "\t access token");
            const userInfo = yield axios_1.default
                .get("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
            })
                .then((res) => res.data);
            console.log(userInfo);
            const { sub, name, email, picture } = userInfo;
            let user = yield userModel_1.default.findOne({ email });
            if (user && !user.googleId) {
                user.googleId = sub;
                yield user.save();
            }
            if (!user) {
                const newUser = new userModel_1.default({
                    username: name,
                    googleId: sub,
                    image: picture,
                    email,
                });
                yield newUser.save();
                user = newUser;
            }
            const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
            const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
            if (!ACCESS_SECRET || !REFRESH_SECRET) {
                throw new Error("Failed to create access / refresh token");
            }
            const roles = Object.values(user.roles).filter(Boolean);
            const accessToken = jsonwebtoken_1.default.sign({
                UserInfo: {
                    id: user._id,
                    username: user.username,
                    roles: roles,
                },
            }, ACCESS_SECRET, { expiresIn: "30s" });
            const refreshToken = jsonwebtoken_1.default.sign({ username: user.username, id: user._id }, REFRESH_SECRET, { expiresIn: "1d" });
            // Saving refreshToken with current user
            user.refreshToken = refreshToken;
            const result = yield user.save();
            res.cookie("jwt", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 24 * 60 * 60 * 1000,
            });
            res.status(200).json({ roles, accessToken, user: user.username });
        }
    }
    catch (err) {
        next(err);
    }
});
exports.default = handleGoogleAuth;
