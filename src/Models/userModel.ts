import mongoose from "mongoose";

interface roles {
  User: number;
  Admin: number;
  Editor: number;
}

interface User extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  roles: roles;
  googleId: string;
  phone: string;
  image: string;
  verified: boolean;
  blocked: boolean;
  refreshToken: string;
  joinedDate: Date;
  wallet: number;
  aboutYou: string;
  address: mongoose.Schema.Types.ObjectId;
}

const userSchema = new mongoose.Schema<User>({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  googleId: {
    type: String,
  },
  phone: {
    type: String,
  },
  roles: {
    User: {
      type: Number,
      default: 2001,
    },
    Editor: Number,
    Admin: Number,
  },
  image: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  joinedDate: {
    type: Date,
    default: Date.now,
  },
  refreshToken: String,
  wallet: {
    type: Number,
    default: 0,
  },
  aboutYou: {
    type: String,
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PersonalAddress",
  },
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
