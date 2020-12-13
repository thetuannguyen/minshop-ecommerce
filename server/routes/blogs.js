// định nghĩa blog route
const router = require("express").Router();

const { blogController } = require("../controllers");
const { isAuth, isAdmin } = require("../middleware");

const { uploadFile } = require("../utils/processFile");

// blog route
router
  .route("/")
  .get(blogController.getAll)
  .post(isAuth, isAdmin, uploadFile("cover", false), blogController.addBlog);

// blog categories route
router
  .route("/categories")
  .get(blogController.getAllCategories)
  .post(isAuth, isAdmin, blogController.addCategory);
router
  .route("/categories/:id")
  .put(isAuth, isAdmin, blogController.updateBlogCategory)
  .delete(isAuth, isAdmin, blogController.deleteBlogCategory);

// blog tags route

router
  .route("/tags")
  .get(blogController.getAllTags)
  .post(isAuth, isAdmin, blogController.addTag);
router
  .route("/tags/:id")
  .put(isAuth, isAdmin, blogController.updateBlogTag)
  .delete(isAuth, isAdmin, blogController.deleteBlogTag);

router
  .route("/upload")
  .post(uploadFile("file", true), blogController.uploadImgContent);

router
  .route("/:id")
  .get(blogController.getById)
  .put(isAuth, isAdmin, uploadFile("cover", false), blogController.updateOne)
  .delete(isAuth, isAdmin, blogController.deleteOne);

module.exports = router;
