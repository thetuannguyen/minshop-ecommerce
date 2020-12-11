const mongoose = require("mongoose");

const Comment = require("../models/Comment");

// thêm đánh giá
const addComment = async (req, res) => {
  try {
    const { content, productId } = req.body;
    if (!content)
      return res
        .status(400)
        .json({ field: "content", message: "content field is required" });

    if (!productId)
      return res
        .status(400)
        .json({ field: "product", message: "product field is required" });

    const newComment = new Comment({ user: req.user.id, content, productId });
    await newComment.save();
    const comment = await Comment.findById(newComment._id).populate("user", [
      "_id",
      "name",
    ]);

    res.json(comment);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

// thêm phản hồi đánh giá
const addReplyComment = async (req, res) => {
  try {
    const { content, commentId } = req.body;

    if (!content)
      return res
        .status(400)
        .json({ field: "content", message: "content field is required" });

    if (!commentId)
      return res
        .status(400)
        .json({ field: "comment", message: "comment field is required" });

    const newReplyComment = new Comment({
      user: req.user.id,
      content,
      commentId,
      isReply: true,
    });
    await newReplyComment.save();
    const comment = await Comment.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(commentId),
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

    const commentPopulate = await Comment.populate(comment, [
      { path: "user", select: ["_id", "name", "email"] },
      { path: "productId", select: ["_id", "name"] },
    ]);
    console.log(commentPopulate);
    res.json(commentPopulate);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const getAll = async (req, res) => {
  try {
    const data = await Comment.aggregate([
      { $match: { isReply: false } },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "commentId",
          as: "replies",
        },
      },
    ]);
    const dataPopulate = await Comment.populate(data, [
      { path: "user", select: ["_id", "name", "email"] },
      { path: "productId", select: ["_id", "name"] },
    ]);

    console.log(dataPopulate);
    res.json(dataPopulate);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const deleteOne = async (req, res) => {
  try {
    const { id } = req.params;

    await Comment.findByIdAndDelete(id);
    await Comment.deleteMany({ commentId: id });

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

module.exports = {
  addComment,
  addReplyComment,
  getAll,
  deleteOne,
};
