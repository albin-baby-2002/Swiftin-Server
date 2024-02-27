"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorPayDetails = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const RazorPayDetailSchema = new mongoose_1.default.Schema({
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
    amountPaid: {
        type: Number,
        default: 0,
    },
    dateOfPaymentVerification: {
        type: Date,
        default: Date.now,
    },
    reservationID: {
        type: String,
        ref: "HotelReservation",
        required: true,
    },
    razorpayPaymentId: {
        type: String,
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpaySignature: {
        type: String,
        required: true
    },
});
exports.RazorPayDetails = mongoose_1.default.model("RazorPayDetails", RazorPayDetailSchema);
