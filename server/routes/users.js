// định nghĩa user route

const router = require("express").Router();
const passport = require("passport");

const { userController } = require("../controllers");
const { isAuth, isAdmin } = require("../middleware");

router
  .route("/")
  .get(isAuth, isAdmin, userController.getMany)
  .post(isAuth, isAdmin, userController.addOne);

router.route("/change-password").post(isAuth, userController.changePassword);
router.route("/forgot-password").post(userController.forgotPassword);
router
  .route("/deactivate")
  .post(isAuth, isAdmin, userController.deactivateUser);
router.route("/activate").post(isAuth, isAdmin, userController.activateUser);

router.route("/:id").delete(isAuth, isAdmin, userController.deleteOne);

module.exports = router;
