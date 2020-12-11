const Product = require("../models/Product");
const SubCategory = require("../models/Subcategory");
const Subcategory = require("../models/Subcategory");

// get all subcategories
const getMany = async (req, res) => {
  const { limit, offset } = req.query;

  const subcategories = await Subcategory.find()
    .populate("categoryId", ["_id", "name"])
    .sort({ createdAt: -1 });

  res.json(subcategories);
};

// add a new subcategory
const addOne = async (req, res) => {
  const { name, description, categoryId } = req.body;

  if (!name) {
    return res.status(400).json({
      errors: [{ field: "name", message: "name field is required" }],
    });
  }
  if (!categoryId) {
    return res.status(400).json({
      errors: [{ field: "category", message: "category field is required" }],
    });
  }
  if (!description) {
    return res.status(400).json({
      errors: [
        { field: "description", message: "description field is required" },
      ],
    });
  }

  const newSubcategory = new Subcategory({
    name,
    categoryId,
    description,
  });

  await newSubcategory.save();

  const _sub = await SubCategory.findById(
    newSubcategory._id
  ).populate("categoryId", ["name"]);

  res.json(_sub);
};

// delete a category by id
const deleteOne = async (req, res) => {
  const { id } = req.params;

  // check is any products exists  in subcategory
  const product = await Product.findOne({ subcategoryId: id });
  if (product)
    return res
      .status(400)
      .json({ msg: "Trong danh mục phụ này đang có sản phẩm" });

  await SubCategory.findByIdAndDelete(id);

  res.json({ success: true });
};

// cập nhật danh mục phụ
const updateOne = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, description, categoryId } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (categoryId) updateData.categoryId = categoryId;

    let category = await SubCategory.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("categoryId", ["name"]);

    res.json(category);
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
};
