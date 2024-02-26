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
  checkInDate:{
    type:Date
  },
  checkOutDate:{
    type:Date
  },
  feePaid:{
    type:Number,
    default:0
  },
  rooms:{
    type:Number,
    default:1
  },
  paymentStatus:{
    type:String,
    default:'processing'
  }
});

export const HotelReservation = mongoose.model("HotelReservation", ReservationSchema);
