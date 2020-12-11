// định nghĩa brand route

const router = require("express").Router();

const { brandController } = require("../controllers");
const { isAuth, isAdmin } = require("../middleware");

const { processFile } = require("../utils");

router
  .route("/")
  .get(brandController.getMany)
  .post(
    isAuth,
    isAdmin,
    processFile.uploadFile("image", false),
    brandController.addOne
  );

router
  .route("/:id")
  .put(
    isAuth,
    isAdmin,
    processFile.uploadFile("image", false),
    brandController.updateOne
  )
  .delete(isAuth, isAdmin, brandController.deleteOne);

module.exports = router;
