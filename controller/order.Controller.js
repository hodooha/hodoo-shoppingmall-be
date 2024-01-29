const productController = require("./product.Controller");
const randomStringGenerator = require("../utils/randomStringGenerator");
const Order = require("../models/Order");
const PAGE_SIZE = 5;

const orderController = {};

orderController.createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { totalPrice, shipTo, contact, items } = req.body;

    console.log(items)
    const insufficientStockItems = await productController.checkItemListStock(
      items
    );

    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message),
        ""
      );
      throw new Error(errorMessage);
    }

    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items,
      orderNum: randomStringGenerator(),
    });
    await newOrder.save();
    res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

orderController.getOrder = async (req, res) => {
  try {
    const { userId } = req;
    const orderList = await Order.find({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    res.status(200).json({ status: "success", data: orderList });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

orderController.getAllOrderList = async (req, res) => {
  try {
    const { page, ordernum } = req.query;
    const cond = ordernum
      ? { orderNum: { $regex: ordernum, $options: "i" } }
      : {};
    let query = Order.find(cond)
      .populate({
        path: "items",
        populate: { path: "productId", model: "Product" },
      })
      .populate({ path: "userId", model: "User" });
    let response = { status: "success" };

    query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
    const totalOrderNum = await Order.find(cond).count();
    const totalPageNum = Math.ceil(totalOrderNum / PAGE_SIZE);
    response.totalPageNum = totalPageNum;

    const orderList = await query.exec();
    response.data = orderList;
    if (orderList.length === 0) throw new Error("일치하는 주문이 없습니다.");
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

orderController.updateOrder = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const order = await Order.findByIdAndUpdate(
      { _id: orderId },
      { status },
      { new: true }
    );
    if (!order) throw new Error("주문이 존재하지 않습니다.");
    res.status(200).json({ status: "success", data: order });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

module.exports = orderController;
