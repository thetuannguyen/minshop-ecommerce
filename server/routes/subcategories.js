// định nghĩa subcategories route

const router = require("express").Router();

const { subcategoryController } = require("../controllers");
const { isAuth, isAdmin } = require("../middleware");

router
  .route("/")
  .get(subcategoryController.getMany)
  .post(isAuth, isAdmin, subcategoryController.addOne);

router
  .route("/:id")
  .put(isAuth, isAdmin, subcategoryController.updateOne)
  .delete(isAuth, isAdmin, subcategoryController.deleteOne);

module.exports = router;
