// định nghĩa contact route

const router = require("express").Router();

const { contactController } = require("../controllers");
const { isAuth, isAdmin } = require("../middleware");

router
  .route("/")
  .get(isAuth, isAdmin, contactController.getMany)
  .post(contactController.addOne);

router.route("/:id").delete(isAuth, isAdmin, contactController.deleteOne);

module.exports = router;
