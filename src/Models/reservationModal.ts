import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  listingID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HotelListing",
    required: true,
  },
  checkInDate: {
    type: Date,
  },
  checkOutDate: {
    type: Date,
  },
  reservationFee: {
    type: Number,
    default: 0,
  },
  rooms: {
    type: Number,
    default: 1,
  },

  dateOfTransaction: {
    type: Date,
    default: Date.now,
  },

  paymentStatus: {
    type: String,
    enum: ["paid", "pending", "failed", "refunded", "cancelled"],
    required: true,
  },

  reservationStatus: {
    type: String,
    enum: ["paymentPending", "success", "cancelled"],
    required: true,
  },

  razorpayOrderID: {
    type: String,
  },
  razorPayDetailsID: {
    type: String,
    ref: "RazorPayDetails",
  },
});

export const HotelReservation = mongoose.model(
  "HotelReservation",
  ReservationSchema
);
