const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: () => {
      return this.provider === "local" ? true : false;
    },
  },
  avatar: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  birthday: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    default: "male",
  },
  provider: {
    type: String,
    enum: ["google", "facebook", "local"],
    default: "local",
  },
  role: {
    type: String,
    enum: ["ROLE_ADMIN", "ROLE_USER"],
    default: "ROLE_USER",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerify: {
    type: Boolean,
    default: false,
  },
  verifyToken: {
    type: String,
  },
  resetPasswordToken: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("users", userSchema);
