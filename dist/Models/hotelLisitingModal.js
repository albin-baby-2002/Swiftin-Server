"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelListing = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const HotelListingSchema = new mongoose_1.default.Schema({
    userID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    listingTitle: {
        type: String,
        required: true,
    },
    totalRooms: {
        type: Number,
        required: true,
        default: 1,
    },
    maxGuestsPerRoom: {
        type: Number,
        required: true,
        default: 1,
    },
    bedsPerRoom: {
        type: Number,
        required: true,
        default: 1,
    },
    bathroomPerRoom: {
        type: Number,
        required: true,
        default: 1,
    },
    amenities: [
        {
            type: String,
            required: true,
        },
    ],
    mainImage: {
        type: String,
        required: true,
    },
    otherImages: [
        {
            type: String,
            required: true,
        },
    ],
    roomType: {
        type: String,
        required: true,
    },
    hotelLicenseUrl: {
        type: String,
        required: true,
    },
    aboutHotel: {
        type: String,
        required: true,
    },
    rentPerNight: {
        type: Number,
        required: true,
        default: true,
    },
    approvedForReservation: {
        type: Boolean,
        default: false,
    },
    isActiveForReservation: {
        type: Boolean,
        default: false,
    },
    address: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "HotelAddress",
    },
    reservations: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "HotelReservation",
        },
    ],
    dateWiseReservationData: {
        type: Object
    }
});
exports.HotelListing = mongoose_1.default.model("HotelListing", HotelListingSchema);
