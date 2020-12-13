const argon2 = require("argon2");
const { v4 } = require("uuid");

const User = require("../models/User");
const { sendMail } = require("../services/nodemailer");

// get toàn bộ users
const getMany = async (req, res) => {
  try {
    let { $limit, $skip, $sort } = req.query;
    // await User.find({ _id: { $ne: req.user.id } }) // find all users not include current user
    const users = await User.find()
      .sort({ createdAt: $sort || -1 })
      .skip($skip || 0)
      .limit($limit || 10);

    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
};

// thêm mới 1 user
const addOne = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    const user = await User.findOne({ email });
    if (user)
      return res.status(400).json({
        errors: [{ field: "email", message: "Email đã tồn tại" }],
      });

    const newUser = new User({
      name,
      email,
      password: await argon2.hash(password),
      role,
      phone,
      address,
      isVerify: role === "ROLE_ADMIN" ? true : false,
    });

    await newUser.save();
    res.json(newUser);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

// xóa 1 user
const deleteOne = async (req, res) => {
  const { id } = req.params;

  await User.findByIdAndDelete(id);

  res.json({ success: true });
};

// quên mật khẩu
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true });

    const newPassword = await v4();
    sendMail(
      email,
      "Mật khẩu mới",
      `<div>
      <div>Mật khẩu mới của bạn là: <h4><i><strong>${newPassword}</strong></i></h4></div>
    </div>`
    );
    await User.findByIdAndUpdate(user._id, {
      password: await argon2.hash(newPassword),
    });

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

// thay đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      password: await argon2.hash(password),
    });

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

// deactivate user (only for ROLE_USER)
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ user: "id is required" });

    const user = await User.findOneAndUpdate(
      { _id: id, isActive: true, role: "ROLE_USER" },
      {
        isActive: false,
      },
      { new: true }
    );
    if (!user)
      return res
        .status(400)
        .json({ user: "Bạn không thể thực hiện được hành động này" });

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

// deactivate user (only for ROLE_USER)
const activateUser = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ user: "id is required" });

    const user = await User.findOneAndUpdate(
      { _id: id, isActive: false, role: "ROLE_USER" },
      {
        isActive: true,
      },
      { new: true }
    );
    if (!user)
      return res
        .status(400)
        .json({ user: "Bạn không thể thực hiện được hành động này" });

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = {
  getMany,
  addOne,
  deleteOne,
  changePassword,
  forgotPassword,
  deactivateUser,
  activateUser,
};
