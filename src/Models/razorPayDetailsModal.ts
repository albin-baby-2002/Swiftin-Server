import mongoose from "mongoose";

const RazorPayDetailSchema = new mongoose.Schema({
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
    type:String,
    required:true
  },
  razorpayOrderId: {
    type:String,
    required:true
  },
  razorpaySignature: {
    type:String,
    required:true
  },
});

export const RazorPayDetails = mongoose.model(
  "RazorPayDetails",
  RazorPayDetailSchema
);
