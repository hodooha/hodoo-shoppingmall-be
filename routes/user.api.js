const express = require("express");
const userController = require("../controller/user.Controller");
const authController = require("../controller/auth.Controller");
const router = express.Router();

router.post("/", userController.createUser);
router.get("/me", authController.authenticate, userController.getUser);

module.exports = router;
