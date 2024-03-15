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
exports.newUserRegisterHandler = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const userVerificationHelper_1 = require("../../Helpers/userVerificationHelper");
const userModel_1 = require("../../Models/userModel");
const registerUserSchema_1 = require("../../Schemas/registerUserSchema");
const statusCodes_1 = require("../../Enums/statusCodes");
const newUserRegisterHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = req.body;
    const validationResult = registerUserSchema_1.RegisterUserSchema.safeParse(userData);
    if (!validationResult.success) {
        const validationError = validationResult.error;
        res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: validationError.errors[0].message });
    }
    if (validationResult.success) {
        const { email, username, password } = validationResult.data;
        try {
            const existingUser = yield userModel_1.User.findOne({ email });
            if (existingUser === null || existingUser === void 0 ? void 0 : existingUser.verified) {
                return res.sendStatus(statusCodes_1.HTTP_STATUS_CODES.CONFLICT);
            }
            if (existingUser && !(existingUser === null || existingUser === void 0 ? void 0 : existingUser.verified)) {
                yield (0, userVerificationHelper_1.sendOtpEmail)(existingUser);
                return res
                    .status(statusCodes_1.HTTP_STATUS_CODES.OK)
                    .json({ userId: existingUser._id, email: existingUser.email });
            }
            const hashedPwd = yield bcrypt_1.default.hash(password, 10);
            const newUser = new userModel_1.User({
                username,
                password: hashedPwd,
                email,
            });
            newUser.save();
            yield (0, userVerificationHelper_1.sendOtpEmail)(newUser);
            res.status(statusCodes_1.HTTP_STATUS_CODES.CREATED).json({ userId: newUser._id, email: newUser.email });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    }
});
exports.newUserRegisterHandler = newUserRegisterHandler;
