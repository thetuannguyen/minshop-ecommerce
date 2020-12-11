const jwt = require("jsonwebtoken");
const argon2 = require("argon2");

const Address = require("../models/Address");
const User = require("../models/User");

// cập nhật thông tin các nhân
const updateProfile = async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = await argon2.hash(req.body.password);
    }

    await User.findByIdAndUpdate(req.user.id, req.body);
    const user = await User.findById(req.user.id);
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      birthday: user.birthday,
      gender: user.gender,
    };
    const token = await jwt.sign(payload, process.env.SECRET_OR_KEY, {
      expiresIn: "24h",
    });

    res.json({ token: `Bearer ${token}` });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

// get tất cả địa chỉ của user
const getAddressesOfUser = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id });
    res.json(addresses);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// thêm 1 địa chỉ của user
const addAddress = async (req, res) => {
  try {
    const { name, address, phone, isPaymentDefault, isShipDefault } = req.body;

    const newAddress = new Address({
      user: req.user.id,
      name,
      address,
      phone,
      isShipDefault,
      isPaymentDefault,
    });

    if (isShipDefault) {
      await Address.updateMany({}, { $set: { isShipDefault: false } });
    }
    if (isPaymentDefault) {
      await Address.updateMany({}, { $set: { isPaymentDefault: false } });
    }

    await newAddress.save();
    res.json(newAddress);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// cập nhật địa chỉ của user
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPaymentDefault, isShipDefault } = req.body;

    if (isShipDefault) {
      await Address.updateMany({}, { $set: { isShipDefault: false } });
    }
    if (isPaymentDefault) {
      await Address.updateMany({}, { $set: { isPaymentDefault: false } });
    }

    await Address.findByIdAndUpdate(id, req.body);

    res.json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// xóa địa chỉ của user
const deleteAddress = async (req, res) => {
  const { id } = req.params;

  await Address.findByIdAndDelete(id);

  res.json({ success: true });
};

module.exports = {
  addAddress,
  getAddressesOfUser,
  updateProfile,
  deleteAddress,
  updateAddress,
};
