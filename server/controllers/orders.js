const mongoose = require("mongoose");

const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const OrderHistory = require("../models/OrderHistory");
const { sendMailOrder } = require("../services/nodemailer");

// thêm 1 đơn hàng
const addOne = async (req, res) => {
  try {
    const { coupon } = req.body;
    if (!!coupon) {
      await Coupon.findByIdAndUpdate(coupon._id, {
        usableCount: coupon.usableCount - 1,
      });
    }

    // save order
    const newOrder = new Order({ ...req.body, user: req.user.id });
    await newOrder.save();

    // save order history
    const newOrderHistory = new OrderHistory({
      order: newOrder._id,
      name: "Đơn hàng được khởi",
      description: "Mặt hàng được khởi tạo",
    });
    await newOrderHistory.save();

    // send email order
    const order = await Order.findById(newOrder._id)
      .populate("products.productId", ["name", "price"])
      .populate("user", ["name", "email"]);
    sendMailOrder(req.user.email, order);

    res.json({ success: true });
  } catch (err) {
    // console.log(err);
    return res.status(500).json(err);
  }
};

// lấy tất cả đơn hàng của user
const getAllOfUser = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $lookup: {
          from: "order-histories",
          localField: "_id",
          foreignField: "order",
          as: "histories",
        },
      },
    ]).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (err) {
    // console.log(err);
    return res.status(500).json(err);
  }
};

// thêm đơn hàng không cần đăng nhập
const addOneNoAuth = async (req, res) => {
  try {
    const { email } = req.body;
    const newOrder = new Order({ ...req.body });
    await newOrder.save();
    // save order history
    const newOrderHistory = new OrderHistory({
      order: newOrder._id,
      name: "Đơn hàng được khởi",
      description: "Mặt hàng được khởi tạo",
    });
    await newOrderHistory.save();
    // send email order
    const order = await Order.findById(newOrder._id)
      .populate("products.productId", ["name", "price"])
      .populate("user", ["name", "email"]);
    sendMailOrder(email, order);
    res.json({ success: true });
  } catch (err) {
    // console.log(err);
    return res.status(500).json(err);
  }
};

