"use strict";
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
exports.loginController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = require("../../Models/userModel");
const authSchema = zod_1.z.object({
    email: zod_1.z.string().email("Enter a valid email"),
    password: zod_1.z.string().min(8, "Password should be at least 8 character long"),
});
const loginController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authData = req.body;
    const validationResult = authSchema.safeParse(authData);
    if (!validationResult.success) {
        const validationError = validationResult.error;
        return res.status(400).json({ message: validationError.errors[0].message });
    }
    if (validationResult.success) {
        const { email, password } = validationResult.data;
        try {
            const foundUser = yield userModel_1.User.findOne({ email });
            if (!foundUser)
                return res.sendStatus(404); // 404 - User Not found
            if (!foundUser.password && foundUser.googleId) {
                return res.status(400).json({
                    message: "This Account don't have password only Google Login Available",
                });
            }
            const match = yield bcrypt_1.default.compare(password, foundUser.password);
            if (match) {
                if (!foundUser.verified) {
                    console.log("email not verified");
                    return res.status(400).json({
                        message: "Email not verified. sign Up again and complete verification ",
                    });
                }
                if (foundUser.blocked) {
                    return res.status(400).json({
                        message: "Your are blocked by admin ",
                    });
                }
                const roles = Object.values(foundUser.roles).filter(Boolean);
                const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
                const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
                if (!ACCESS_SECRET || !REFRESH_SECRET) {
                    throw new Error("Failed to create access / refresh token");
                }
                const accessToken = jsonwebtoken_1.default.sign({
                    UserInfo: {
                        id: foundUser._id,
                        username: foundUser.username,
                        roles: roles,
                    },
                }, ACCESS_SECRET, { expiresIn: "30s" });
                const refreshToken = jsonwebtoken_1.default.sign({ username: foundUser.username, id: foundUser._id }, REFRESH_SECRET, { expiresIn: "1d" });
                // Saving refreshToken with current user
                foundUser.refreshToken = refreshToken;
                const result = yield foundUser.save();
                res.cookie("jwt", refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: 24 * 60 * 60 * 1000,
                });
                res.status(200).json({ roles, accessToken, user: foundUser.username, image: foundUser.image, userID: foundUser._id });
            }
            else {
                return res.status(400).json({ message: "Wrong password" });
            }
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    }
});
exports.loginController = loginController;
