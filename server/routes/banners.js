// định nghĩa banner route

const router = require("express").Router();

const { bannerController } = require("../controllers");
const { isAuth, isAdmin } = require("../middleware");
const processFile = require("../utils/processFile");

router
  .route("/")
  .get(bannerController.getAll)
  .post(
    isAuth,
    isAdmin,
    processFile.uploadFile("image", false),
    bannerController.addOne
  );

router.route("/:id").delete(isAuth, isAdmin, bannerController.deleteOne);

module.exports = router;
