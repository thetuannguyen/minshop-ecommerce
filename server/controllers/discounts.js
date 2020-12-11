const Discount = require("../models/Discount");

// thêm khuyến mãi
const addOne = async (req, res) => {
  try {
    const {
      discountRate,
      discountPrice,
      applyFor,
      id,
      startAt,
      endAt,
    } = req.body;

    let data = {};
    if (startAt) {
      const _startAt = startAt.split("/");
      data = {
        ...data,
        startAt:
          _startAt.length > 1
            ? new Date(_startAt[2], _startAt[1] - 1, _startAt[0])
            : new Date(startAt),
      };
    }
    if (endAt) {
      const _endAt = endAt.split("/");
      data = {
        ...data,
        endAt:
          _endAt.length > 1
            ? new Date(_endAt[2], _endAt[1] - 1, _endAt[0])
            : new Date(endAt),
      };
    }
    if (!discountRate) {
      data = { ...data, discountPrice, applyFor };
    }
    if (!discountPrice) {
      data = { ...data, discountRate, applyFor };
    }
    if (applyFor == "category") data.category = id;
    if (applyFor == "subcategory") data.subcategory = id;
    if (applyFor == "brand") data.brand = id;

    const newDiscount = new Discount(data);
    await newDiscount.save();

    const _discount = await Discount.findById(newDiscount._id)
      .populate("category", "name")
      .populate("brand", "name")
      .populate("subcategory", "name");
    res.json(_discount);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

// lấy tất cả khuyến mãi khả dụng cho user
const getAll = async (req, res) => {
  try {
    const discounts = await Discount.find({
      startAt: { $lt: new Date() },
      $or: [{ endAt: null }, { endAt: { $gte: new Date() } }],
    })
      .populate("category", "name")
      .populate("brand", "name")
      .populate("subcategory", "name");

    res.json(discounts);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// lấy tất cả khuyến mãi
const getAllByAdmin = async (req, res) => {
  try {
    const discounts = await Discount.find()
      .populate("category", "name")
      .populate("brand", "name")
      .populate("subcategory", "name");

    res.json(discounts);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// xóa khuyễn mãi
const deleteOne = async (req, res) => {
  const { id } = req.params;

  await Discount.findByIdAndDelete(id);

  res.json({ success: true });
};

// cập nhật khuyến mãi
const updateOne = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      discountRate,
      discountPrice,
      applyFor,
      id: applyForId,
      startAt,
      endAt,
    } = req.body;
    console.log(req.body);
    let data = {};
    if (startAt) {
      const _startAt = startAt.split("/");
      data = {
        ...data,
        startAt:
          _startAt.length > 1
            ? new Date(_startAt[2], _startAt[1] - 1, _startAt[0])
            : new Date(startAt),
      };
    }
    if (endAt) {
      const _endAt = endAt.split("/");
      data = {
        ...data,
        endAt:
          _endAt.length > 1
            ? new Date(_endAt[2], _endAt[1] - 1, _endAt[0])
            : new Date(endAt),
      };
    }
    if (!discountRate) {
      data = { ...data, discountPrice, discountRate: "", applyFor };
    }
    if (!discountPrice) {
      data = { ...data, discountRate, discountPrice: "", applyFor };
    }
    if (applyFor === "category")
      data = { ...data, brand: null, category: applyForId, subcategory: null };
    if (applyFor === "subcategory")
      data = { ...data, brand: null, category: null, subcategory: applyForId };
    if (applyFor === "brand")
      data = { ...data, brand: applyForId, category: null, subcategory: null };
    if (applyFor === "all")
      data = { ...data, brand: null, category: null, subcategory: null };

    const discount = await Discount.findByIdAndUpdate(id, data, {
      new: true,
      upsert: true,
    });
    const _discount = await Discount.findById(discount._id)
      .populate("category", "name")
      .populate("brand", "name")
      .populate("subcategory", "name");

    res.json(_discount);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

module.exports = {
  addOne,
  getAll,
  deleteOne,
  getAllByAdmin,
  updateOne,
};
