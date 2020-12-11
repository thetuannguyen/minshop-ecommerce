const Blog = require("../models/Blog");
const BlogCategory = require("../models/BlogCategory");
const BlogTag = require("../models/BlogTag");

// add a new blog category
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ field: "name", message: "name field is required" });

    const newCategory = new BlogCategory({ name });
    await newCategory.save();

    res.json(newCategory);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// get all blog categories
const getAllCategories = async (req, res) => {
  try {
    const blogCategories = await BlogCategory.find();

    res.json(blogCategories);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// add a new blog tag
const addTag = async (req, res) => {
  try {
    const { tag } = req.body;

    if (!tag)
      return res
        .status(400)
        .json({ field: "tag", message: "tag field is required" });

    const newTag = new BlogTag({ tag });
    await newTag.save();

    res.json(newTag);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// get all blog tags
const getAllTags = async (req, res) => {
  try {
    const blogTags = await BlogTag.find();

    res.json(blogTags);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

// add a new blog
const addBlog = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        errors: [{ field: "image", message: "image field is required" }],
      });
    }
    console.log(req.body);

    const { title, content, category, tags } = req.body;

    const newBlog = new Blog({
      author: req.user.id,
      title,
      cover: req.file.filename,
      content,
      category,
      tags: JSON.parse(tags),
    });

    await newBlog.save();

    const blog = await Blog.findById(newBlog._id)
      .populate("author", ["name"])
      .populate("category", ["name"]);

    res.json(blog);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

// get all blogs
const getAll = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .populate("author", ["_id", "name"])
      .populate("category", ["_id", "name"]);

    res.json(blogs);
    // await newBlog.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

// get a blog by id
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id)
      .populate("author", ["name"])
      .populate("category", ["name"]);

    res.json(blog);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

// delete a blog by id
const deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id);

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const uploadImgContent = async (req, res) => {
  try {
    console.log(req.files);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

// cập nhật blog
const updateOne = async (req, res) => {
  try {
    const { id } = req.params;

    const file = req.file;
    const { title, content, category, tags } = req.body;

    const updateData = {};
    if (file) updateData.cover = file.filename;
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (tags) updateData.tags = JSON.parse(tags);

    await Blog.findByIdAndUpdate(id, updateData, { new: true });

    const _blog = await Blog.findById(id)
      .populate("author", ["name"])
      .populate("category", ["name"]);

    res.json(_blog);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

// xóa danh mục blog
const deleteBlogCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findOne({ category: id });
    if (blog)
      return res.status(400).json({
        blog: "Already blog in this category, cannot do this action",
      });
    const blogCategory = await BlogCategory.findByIdAndDelete(id);
    if (!blogCategory) return res.status(400).json({ success: false });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

// cập nhật danh mục blog
const updateBlogCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const blogCategory = await BlogCategory.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    if (!blogCategory) return res.status(400).json({ success: false });
    res.json(blogCategory);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

// xóa blog tag
const deleteBlogTag = async (req, res) => {
  try {
    const { id } = req.params;

    const blogTag = await BlogTag.findByIdAndDelete(id);
    if (!blogTag) return res.status(400).json({ success: false });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

// cập nhật blog tag
const updateBlogTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { tag } = req.body;

    const blogTag = await BlogTag.findByIdAndUpdate(id, { tag }, { new: true });
    if (!blogTag) return res.status(400).json({ success: false });
    res.json(blogTag);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

module.exports = {
  addCategory,
  getAllCategories,
  addTag,
  getAllTags,
  addBlog,
  getAll,
  getById,
  deleteOne,
  uploadImgContent,
  updateOne,
  deleteBlogCategory,
  updateBlogCategory,
  deleteBlogTag,
  updateBlogTag,
};
