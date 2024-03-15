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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutHanlder = void 0;
const userModel_1 = require("../../Models/userModel");
const statusCodes_1 = require("../../Enums/statusCodes");
const logoutHanlder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookies = req.cookies;
        if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt))
            return res.sendStatus(statusCodes_1.HTTP_STATUS_CODES.NO_CONTENT); //No content
        const refreshToken = cookies.jwt;
        // Is refreshToken in db?
        const foundUser = yield userModel_1.User.findOne({ refreshToken }).exec();
        if (!foundUser) {
            res.clearCookie("jwt", {
                httpOnly: true,
                sameSite: "none",
                secure: true,
            });
            return res.sendStatus(statusCodes_1.HTTP_STATUS_CODES.NO_CONTENT);
        }
        // Delete refreshToken in db
        foundUser.refreshToken = "";
        yield foundUser.save();
        res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
        res.sendStatus(statusCodes_1.HTTP_STATUS_CODES.OK);
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.logoutHanlder = logoutHanlder;
