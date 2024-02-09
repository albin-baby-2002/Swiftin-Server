import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    const mongodbUrl = process.env.DATABASE_URI;

    if (!mongodbUrl) {
      throw new Error("mongodbUrl undefined");
    }

    await mongoose.connect(mongodbUrl);
  } catch (err) {
    console.error(err);
  }
};

export default connectDB;
