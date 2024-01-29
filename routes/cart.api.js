const express = require("express");
const authController = require("../controller/auth.Controller");
const cartController = require("../controller/cart.Controller");
const router = express.Router();

router.post("/", authController.authenticate, cartController.addItemToCart);
router.get("/", authController.authenticate, cartController.getCartItem);
router.put("/", authController.authenticate, cartController.updateItemQty);
router.delete(
  "/:id",
  authController.authenticate,
  cartController.deleteCartItem
);
router.get("/qty", authController.authenticate, cartController.getCartQty);

module.exports = router;
