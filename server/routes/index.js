// combine all route

const authRoute = require("./auth");
const userRoute = require("./users");
const brandRoute = require("./brands");
const productRoute = require("./products");
const categoryRoute = require("./categories");
const subcategoryRoute = require("./subcategories");
const contactRoute = require("./contacts");
const profileRoute = require("./profiles");
const orderRoute = require("./orders");
const discountRoute = require("./discounts");
const couponRoute = require("./coupons");
const blogRoute = require("./blogs");
const commentRoute = require("./comments");
const vnpayRoute = require("./vnpay");
const bannerRoute = require("./banners");
const cartRoute = require("./carts");

module.exports = (app) => {
  app.use("/api/auth", authRoute);
  app.use("/api/users", userRoute);
  app.use("/api/brands", brandRoute);
  app.use("/api/categories", categoryRoute);
  app.use("/api/subcategories", subcategoryRoute);
  app.use("/api/products", productRoute);
  app.use("/api/contacts", contactRoute);
  app.use("/api/profiles", profileRoute);
  app.use("/api/orders", orderRoute);
  app.use("/api/discounts", discountRoute);
  app.use("/api/coupons", couponRoute);
  app.use("/api/blogs", blogRoute);
  app.use("/api/comments", commentRoute);
  app.use("/api/vnpay", vnpayRoute);
  app.use("/api/banners", bannerRoute);
  app.use("/api/carts", cartRoute);

  return app;
};
