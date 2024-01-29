const Product = require("../models/Product");
const PAGE_SIZE = 5;

const productController = {};

productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      price,
      image,
      category,
      description,
      stock,
      status,
    } = req.body;
    const product = new Product({
      sku,
      name,
      size,
      price,
      image,
      category,
      description,
      stock,
      status,
    });
    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

productController.getProduct = async (req, res) => {
  try {
    const { page, name, category } = req.query;
    const cond = name
      ? { name: { $regex: name, $options: "i" }, isDeleted: false }
      : { isDeleted: false };
    const cond2 = category
      ? { category: { $regex: category, $options: "i" }, isDeleted: false }
      : { isDeleted: false };
    let query = Product.find(cond).find(cond2);
    let response = { status: "success" };
    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      const totalItemNum = await Product.find(cond).count();
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const productList = await query.exec();
    if (productList.length === 0) throw new Error("일치하는 결과가 없습니다.");
    response.data = productList;
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      sku,
      name,
      size,
      price,
      image,
      category,
      description,
      stock,
      status,
    } = req.body;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { sku, name, size, price, image, category, description, stock, status },
      { new: true }
    );
    if (!product) {
      throw new Error("아이템이 존재하지 않습니다.");
    }
    res.status(200).json({ status: "success", data: product });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        isDeleted: true,
      },
      { new: true }
    );
    if (!product) throw new Error("아이템이 존재하지 않습니다.");
    res.status(200).json({ status: "success", data: product });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

productController.getProductDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product || product.isDeleted === true)
      throw new Error("아이템이 존재하지 않습니다.");
    res.status(200).json({ status: "success", data: product });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

productController.checkStock = async (item) => {
  const product = await Product.findById(item.productId);
  if (product.stock[item.size] < item.qty) {
    return {
      isVerify: false,
      message: `${product.name}의 ${item.size}재고가 부족합니다.`,
    };
  }
  const newStock = { ...product.stock };
  newStock[item.size] -= item.qty;
  product.stock = newStock;

  await product.save();
  return { isVerify: true };
};

productController.checkItemListStock = async (items) => {
  const insufficientStockItems = [];
  await Promise.all(
    items.map(async (item) => {
      const stockCheck = await productController.checkStock(item);
      if (!stockCheck.isVerify) {
        insufficientStockItems.push({ item, message: stockCheck.message });
      }
      return stockCheck;
    })
  );

  return insufficientStockItems;
};

module.exports = productController;