// thêm một đơn hàng nháp bởi admin
const addOneByAdmin = async (req, res) => {
  try {
    const newOrder = new Order({ ...req.body, isCreatedByAdmin: true });
    await newOrder.save();
    const order = await Order.findById(newOrder._id)
      .populate("products.productId", ["name", "price"])
      .populate("user", ["name", "email"]);

    // save order history
    const newOrderHistory = new OrderHistory({
      order: newOrder._id,
      name: "Đơn hàng được khởi tạo",
      description: "Mặt hàng được khởi tạo",
    });
    await newOrderHistory.save();

    res.json(order);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

// lấy tất cả đơn hàng
const getAll = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("products.productId", ["name", "price"])
      .populate("user", ["name", "email"])
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// hủy đơn hàng
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndUpdate(
      id,
      { status: "cancel" },
      { new: true }
    );
    if (!order) return res.status(404).json({ msg: "Not found" });
    const _order = await Order.findById(order._id)
      .populate("products.productId", ["name", "price"])
      .populate("user", ["name", "email"]);

    // save order history
    const newOrderHistory = new OrderHistory({
      order: id,
      name: "Đơn hàng đã bị hủy",
      description: "Đơn hàng đã bị hủy",
    });
    await newOrderHistory.save();

    res.json(_order);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

// cập nhật đơn hàng
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      address,
      note,
      products,
      isPaid,
      status,
      shipType,
      total,
    } = req.body;

    const order = await Order.findById(id);

    let updateData = {};
    let orderHistoryData = [];
    if (name !== order.name) {
      updateData = { ...updateData, name };
      orderHistoryData = [
        ...orderHistoryData,
        `Thay đổi tên người nhận từ "${order.name}" thành "${name}`,
      ];
    }
    if (phone !== order.phone) {
      updateData = { ...updateData, phone };
      orderHistoryData = [
        ...orderHistoryData,
        `Thay đổi số điện thoại người nhận từ "${order.phone}" thành "${phone}`,
      ];
    }
    if (address !== order.address) {
      updateData = { ...updateData, address };
      orderHistoryData = [
        ...orderHistoryData,
        `Thay đổi địa chỉ người nhận từ "${order.address}" thành "${address}`,
      ];
    }
    if (note !== order.note) {
      updateData = { ...updateData, note };
      orderHistoryData = [
        ...orderHistoryData,
        `Thay đổi ghi chú của người nhận từ "${order.note}" thành "${note}`,
      ];
    }
    if (isPaid !== order.isPaid) {
      updateData = { ...updateData, isPaid };
      orderHistoryData = [
        ...orderHistoryData,
        `Thay đổi trạng thái thanh toán từ "${
          order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"
        }" thành "${isPaid ? "Đã thanh toán" : "Chưa thanh toán"}`,
      ];
    }
    if (status !== order.status) {
      updateData = { ...updateData, status };
      orderHistoryData = [
        ...orderHistoryData,
        `Thay đổi trạng thái đơn hàng từ "${
          order.status === "pending"
            ? "Đang xử lý"
            : order.status === "packed"
            ? "Đã đóng gói"
            : order.status === "delivered"
            ? "Đã chuyển hàng"
            : order.status === "success"
            ? "Thành công"
            : order.status === "cancel"
            ? "Đã hủy"
            : ""
        }" thành "${
          status === "pending"
            ? "Đang xử lý"
            : status === "packed"
            ? "Đã đóng gói"
            : status === "delivered"
            ? "Đã chuyển hàng"
            : status === "success"
            ? "Thành công"
            : status === "cancel"
            ? "Đã hủy"
            : ""
        }`,
      ];
    }
    if (shipType !== order.shipType) {
      updateData = { ...updateData, shipType };
      orderHistoryData = [
        ...orderHistoryData,
        `Thay đổi hình thức vận chuyển từ "${
          shipType === "fast" ? "Giao hàng nhanh" : "Giao hàng tiêu chuẩn"
        }" thành "${
          shipType === "fast" ? "Giao hàng nhanh" : "Giao hàng tiêu chuẩn"
        }`,
      ];
    }
    if (total !== order.total) {
      updateData = { ...updateData, total };
    }
    if (
      !arraysEqual(
        products.map((e) => ({
          productId: e.productId + "",
          amount: +e.amount,
        })),
        order.products.map((e) => ({
          productId: e.productId + "",
          amount: +e.amount,
        }))
      )
    ) {
      updateData = { ...updateData, products };
      orderHistoryData = [
        ...orderHistoryData,
        `Thay đổi sản phẩm trong đơn hàng`,
      ];
    }
    if (!updateData || !Object.keys(updateData).length) {
      return res.status(400).json({ order: "Không có gì thay đổi" });
    }
    const _order = await Order.findByIdAndUpdate(id, updateData, { new: true });
    if (!_order) return res.status(404).json({ msg: "Not found" });
    const newOrderHistory = new OrderHistory({
      order: id,
      name: "Cập nhật hóa đơn",
      description: orderHistoryData.join("; "),
    });
    await newOrderHistory.save();

    const __order = await Order.findById(order._id)
      .populate("products.productId", ["name", "price"])
      .populate("user", ["name", "email"]);
    res.json({ order: __order, history: newOrderHistory });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

// xóa đơn hàng
const deleteOne = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOneAndDelete({
      _id: id,
      isCreatedByAdmin: true,
    });
    if (!order) return res.status(400).json({ success: false });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

// lấy lịch sử của một đơn hàng bằng orderId
const getHistoriesByOrderId = async (req, res) => {
  try {
    const histories = await OrderHistory.find({ order: req.params.id }).sort({
      createdAt: -1,
    });
    res.json(histories);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

// lấy báo cáo đơn hàng theo ngày, tháng, năm
const getStatisticalOrders = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          total: { $sum: "$total" },
        },
      },
      {
        $project: {
          date: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
          total: 1,
          _id: 0,
        },
      },
    ]);

    res.json(orders);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const objectsEqual = (o1, o2) =>
  typeof o1 === "object" && Object.keys(o1).length > 0
    ? Object.keys(o1).length === Object.keys(o2).length &&
      Object.keys(o1).every((p) => objectsEqual(o1[p], o2[p]))
    : o1 === o2;

const arraysEqual = (a1, a2) =>
  a1.length === a2.length && a1.every((o, idx) => objectsEqual(o, a2[idx]));

module.exports = {
  addOne,
  getAllOfUser,
  getAll,
  addOneNoAuth,
  addOneByAdmin,
  cancelOrder,
  updateOrder,
  getHistoriesByOrderId,
  deleteOne,
  getStatisticalOrders,
};
