const Cart = require("../models/Cart");

const cartController = {};

cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId });
      await cart.save();
    }
    const existItem = cart.items.some(
      (item) => item.productId.equals(productId) && item.size === size
    );
    if (existItem) {
      throw new Error("이미 추가된 아이템입니다.");
    }
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    res.status(200).json({
      status: "success",
      data: cart,
      cartItemCount: cart.items.length,
    });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

cartController.getCartItem = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    if (!cart) {
      cart = new Cart({ userId });
      await cart.save();
    }

    res.status(200).json({
      status: "success",
      data: cart.items,
      cartItemCount: cart.items.length,
    });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

cartController.updateItemQty = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    const cart = await Cart.findOne({ userId });
    let updateItem = cart.items.find(
      (item) => item.productId.equals(productId) && item.size === size
    );
    updateItem.qty = qty;
    await cart.save();
    res.status(200).json({ status: "success", data: cart.items });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

cartController.deleteCartItem = async (req, res) => {
  try {
    const { userId } = req;
    const { id } = req.params;
    const cart = await Cart.findOne({ userId });
    cart.items = cart.items.filter((item) => !item._id.equals(id));
    await cart.save();
    res.status(200).json({
      status: "success",
      data: cart.items,
      cartItemCount: cart.items.length,
    });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

cartController.getCartQty = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("카트가 존재하지 않습니다.");
    res.status(200).json({ status: "success", qty: cart.items.length });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

module.exports = cartController;
