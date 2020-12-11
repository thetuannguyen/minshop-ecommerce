// định nghĩa profile route

const router = require("express").Router();

const { profileController } = require("../controllers");
const { isAuth, isAdmin } = require("../middleware");

// router.route("/").put(isAuth);

router.route("/profile").post(isAuth, profileController.updateProfile);

router
  .route("/address")
  .get(isAuth, profileController.getAddressesOfUser)
  .post(isAuth, profileController.addAddress);

router
  .route("/address/:id")
  .delete(isAuth, profileController.deleteAddress)
  .put(isAuth, profileController.updateAddress);

// router.route("/:id").get(isAuth, profileController.getManyByID);

module.exports = router;
