// định nghĩa auth route

const router = require("express").Router();

const { authController } = require("../controllers");

router.route("/register").post(authController.register);

router.route("/login").post(authController.login);

router.route("/verify/:token").get(authController.verifyUser);

router.route("/forgot-password").post(authController.forgotPassword);

router.route("/change-password/:token").post(authController.changePassword);

router.route("/google").post(authController.googleLogin);

module.exports = router;
