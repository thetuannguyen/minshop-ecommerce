const CartHistory = require("../models/CartHistory");

// thêm lịch sử đơn hàng
const addCartHistory = async (req, res) => {
  try {
    const { id } = req.user;
    const { cart } = req.body;

    if (cart && cart.length > 0)
      await CartHistory.findOneAndUpdate(
        { user: id },
        {
          user: id,
          cart: cart,
        },
        { new: true, upsert: true }
      );
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

// lấy lịch sử của đơn hàng
const getCartHistoryByUser = async (req, res) => {
  try {
    const cart = await CartHistory.findOne({ user: req.user.id });
    if (!cart) return res.status(400).json({ cart: "not found" });
    res.json(cart);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

module.exports = {
  addCartHistory,
  getCartHistoryByUser,
};
