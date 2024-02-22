const mongoose = require("mongoose");

const HotelAddressSchema = new mongoose.Schema({
  listingID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HotelListing",
    required: true,
  },
  userID:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addressLine: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  district: {
    type: String,
  },
  pinCode: {
    type: String,
  }
});

export const HotelAddress = mongoose.model(
  "HotelAddress",
  HotelAddressSchema
);
