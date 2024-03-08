const mongoose = require("mongoose");

const ReviewModelSchema = new mongoose.Schema(
  {
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
    rating:{
        type:Number,
        required:true
    },
    reviewMessage:{
        type:String,
        required:true
    }
    
  },

  {
    timestamps: true,
  }
);

export const Review = mongoose.model("Review", ReviewModelSchema);
