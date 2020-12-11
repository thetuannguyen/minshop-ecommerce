// định nghĩa cart route

const router = require("express").Router();

const { cartController } = require("../controllers");
const { isAuth, isAdmin } = require("../middleware");

router
  .route("/")
  .get(isAuth, cartController.getCartHistoryByUser)
  .post(isAuth, cartController.addCartHistory);

module.exports = router;
