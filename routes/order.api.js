const express = require("express");
const router = express.Router();
const orderController = require("../controller/order.Controller");
const authController = require("../controller/auth.Controller");
const eventController = require("../controller/event.Controller");

router.post("/", authController.authenticate, orderController.createOrder);
router.get("/", authController.authenticate, orderController.getOrder);
router.get(
  "/all",
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.getAllOrderList
);
router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.updateOrder
);

module.exports = router;
