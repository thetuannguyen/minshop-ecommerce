// kiểm tra user đã đăng nhập?

const passport = require("passport");

const isAuth = (req, res, next) =>
  passport.authenticate("jwt", { session: false })(req, res, next);

module.exports = isAuth;
