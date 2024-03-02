"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    googleId: {
        type: String,
    },
    phone: {
        type: String,
    },
    roles: {
        User: {
            type: Number,
            default: 2001,
        },
        Editor: Number,
        Admin: Number,
    },
    image: {
        type: String,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    blocked: {
        type: Boolean,
        default: false,
    },
    joinedDate: {
        type: Date,
        default: Date.now,
    },
    refreshToken: String,
    wallet: {
        type: Number,
        default: 0,
    },
    aboutYou: {
        type: String,
    },
    address: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "PersonalAddress",
    },
    wishlist: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "HotelListings",
        },
    ],
});
exports.User = mongoose_1.default.model("User", UserSchema);
