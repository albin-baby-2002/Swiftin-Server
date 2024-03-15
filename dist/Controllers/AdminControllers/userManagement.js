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
exports.unBlockUserHandler = exports.blockUserHandler = exports.editUserHandler = exports.getUserDataHandler = exports.addNewUserHandler = exports.getAllUsersHandler = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = require("../../Models/userModel");
const addUserSchema_1 = require("../../Schemas/addUserSchema");
const editUserSchema_1 = require("../../Schemas/editUserSchema");
const axios_1 = require("axios");
const statusCodes_1 = require("../../Enums/statusCodes");
const getAllUsersHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const users = yield userModel_1.User.aggregate([
            {
                $match: filterQuery,
            },
            {
                $sort: { joinedDate: -1 },
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
        const totalUsersMatchQuery = yield userModel_1.User.aggregate([
            {
                $match: filterQuery,
            },
        ]);
        const totalUsers = totalUsersMatchQuery.length;
        const totalPages = Math.ceil(totalUsers / limit);
        return res.status(axios_1.HttpStatusCode.Ok).json({ users, totalPages });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getAllUsersHandler = getAllUsersHandler;
const addNewUserHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.body;
        const validationResult = addUserSchema_1.AddUserSchema.safeParse(userData);
        if (!validationResult.success) {
            const validationError = validationResult.error;
            res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: validationError.errors[0].message });
        }
        if (validationResult.success) {
            const { email, username, password, phone } = validationResult.data;
            const duplicate = yield userModel_1.User.findOne({ email });
            if (duplicate)
                return res.sendStatus(statusCodes_1.HTTP_STATUS_CODES.CONFLICT); // Conflict
            const hashedPwd = yield bcrypt_1.default.hash(password, 10);
            const newUser = new userModel_1.User({
                username,
                password: hashedPwd,
                email,
                verified: true,
                phone,
            });
            newUser.save();
            res.status(statusCodes_1.HTTP_STATUS_CODES.CREATED).json({ userId: newUser._id, email: newUser.email });
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
        const user = yield userModel_1.User.findById(userID);
        if (!user) {
            return res
                .status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST)
                .json({ message: "Invalid UserID Failed To Fetch Data" });
        }
        return res.status(axios_1.HttpStatusCode.Ok).json({ user });
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
        const validationResult = editUserSchema_1.EditUserSchema.safeParse(userData);
        if (!validationResult.success) {
            const validationError = validationResult.error;
            res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: validationError.errors[0].message });
        }
        if (validationResult.success) {
            const { email, username, phone } = validationResult.data;
            const updatedUser = yield userModel_1.User.findByIdAndUpdate(userID, {
                username,
                email,
                phone,
            });
            if (!updatedUser) {
                res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "Failed to Update User" });
            }
            res.status(axios_1.HttpStatusCode.Ok).json({ message: "success" });
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
        const updatedUser = yield userModel_1.User.findByIdAndUpdate(userID, {
            blocked: true,
        });
        if (!updatedUser) {
            res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "Failed to Block User" });
        }
        res.status(axios_1.HttpStatusCode.Ok).json({ message: "success" });
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
        const updatedUser = yield userModel_1.User.findByIdAndUpdate(userID, {
            blocked: false,
        });
        if (!updatedUser) {
            res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "Failed to Block User" });
        }
        res.status(axios_1.HttpStatusCode.Ok).json({ message: "success" });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.unBlockUserHandler = unBlockUserHandler;
