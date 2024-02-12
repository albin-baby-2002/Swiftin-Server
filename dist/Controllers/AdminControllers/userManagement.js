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
exports.getAllUsers = void 0;
const userModel_1 = __importDefault(require("../../Models/userModel"));
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
        let limit = 20;
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
        return res.status(200).json({ users });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getAllUsers = getAllUsers;
