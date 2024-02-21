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
exports.newUserRegister = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("../../Models/userModel"));
const userVerificationHelper_1 = require("../../Helpers/userVerificationHelper");
const zod_1 = require("zod");
const userSchema = zod_1.z.object({
    email: zod_1.z.string().email("Enter a valid email"),
    username: zod_1.z.string().min(5, "user name should have min 5 character"),
    password: zod_1.z
        .string()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: "minimum 8 char & min one (uppercase & lowercase letter, special char & number)",
    }),
});
const newUserRegister = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = req.body;
    const validationResult = userSchema.safeParse(userData);
    if (!validationResult.success) {
        const validationError = validationResult.error;
        res.status(400).json({ message: validationError.errors[0].message });
    }
    if (validationResult.success) {
        const { email, username, password } = validationResult.data;
        try {
            const existingUser = yield userModel_1.default.findOne({ email });
            if (existingUser === null || existingUser === void 0 ? void 0 : existingUser.verified) {
                return res.sendStatus(409);
            }
            if (existingUser && !(existingUser === null || existingUser === void 0 ? void 0 : existingUser.verified)) {
                yield (0, userVerificationHelper_1.sendOtpEmail)(existingUser);
                return res
                    .status(200)
                    .json({ userId: existingUser._id, email: existingUser.email });
            }
            const hashedPwd = yield bcrypt_1.default.hash(password, 10);
            const newUser = new userModel_1.default({
                username,
                password: hashedPwd,
                email,
            });
            newUser.save();
            yield (0, userVerificationHelper_1.sendOtpEmail)(newUser);
            res.status(201).json({ userId: newUser._id, email: newUser.email });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    }
});
exports.newUserRegister = newUserRegister;
