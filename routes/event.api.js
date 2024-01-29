const express = require("express");
const authController = require("../controller/auth.Controller");
const eventController = require("../controller/event.Controller");
const router = express.Router();

router.post(
  "/coupon/firstPurchase",
  authController.authenticate,
  eventController.getFirstPurchaseCoupon
);
router.delete(
  "/coupon/:id",
  authController.authenticate,
  eventController.deleteCoupon
);
router.get(
  "/coupon/me",
  authController.authenticate,
  eventController.getCouponList
);

module.exports = router;
