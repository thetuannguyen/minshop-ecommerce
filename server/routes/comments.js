// định nghĩa comment route

const router = require("express").Router();

const { commentController } = require("../controllers");
const { isAuth, isAdmin } = require("../middleware");

router
  .route("/")
  .get(commentController.getAll)
  .post(isAuth, commentController.addComment);

router.route("/reply").post(isAuth, commentController.addReplyComment);
router.route("/:id").delete(isAuth, isAdmin, commentController.deleteOne);

module.exports = router;
