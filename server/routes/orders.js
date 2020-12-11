// định nghĩa orders route

const router = require("express").Router();

const { orderController } = require("../controllers");
const { isAuth, isAdmin } = require("../middleware");

router.route("/").get(isAuth, orderController.getAllOfUser);
router.route("/all").get(orderController.getAll);

router.route("/checkout").post(isAuth, orderController.addOne);
router.route("/checkout-no-auth").post(orderController.addOneNoAuth);

router
  .route("/admin/checkout")
  .post(isAuth, isAdmin, orderController.addOneByAdmin);

router
  .route("/:id/")
  .delete(isAuth, isAdmin, orderController.deleteOne)
  .put(isAuth, isAdmin, orderController.updateOrder);

router.route("/:id/cancel").get(isAuth, isAdmin, orderController.cancelOrder);
router
  .route("/:id/histories")
  .get(isAuth, isAdmin, orderController.getHistoriesByOrderId);

router.route("/admin/report").get(orderController.getStatisticalOrders);

module.exports = router;
