const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.Controller");
const productController = require("../controller/product.Controller");

router.post(
  "/",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.createProduct
);
router.get("/", productController.getProduct);
router.get("/:id", productController.getProductDetail)
router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.updateProduct
);
router.delete(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.deleteProduct
);

module.exports = router;
