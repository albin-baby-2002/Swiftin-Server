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
const userModel_1 = __importDefault(require("../Models/userModel"));
const handleLogout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //   console.log('logout handler');
    // On client, also delete the accessToken
    const cookies = req.cookies;
    // console.log(cookies)
    if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt))
        return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;
    // Is refreshToken in db?
    const foundUser = yield userModel_1.default.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
        return res.sendStatus(204);
    }
    // console.log('found')
    // Delete refreshToken in db
    foundUser.refreshToken = "";
    const result = yield foundUser.save();
    // console.log(result);
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    res.sendStatus(204);
});
exports.default = handleLogout;
