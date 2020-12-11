const voucher_codes = require("voucher-code-generator");

const Coupon = require("../models/Coupon");

// tạo ra mã khuyến mãi
function generateCoupon() {
  const possible =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return new Promise((resolve, reject) => {
    let coupon = "";
    for (var i = 0; i < 8; i++) {
      coupon += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    resolve(coupon);
  });
}

// tạo mã khuyến mãi độc nhất
const generateUniqueCoupon = () => {
  return new Promise(async (resolve, reject) => {
    let code = await generateCoupon();

    const isExists = await Coupon.findOne({ code });
    if (isExists) return generateUniqueCoupon();
    else resolve(code);
  });
};

// thêm mã khuyến mãi
const addOne = async (req, res) => {
  try {
    const {
      code,
      description,
      usableCount,
      discountRate,
      discountPrice,
      startAt,
      endAt,
      isAutoGenerate,
    } = req.body;

    if (!discountPrice && !discountRate)
      return res.status(400).json({
        field: "discount",
        message: "discount rate or price is required",
      });

    let data = { usableCount };

    if (description) data = { ...data, description };
    if (discountRate) data = { ...data, discountRate };
    else if (discountPrice) data = { ...data, discountPrice };
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
    let codeGen;
    if (isAutoGenerate) codeGen = await generateUniqueCoupon();
    else codeGen = code;

    const newCoupon = new Coupon({ ...data, code: codeGen });
    await newCoupon.save();

    res.json(newCoupon);
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      let key = Object.keys(err.keyValue)[0];
      if (key) {
        return res.status(400).json({ [key]: "Mã code đã tồn tại" });
      }
    }
    return res.status(500).json(err);
  }
};

// cập nhật mã khuyến mãi
const updateOne = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      code,
      description,
      usableCount,
      discountRate,
      discountPrice,
      startAt,
      endAt,
      isAutoGenerate,
    } = req.body;

    if (!discountPrice && !discountRate)
      return res.status(400).json({
        field: "discount",
        message: "discount rate or price is required",
      });

    let data = { usableCount };

    if (description) data = { ...data, description };
    if (discountRate) data = { ...data, discountRate };
    else if (discountPrice) data = { ...data, discountPrice };
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
    let codeGen;
    if (isAutoGenerate) codeGen = await generateUniqueCoupon();
    else codeGen = code;

    data = { ...data, code: codeGen };

    const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true });

    res.json(coupon);
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      let key = Object.keys(err.keyValue)[0];
      if (key) {
        return res.status(400).json({ [key]: "Mã code đã tồn tại" });
      }
    }
    return res.status(500).json(err);
  }
};

// kiểm tra mã khuyến mãi có chính xác và còn hiệu lực?
const checkValidCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code)
      return res
        .status(400)
        .json({ field: "code", message: "code is required" });
    else {
      const coupon = await Coupon.findOne({ code });

      if (coupon && coupon.usableCount > 0) return res.json({ coupon });
      else
        return res.status(400).json({ field: "code", message: "code invalid" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

// lấy tất cả mã khuyến mãi
const getAll = async (req, res) => {
  try {
    const coupons = await Coupon.find();

    res.json(coupons);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

// xóa mã khuyến mãi
const deleteOne = async (req, res) => {
  const { id } = req.params;

  await Coupon.findByIdAndDelete(id);

  res.json({ success: true });
};

module.exports = {
  addOne,
  checkValidCoupon,
  getAll,
  deleteOne,
  updateOne,
};
