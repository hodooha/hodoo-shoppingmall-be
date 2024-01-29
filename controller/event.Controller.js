const User = require("../models/User");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");

const eventController = {};

eventController.getFirstPurchaseCoupon = async (req, res) => {
  try {
    const { userId } = req;
    const { couponDuration } = req.body;
    let dtNow = new Date();
    dtNow.setUTCHours(0, 0, 0, 0);
    let dtVar = new Date(Date.now() + couponDuration * 24 * 3600 * 1000);
    dtVar.setUTCHours(0, 0, 0, 0);
    const user = await User.findById(userId);
    if (!user) throw new Error("쿠폰 발급을 위해 로그인을 해주세요.");
    const isNotFirstPurchase = await Order.find({ userId });
    if (isNotFirstPurchase.length > 0)
      throw new Error("쿠폰 발급 대상이 아닙니다");
    let coupon = await Coupon.findOne({
      userId,
      name: "첫구매 15% 할인쿠폰",
    });
    if (coupon) {
      throw new Error("이미 쿠폰을 발급받으셨습니다.");
    } else {
      coupon = new Coupon({
        userId,
        name: "첫구매 15% 할인쿠폰",
        reason: "신생고객 구매촉진",
        discountRate: 15,
        createdAt: dtNow,
        expiredAt: dtVar,
      });
    }
    await coupon.save();
    res.status(200).json({ status: "success", data: coupon });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

eventController.deleteCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const coupon = await Coupon.findByIdAndDelete(couponId, { new: true });
    if (!coupon) throw new Error("쿠폰이 존재하지 않습니다.");
    res.status(200).json({ status: "success", data: coupon });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

eventController.getCouponList = async (req, res) => {
  try {
    const { userId } = req;
    const couponList = await Coupon.find({ userId }).populate({
      path: "userId",
      model: "User",
    });
    console.log(couponList);
    res.status(200).json({ status: "success", data: couponList });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

module.exports = eventController;
