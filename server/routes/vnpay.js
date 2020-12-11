// định nghĩa vnpay route

const router = require("express").Router();

const { vnpayController } = require("../controllers");
const { isAuth, isAdmin } = require("../middleware");

router.route("/").get(vnpayController.test);

router
  .route("/create-payment-url")
  // .get(vnpayController.getAll)
  .post(vnpayController.postCreatePaymentUrl);

router.route("/check-payment").get(vnpayController.checkReturnUrl);

module.exports = router;
