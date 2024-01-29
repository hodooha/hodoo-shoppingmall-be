const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const TOKEN_SECRET_KEY = process.env.TOKEN_SECRET_KEY;

const userSchema = Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      default: "customer",
    },
    // coupons: [
    //   {
    //     couponId: { type: mongoose.ObjectId, ref: Coupon },
    //     couponQty: { type: Number, default: 1 },
    //   },
    // ],
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.password;
  delete obj.__v;
  delete obj.updateAt;
  delete obj.createAt;
  return obj;
};

userSchema.methods.generateToken = function () {
  const token = jwt.sign({ _id: this._id }, TOKEN_SECRET_KEY, {
    expiresIn: "1h",
  });
  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
