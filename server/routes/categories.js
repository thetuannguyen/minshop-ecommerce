// định nghĩa categories route

const router = require("express").Router();

const { categoryController } = require("../controllers");
const { isAuth, isAdmin } = require("../middleware");

router
  .route("/")
  .get(categoryController.getMany)
  .post(isAuth, isAdmin, categoryController.addOne);

router
  .route("/:id")
  .put(isAuth, isAdmin, categoryController.updateOne)
  .delete(isAuth, isAdmin, categoryController.deleteOne);

module.exports = router;
