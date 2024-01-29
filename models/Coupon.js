const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");

const couponSchema = Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: User,
  },
  name: { type: String, required: true },
  reason: { type: String },
  qty: { type: Number, default: 1 },
  discountRate: { type: Number },
  discountWon: { type: Number },
  regDate: { type: Date, default: Date.now },
  createdAt: { type: Date },
  expiredAt: { type: Date, expires: 0 },
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;

