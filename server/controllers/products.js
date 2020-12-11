const mongoose = require("mongoose");

const Product = require("../models/Product");
const Discount = require("../models/Discount");
const Comment = require("../models/Comment");

function getDiscountPrice(products, discounts) {
  let _products = [];
  return new Promise((resolve, reject) => {
    try {
      for (let i = 0; i < products.length; i++) {
        let _isDiscount = discounts.find(
          (e) =>
            `${e.brand}` === `${products[i].brandId._id}` ||
            `${e.category}` === `${products[i].categoryId._id}` ||
            `${e.subcategory}` ===
              (Boolean(products[i].subcategoryId)
                ? `${products[i].subcategoryId._id}`
                : "") ||
            e.applyFor === "all"
        );
        if (typeof _isDiscount !== "undefined") {
          let priceDiscount = _isDiscount.discountPrice
            ? products[i].price - _isDiscount.discountPrice < 0
              ? 0
              : products[i].price - _isDiscount.discountPrice
            : products[i].price -
              Math.floor((products[i].price * _isDiscount.discountRate) / 100);

          _products.push({ ...products[i], priceDiscount });
        } else _products.push(products[i]);
      }
      resolve(_products);
    } catch (err) {
      reject(err);
    }
  });
}

// get all products
const getMany = async (req, res) => {
  try {
    const discounts = await Discount.find({
      startAt: { $lt: new Date() },
      $or: [{ endAt: null }, { endAt: { $gte: new Date() } }],
    }).lean();
    const products = await Product.find()
      .populate("brandId", ["_id", "name"])
      .populate("categoryId", ["_id", "name"])
      .populate("subcategoryId", ["_id", "name"])
      .sort({ createdAt: -1 })
      .lean();

    const _products = await getDiscountPrice(products, discounts);

    res.json(_products);
  } catch (err) {
    console.log(err);
  }
};

// add a new product
const addOne = async (req, res) => {
  if (req.files.length === 0) {
    return res.status(400).json({
      errors: [{ field: "image", message: "image field is required" }],
    });
  }
  const {
    name,
    description,
    categoryId,
    subcategoryId,
    brandId,
    price,
    amount,
    describeLink,
  } = req.body;

  if (!name) {
    return res.status(400).json({
      errors: [{ field: "name", message: "name field is required" }],
    });
  }
  if (!description) {
    return res.status(400).json({
      errors: [
        { field: "description", message: "description field is required" },
      ],
    });
  }
  if (!categoryId) {
    return res.status(400).json({
      errors: [{ field: "categoryId", message: "category field is required" }],
    });
  }
  if (!describeLink) {
    return res.status(400).json({
      errors: [
        { field: "describeLink", message: "describe field is required" },
      ],
    });
  }

  let images = [];
  req.files.forEach((file) => {
    images = [...images, file.filename];
  });

  const newProduct = new Product({
    name,
    description,
    images,
    categoryId,
    subcategoryId,
    brandId,
    price,
    amount,
    describeLink,
  });

  await newProduct.save();

  const _product = await Product.findById(newProduct._id)
    .populate("brandId", ["_id", "name"])
    .populate("categoryId", ["_id", "name"])
    .populate("subcategoryId", ["_id", "name"]);

  console.log(_product);
  res.json(_product);
};

// delete a product by id
const deleteOne = async (req, res) => {
  const { id } = req.params;

  await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

  res.json({ success: true });
};

// cập nhật thông tin sản phẩm
const updateOne = async (req, res) => {
  const { id } = req.params;

  const {
    name,
    description,
    categoryId,
    subcategoryId,
    brandId,
    price,
    amount,
    describeLink,
  } = req.body;

  let images = [];
  if (req.files.length > 0)
    req.files.forEach((file) => {
      images = [...images, file.filename];
    });

  let updateData = {};

  if (name) updateData = { ...updateData, name };
  if (categoryId) updateData = { ...updateData, categoryId };
  if (subcategoryId) updateData = { ...updateData, subcategoryId };
  if (brandId) updateData = { ...updateData, brandId };
  if (price) updateData = { ...updateData, price };
  if (amount) updateData = { ...updateData, amount };
  if (description) updateData = { ...updateData, description };
  if (describeLink) updateData = { ...updateData, describeLink };
  if (images.length > 0) updateData = { ...updateData, images };

  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  const _product = await Product.findById(id)
    .populate("brandId", ["_id", "name"])
    .populate("categoryId", ["_id", "name"])
    .populate("subcategoryId", ["_id", "name"]);

  res.json(_product);
};

// get sản phẩm bằng productId
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const comments = await Comment.aggregate([
      {
        $match: {
          productId: mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "commentId",
          as: "replies",
        },
      },
    ]);

    const _comments = await Comment.populate(comments, [
      { path: "user", select: "name" },
      { path: "replies.user", select: "name" },
    ]);

    const product = await Product.findById(id)
      .populate("brandId", ["_id", "name"])
      .populate("categoryId", ["_id", "name"])
      .populate("subcategoryId", ["_id", "name"])
      .lean();

    let _product = { ...product };

    const discounts = await Discount.find().lean();

    let _isDiscount = discounts.find(
      (e) =>
        `${e.brand}` === `${product.brandId._id}` ||
        `${e.category}` === `${product.categoryId._id}` ||
        `${e.subcategory}` ===
          (Boolean(product.subcategoryId)
            ? `${product.subcategoryId._id}`
            : "") ||
        e.applyFor === "all"
    );
    if (typeof _isDiscount !== "undefined") {
      let priceDiscount = _isDiscount.discountPrice
        ? product.price - _isDiscount.discountPrice < 0
          ? 0
          : product.price - _isDiscount.discountPrice
        : product.price -
          Math.floor((product.price * _isDiscount.discountRate) / 100);

      _product = { ..._product, priceDiscount };
    }

    const productsRelated = await Product.find({
      isDeleted: false || undefined,
      categoryId: product.categoryId._id,
      _id: {
        $nin: [product._id],
      },
    })
      .populate("brandId", ["_id", "name"])
      .populate("categoryId", ["_id", "name"])
      .populate("subcategoryId", ["_id", "name"])
      .lean();

    res.json({ product: _product, comments: _comments, productsRelated });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

module.exports = {
  getMany,
  addOne,
  deleteOne,
  updateOne,
  getById,
};
