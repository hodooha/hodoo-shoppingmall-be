const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const TOKEN_SECRET_KEY = process.env.TOKEN_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const authController = {};

authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email }, "-createdAt -updatedAt -__v");
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const token = user.generateToken();
        return res.status(200).json({ status: "success", token, user });
      } else {
        throw new Error("비밀번호가 일치하지 않습니다.");
      }
    } else {
      throw new Error("일치하는 이메일 계정이 없습니다.");
    }
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = await req.headers.authorization;
    if (!tokenString) throw new Error("Token not found");
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, TOKEN_SECRET_KEY, (error, payload) => {
      if (error) throw new Error("Invalid token");
      req.userId = payload._id;
    });
    next();
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

authController.checkAdminPermission = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (user.level !== "admin") {
      throw new Error("no permission");
    }
    next();
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

authController.loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();
    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = "" + Math.floor(Math.random() * 100000000);
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(randomPassword, salt);
      user = new User({ email, name, password: newPassword });
      await user.save();
    }
    const sessionToken = await user.generateToken();
    res.status(200).json({ status: "success", user, token: sessionToken });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

module.exports = authController;
