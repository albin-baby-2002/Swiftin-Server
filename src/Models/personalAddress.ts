const mongoose = require("mongoose");

const PersonalAddressSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addressLine: {
    type: String,
  },
  locality: {
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
  },
  country: {
    type: String,
  },
});

export const PersonalAddress = mongoose.model(
  "PersonalAddress",
  PersonalAddressSchema
);
