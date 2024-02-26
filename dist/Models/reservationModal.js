"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelReservation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ReservationSchema = new mongoose_1.default.Schema({
    userID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    listingID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "HotelListing",
        required: true,
    },
    checkInDate: {
        type: Date
    },
    checkOutDate: {
        type: Date
    },
    feePaid: {
        type: Number,
        default: 0
    },
    rooms: {
        type: Number,
        default: 1
    },
    paymentStatus: {
        type: String,
        default: 'processing'
    }
});
exports.HotelReservation = mongoose_1.default.model("HotelReservation", ReservationSchema);
