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
exports.profileImgChangeHandler = exports.editProfileHandler = exports.getProfileInfo = void 0;
const personalAddress_1 = require("../../Models/personalAddress");
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = require("../../Models/userModel");
const statusCodes_1 = require("../../Enums/statusCodes");
const getProfileInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.userInfo) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to load user data" });
        }
        let userID = new mongoose_1.default.Types.ObjectId(req.userInfo.id);
        const userData = yield userModel_1.User.aggregate([
            {
                $match: {
                    _id: userID,
                },
            },
            {
                $lookup: {
                    from: "personaladdresses",
                    localField: "address",
                    foreignField: "_id",
                    as: "addressData",
                },
            },
            {
                $unwind: { path: "$addressData", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    username: 1,
                    email: 1,
                    aboutYou: 1,
                    phone: 1,
                    wallet: 1,
                    image: 1,
                    address: 1,
                    addressLine: "$addressData.addressLine",
                    locality: "$addressData.locality",
                    city: "$addressData.city",
                    state: "$addressData.state",
                    district: "$addressData.district",
                    country: "$addressData.country",
                    pinCode: "$addressData.pinCode",
                },
            },
        ]);
        return res.status(statusCodes_1.HTTP_STATUS_CODES.OK).json({ userData: userData[0] });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getProfileInfo = getProfileInfo;
const editProfileHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const userID = (_b = req.userInfo) === null || _b === void 0 ? void 0 : _b.id;
        if (!userID) {
            return res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify user " });
        }
        const { username, phone, aboutYou, addressLine, locality, city, district, state, country, pinCode, } = req.body;
        const user = yield userModel_1.User.findById(userID);
        if (user) {
            user.username = username;
            user.phone = phone;
            user.aboutYou = aboutYou;
            yield user.save();
            if (!(user === null || user === void 0 ? void 0 : user.address)) {
                const address = new personalAddress_1.PersonalAddress({
                    userID: user === null || user === void 0 ? void 0 : user._id,
                    addressLine,
                    locality,
                    city,
                    district,
                    state,
                    country,
                    pinCode,
                });
                yield address.save();
                user.address = address._id;
                yield user.save();
                return res.sendStatus(statusCodes_1.HTTP_STATUS_CODES.OK);
            }
            const address = yield personalAddress_1.PersonalAddress.findByIdAndUpdate(user.address, {
                addressLine,
                locality,
                city,
                district,
                state,
                country,
                pinCode,
            });
            return res.sendStatus(statusCodes_1.HTTP_STATUS_CODES.OK);
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.editProfileHandler = editProfileHandler;
const profileImgChangeHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const userID = (_c = req.userInfo) === null || _c === void 0 ? void 0 : _c.id;
        if (!userID) {
            return res.status(statusCodes_1.HTTP_STATUS_CODES.BAD_REQUEST).json({ message: "failed to identify user " });
        }
        const { publicID } = req.body;
        const user = yield userModel_1.User.findById(userID);
        if (user) {
            user.image = publicID;
            yield user.save();
            return res.sendStatus(statusCodes_1.HTTP_STATUS_CODES.OK);
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.profileImgChangeHandler = profileImgChangeHandler;
