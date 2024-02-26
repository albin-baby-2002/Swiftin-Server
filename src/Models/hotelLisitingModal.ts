import mongoose from "mongoose";

const HotelListingSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "HotelAddress",
  },
  reservations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelReservation",
    },
  ],
  
  dateWiseReservationData:{
    type:Object
  }
});

export const HotelListing = mongoose.model("HotelListing", HotelListingSchema);
