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
exports.unBlockUserHandler = exports.blockUserHandler = exports.editUserHandler = exports.getUserDataHandler = exports.addNewUserHandler = exports.getAllUsers = void 0;
const userModel_1 = __importDefault(require("../../Models/userModel"));
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const AddUserSchema = zod_1.z.object({
    email: zod_1.z.string().email("Enter a valid email"),
    username: zod_1.z.string().min(5, "user name should have min 5 character"),
    phone: zod_1.z
        .string()
        .refine((value) => {
        if (!value)
            return true;
        const IND_PHONE_REGEX = /^(\+91[\-\s]?)?[6789]\d{9}$/;
        return IND_PHONE_REGEX.test(value);
    }, "Invalid phone . It Should be 10 digits")
        .optional(),
    password: zod_1.z
        .string()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: "minimum 8 char & min one (uppercase & lowercase letter, special char & number)",
    }),
});
const EditUserSchema = zod_1.z.object({
    email: zod_1.z.string().email("Enter a valid email"),
    username: zod_1.z.string().min(5, "user name should have min 5 character"),
    phone: zod_1.z
        .string()
        .refine((value) => {
        if (!value)
            return true;
        const IND_PHONE_REGEX = /^(\+91[\-\s]?)?[6789]\d{9}$/;
        return IND_PHONE_REGEX.test(value);
    }, "Invalid phone . It Should be 10 digits")
        .optional(),
});
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let queryParams = req.query;
        let search = "";
        if (queryParams.search) {
            search = queryParams.search.trim();
        }
        let page = 1;
        if (Number(queryParams.page)) {
            page = Number(queryParams.page);
        }
        let limit = 5;
        let filterQuery = { username: {}, "roles.Admin": { $exists: false } };
        filterQuery.username = { $regex: search, $options: "i" };
        console.log(" page number ", page);
        const users = yield userModel_1.default.aggregate([
            {
                $match: filterQuery,
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
            {
                $project: {
                    username: 1,
                    email: 1,
                    verified: 1,
                    blocked: 1,
                    joinedDate: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$joinedDate",
                        },
                    },
                },
            },
        ]);
        const totalUsersMatchQuery = yield userModel_1.default.aggregate([
            {
                $match: filterQuery,
            }
        ]);
        const totalUsers = totalUsersMatchQuery.length;
        const totalPages = Math.ceil(totalUsers / limit);
        return res.status(200).json({ users, totalPages });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getAllUsers = getAllUsers;
const addNewUserHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.body;
        const validationResult = AddUserSchema.safeParse(userData);
        if (!validationResult.success) {
            const validationError = validationResult.error;
            res.status(400).json({ message: validationError.errors[0].message });
        }
        if (validationResult.success) {
            const { email, username, password, phone } = validationResult.data;
            const duplicate = yield userModel_1.default.findOne({ email });
            if (duplicate)
                return res.sendStatus(409); // Conflict
            const hashedPwd = yield bcrypt_1.default.hash(password, 10);
            const newUser = new userModel_1.default({
                username,
                password: hashedPwd,
                email,
                verified: true,
                phone,
            });
            newUser.save();
            res.status(201).json({ userId: newUser._id, email: newUser.email });
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.addNewUserHandler = addNewUserHandler;
const getUserDataHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userID = req.params.userID;
        const user = yield userModel_1.default.findById(userID);
        if (!user) {
            return res
                .status(400)
                .json({ message: "Invalid UserID Failed To Fetch Data" });
        }
        return res.status(200).json({ user });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getUserDataHandler = getUserDataHandler;
const editUserHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.body;
        const userID = req.params.userID;
        const validationResult = EditUserSchema.safeParse(userData);
        if (!validationResult.success) {
            const validationError = validationResult.error;
            res.status(400).json({ message: validationError.errors[0].message });
        }
        if (validationResult.success) {
            const { email, username, phone } = validationResult.data;
            const updatedUser = yield userModel_1.default.findByIdAndUpdate(userID, {
                username,
                email,
                phone,
            });
            if (!updatedUser) {
                res.status(400).json({ message: "Failed to Update User" });
            }
            res.status(200).json({ message: "success" });
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.editUserHandler = editUserHandler;
const blockUserHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req.params.userID;
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(userID, {
            blocked: true,
        });
        if (!updatedUser) {
            res.status(400).json({ message: "Failed to Block User" });
        }
        res.status(200).json({ message: "success" });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.blockUserHandler = blockUserHandler;
const unBlockUserHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req.params.userID;
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(userID, {
            blocked: false,
        });
        if (!updatedUser) {
            res.status(400).json({ message: "Failed to Block User" });
        }
        res.status(200).json({ message: "success" });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.unBlockUserHandler = unBlockUserHandler;
