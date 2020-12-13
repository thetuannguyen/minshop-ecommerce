import { Carousel } from "antd";
import axios from "axios";
import parseHTML from "html-react-parser";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import "../App.css";
import { addToCart } from "../redux/actions/products";
import formatPrice from "../utils/formatPrice";
import toastNotify from "../utils/toastNotify";

function Home() {
  const dispatch = useDispatch();

  const [blogs, setBlogs] = useState([]);
  const [banners, setBanners] = useState([]);

  // tab product of MIN
  const [currentTab, setCurrentTab] = useState("new-products");

  const [
    products,
    categories,
    brands,
    isLoading,
    keys,
  ] = useSelector(({ products, errors, auth }) => [
    products.products,
    products.categories,
    products.brands,
    errors.isLoading,
    auth.keys,
  ]);

  useEffect(() => {
    document.title = "Trang chủ";

    axios
      .get("/api/blogs")
      .then((res) => setBlogs(res.data))
      .catch((err) => console.log(err));

    axios
      .get("/api/banners")
      .then((res) => setBanners(res.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (Object.keys(keys).length) {
      const { brand, category, price } = keys;
      if (brand || category || price) setCurrentTab("user-favorites");
    }
  }, [keys]);

  return (
    <>
      <div className="container-fluid">
        <Carousel autoplay>
          {banners &&
            banners.map((banner) => (
              <div>
                <div
                  style={{
                    backgroundImage: `url("/images/${banner.image}")`,
                  }}
                  className="banner"
                ></div>
              </div>
            ))}
        </Carousel>
      </div>
      {/* <div className="container-fluid about" id="about-min">
        <div className="section-title">
          <h2>Giới thiệu về MIN</h2>
        </div>
        <i>
          MIN là kênh mua sắm mỹ phẩm, làm đẹp được các blogger lựa chọn để giới
          thiệu sản phẩm họ yêu thích tới khách hàng, người hâm mộ.
        </i>
        <br />
        <i>
          Đến với MIN, khách hàng sẽ là những người đầu tiên có cơ hội được trải
          nghiệm và sử dụng các sản phẩm làm đẹp theo một cách riêng và tốt nhất
          với các thương hiệu mỹ phẩm quốc tế quen thuộc. Ngoài ra, còn có các
          thương hiệu được biết đến bởi những người tiên phong trong việc tìm
          kiếm sản phẩm chất lượng nhất.
        </i>
        <div className="link-container">
          <Link className="link-to" to="/about">
            Xem thêm <i className="fa fa-angle-right" />
          </Link>
        </div>
      </div>
      Sản phẩm mới */}
      {/* Sản phẩm nổi bật */}
      <div className="container-fluid featured">
        <div className="section-title">
          <h2>Sản phẩm của MIN</h2>
          {/* <p>Top những sản phẩm được đánh giá cao</p> */}
        </div>
        <div className="row">
          <ul className="nav nav-tabs">
            <li className={currentTab === "user-favorites" ? "active" : ""}>
              <a
                href="#for-user"
                onClick={() => setCurrentTab("user-favorites")}
                data-toggle="tab"
              >
                Dành cho bạn
              </a>
            </li>
            <li className={currentTab === "new-products" ? "active" : ""}>
              <a
                href="#new-products"
                onClick={() => setCurrentTab("new-products")}
                data-toggle="tab"
              >
                Mới nhất
              </a>
            </li>
          </ul>
          {currentTab === "new-products" && (
            <div className="tab-content">
              <div className="tab-pane active fade in" id="new-products">
                {products &&
                  products.length > 0 &&
                  products
                    .filter((e) => !e.isDeleted)
                    .slice(0, 8)
                    .map((e) => (
                      <div className="col-item col-xs-6 col-md-3">
                        <div className="item-container">
                          <div>
                            <div
                              className="max-1-line"
                              style={{
                                fontWeight: 600,
                                fontSize: "16px",
                                margin: "8px",
                              }}
                              className="max-1-line"
                            >
                              {e.name}
                            </div>
                            <p className="max-1-line">by {e.brandId.name}</p>
                          </div>
                          <div className="photo">
                            <div
                              id={e._id}
                              className="carousel slide"
                              data-ride="carousel"
                              data-interval="false"
                            >
                              <ol className="carousel-indicators">
                                <li
                                  data-target={`#${e._id}`}
                                  data-slide-to={0}
                                  className="active"
                                />
                                <li
                                  data-target={`#${e._id}`}
                                  data-slide-to={1}
                                />
                              </ol>
                              <Link
                                to={`/products/${e._id}`}
                                className="carousel-inner"
                                role="listbox"
                              >
                                {e.images &&
                                  e.images.map((image, index) => (
                                    <div
                                      style={{
                                        backgroundImage: `url("/images/${image}")`,
                                      }}
                                      className={
                                        index === 0 ? "item active" : "item"
                                      }
                                    ></div>
                                  ))}
                              </Link>
                            </div>
                            <div className="vertical-icon">
                              <a
                                href="#"
                                onClick={(event) => {
                                  event.preventDefault();
                                  if (e.amount > 0) {
                                    dispatch(
                                      addToCart({
                                        productId: e._id,
                                        amount: 1,
                                      })
                                    );
                                    toastNotify(
                                      "success",
                                      "Thêm vào giỏ hàng thành công"
                                    );
                                  } else
                                    toastNotify("warn", "Sản phẩm đã hết hàng");
                                }}
                              >
                                <i className="fa fa-shopping-cart" />
                              </a>
                              <Link to={`/products/${e._id}`}>
                                <i className="fa fa-search-plus" />
                              </Link>
                            </div>
                          </div>
                          <div className="price">
                            {e.amount > 0 ? (
                              <strong>
                                {e.priceDiscount && (
                                  <del
                                    style={{
                                      fontSize: "16px",
                                      fontWeight: 600,
                                      marginRight: "8px",
                                      color: "#FF0000",
                                    }}
                                  >
                                    {formatPrice(e.price)}₫
                                  </del>
                                )}
                                {e.priceDiscount ? (
                                  <ins>{formatPrice(e.priceDiscount)}₫</ins>
                                ) : (
                                  <ins>{formatPrice(e.price)}₫</ins>
                                )}
                              </strong>
                            ) : (
                              <strong style={{ color: "red" }}>Hết hàng</strong>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
              <div className="tab-pane fade" id="table"></div>
              <div className="tab-pane fade" id="cabinet"></div>
            </div>
          )}
          {Object.keys(keys).length > 0 && currentTab === "user-favorites" && (
            <div className="tab-content">
              <div className="tab-pane active fade in" id="for-user">
                {products &&
                  products.length > 0 &&
                  products
                    .filter((e) => !e.isDeleted)
                    .filter((e) => {
                      if (keys) {
                        const { brand, category, price } = keys;
                        if (brand || category || price) {
                          if (price)
                            return brand
                              ? e.brandId._id == brand
                              : false || category
                              ? e.categoryId._id == category
                              : false || price
                              ? e.price >= +price.split("-")[0]
                              : false || price
                              ? e.price <= +price.split("-")[1]
                              : false;
                          else
                            return brand
                              ? e.brandId._id == brand
                              : false || category
                              ? e.categoryId._id == category
                              : false;
                        }
                      }
                      return true;
                    })
                    .slice(0, 8)
                    .map((e) => (
                      <div className="col-item col-xs-6 col-md-3">
                        <div className="item-container">
                          <div>
                            <div
                              className="max-1-line"
                              style={{
                                fontWeight: 600,
                                fontSize: "16px",
                                margin: "8px",
                              }}
                              className="max-1-line"
                            >
                              {e.name}
                            </div>
                            <p className="max-1-line">by {e.brandId.name}</p>
                          </div>
                          <div className="photo">
                            <div
                              id={e._id}
                              className="carousel slide"
                              data-ride="carousel"
                              data-interval="false"
                            >
                              <ol className="carousel-indicators">
                                <li
                                  data-target={`#${e._id}`}
                                  data-slide-to={0}
                                  className="active"
                                />
                                <li
                                  data-target={`#${e._id}`}
                                  data-slide-to={1}
                                />
                              </ol>
                              <Link
                                to={`/products/${e._id}`}
                                className="carousel-inner"
                                role="listbox"
                              >
                                {e.images &&
                                  e.images.map((image, index) => (
                                    <div
                                      style={{
                                        backgroundImage: `url("/images/${image}")`,
                                      }}
                                      className={
                                        index === 0 ? "item active" : "item"
                                      }
                                    ></div>
                                  ))}
                              </Link>
                            </div>
                            <div className="vertical-icon">
                              <a
                                href="#"
                                onClick={(event) => {
                                  event.preventDefault();
                                  if (e.amount > 0) {
                                    dispatch(
                                      addToCart({
                                        productId: e._id,
                                        amount: 1,
                                      })
                                    );
                                    toastNotify(
                                      "success",
                                      "Thêm vào giỏ hàng thành công"
                                    );
                                  } else
                                    toastNotify("warn", "Sản phẩm đã hết hàng");
                                }}
                              >
                                <i className="fa fa-shopping-cart" />
                              </a>
                              <Link to={`/products/${e._id}`}>
                                <i className="fa fa-search-plus" />
                              </Link>
                            </div>
                          </div>
                          <div className="price">
                            {e.amount > 0 ? (
                              <strong>
                                {e.priceDiscount && (
                                  <del
                                    style={{
                                      fontSize: "16px",
                                      fontWeight: 600,
                                      marginRight: "8px",
                                      color: "#FF0000",
                                    }}
                                  >
                                    {formatPrice(e.price)}₫
                                  </del>
                                )}
                                {e.priceDiscount ? (
                                  <ins>{formatPrice(e.priceDiscount)}₫</ins>
                                ) : (
                                  <ins>{formatPrice(e.price)}₫</ins>
                                )}
                              </strong>
                            ) : (
                              <strong style={{ color: "red" }}>Hết hàng</strong>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
              <div className="tab-pane fade" id="table"></div>
              <div className="tab-pane fade" id="cabinet"></div>
            </div>
          )}
        </div>
        <div className="section-title">
          <h2>Sản phẩm nổi bật</h2>
          {/* <p>Top những sản phẩm được đánh giá cao</p> */}
        </div>
        <div className="row">
          <div className="tab-content">
            <div
              className="tab-pane active fade in"
              id="new-products-hightlight"
            >
              {products &&
                products.length > 0 &&
                products
                  .filter((e) => !e.isDeleted)
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 8)
                  .map((e) => (
                    <div className="col-item col-xs-6 col-md-3">
                      <div className="item-container">
                        <div>
                          <div
                            className="max-1-line"
                            style={{
                              fontWeight: 600,
                              fontSize: "16px",
                              margin: "8px",
                            }}
                            className="max-1-line"
                          >
                            {e.name}
                          </div>
                          <p className="max-1-line">by {e.brandId.name}</p>
                        </div>
                        <div className="photo">
                          <div
                            id={e._id}
                            className="carousel slide"
                            data-ride="carousel"
                            data-interval="false"
                          >
                            <ol className="carousel-indicators">
                              <li
                                data-target={`#${e._id}`}
                                data-slide-to={0}
                                className="active"
                              />
                              <li data-target={`#${e._id}`} data-slide-to={1} />
                            </ol>
                            <Link
                              to={`/products/${e._id}`}
                              className="carousel-inner"
                              role="listbox"
                            >
                              {e.images &&
                                e.images.map((image, index) => (
                                  <div
                                    style={{
                                      backgroundImage: `url("/images/${image}")`,
                                    }}
                                    className={
                                      index === 0 ? "item active" : "item"
                                    }
                                  ></div>
                                ))}
                            </Link>
                          </div>
                          <div className="vertical-icon">
                            <a
                              href="#"
                              onClick={(event) => {
                                event.preventDefault();
                                if (e.amount > 0) {
                                  dispatch(
                                    addToCart({
                                      productId: e._id,
                                      amount: 1,
                                    })
                                  );
                                  toastNotify(
                                    "success",
                                    "Thêm vào giỏ hàng thành công"
                                  );
                                } else
                                  toastNotify("warn", "Sản phẩm đã hết hàng");
                              }}
                            >
                              <i className="fa fa-shopping-cart" />
                            </a>
                            <Link to={`/products/${e._id}`}>
                              <i className="fa fa-search-plus" />
                            </Link>
                          </div>
                        </div>
                        <div className="price">
                          {e.amount > 0 ? (
                            <strong>
                              {e.priceDiscount && (
                                <del
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    marginRight: "8px",
                                    color: "#FF0000",
                                  }}
                                >
                                  {formatPrice(e.price)}₫
                                </del>
                              )}
                              {e.priceDiscount ? (
                                <ins>{formatPrice(e.priceDiscount)}₫</ins>
                              ) : (
                                <ins>{formatPrice(e.price)}₫</ins>
                              )}
                            </strong>
                          ) : (
                            <strong style={{ color: "red" }}>Hết hàng</strong>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
            <div className="tab-pane fade" id="table"></div>
            <div className="tab-pane fade" id="cabinet"></div>
          </div>
        </div>

        <div className="link-container">
          <Link className="link-to" to="/products">
            Xem toàn bộ sản phẩm <i className="fa fa-angle-right" />
          </Link>
        </div>
      </div>
      {/* Thương hiệu owl carousel */}
      <div className="container-fluid brand-slide">
        <div className="container">
          <div className="brand-owl owl-carousel">
            {/* <div className="brand-item">
              <img src="img/logo_1.png" className="img-responsive" />
            </div> */}
            {/* <div className="brand-item">
              <img src="img/logo_2.png" className="img-responsive" />
            </div>
            <div className="brand-item">
              <img src="img/logo_3.png" className="img-responsive" />
            </div>
            <div className="brand-item">
              <img src="img/logo_4.png" className="img-responsive" />
            </div> */}
            <div className="brand-item">
              <img src="img/logo_5.png" className="img-responsive" />
            </div>
            <div className="brand-item">
              <img src="img/logo_6.png" className="img-responsive" />
            </div>
            <div className="brand-item">
              <img src="img/logo_7.png" className="img-responsive" />
            </div>
            <div className="brand-item">
              <img src="img/logo_8.png" className="img-responsive" />
            </div>
            <div className="brand-item">
              <img src="img/logo_9.png" className="img-responsive" />
            </div>
            <div className="brand-item">
              <img src="img/logo_10.png" className="img-responsive" />
            </div>
            <div className="brand-item">
              <img src="img/logo_11.png" className="img-responsive" />
            </div>
            <div className="brand-item">
              <img src="img/logo_12.png" className="img-responsive" />
            </div>
          </div>
        </div>
      </div>
      {/* Bộ sưu tập nổi bật */}
      {/* <div className="container collection">
        <div className="section-title">
          <h2>Bộ sưu tập mới</h2>
          <p>Ikea VIKTIGT Collection 2017</p>
        </div>
        <div className="col-xs-6 col-item">
          <div className="img-container">
            <div className="img-info">
              <h3>VIKTIGT Long Chair</h3>
              <strong>2.800.000₫</strong>
            </div>
            <span className="top-left" />
            <span className="right-bottom" />
            <img src="img/viktigt_1.jpg" className="img-responsive" />
          </div>
        </div>
        <div className="col-xs-6 col-md-3 col-item right-first">
          <div className="img-container">
            <div className="img-info">
              <h3>VIKTIGT Lamp</h3>
              <strong>700.000₫</strong>
            </div>
            <span className="top-left" />
            <span className="right-bottom" />
            <img src="img/viktigt_2.jpg" className="img-responsive" />
          </div>
        </div>
        <div className="col-xs-6 col-md-3 col-item right-first">
          <div className="img-container">
            <div className="img-info">
              <h3>VIKTIGT Chair</h3>
              <strong>1.000.000₫</strong>
            </div>
            <span className="top-left" />
            <span className="right-bottom" />
            <img src="img/viktigt_3.png" className="img-responsive" />
          </div>
        </div>
        <div className="col-xs-6 col-md-3 col-item">
          <div className="img-container">
            <div className="img-info">
              <h3>VIKTIGT Basket</h3>
              <strong>360.000₫</strong>
            </div>
            <span className="top-left" />
            <span className="right-bottom" />
            <img src="img/viktigt_4.jpg" className="img-responsive" />
          </div>
        </div>
        <div className="col-xs-6 col-md-3 col-item">
          <div className="img-container">
            <div className="img-info">
              <h3>VIKTIGT Sofa</h3>
              <strong>3.200.000₫</strong>
            </div>
            <span className="top-left" />
            <span className="right-bottom" />
            <img src="img/viktigt_5.jpg" className="img-responsive" />
          </div>
        </div>
        <div className="col-xs-6 col-item right-last">
          <div className="img-container">
            <div className="img-info">
              <h3>VIKTIGT Plates</h3>
              <strong>1.300.000₫</strong>
            </div>
            <span className="top-left" />
            <span className="right-bottom" />
            <img src="img/viktigt_6.jpg" className="img-responsive" />
          </div>
        </div>
        <div className="link-container">
          <a className="link-to" href="shop.html">
            Xem trọn bộ sưu tập <i className="fa fa-angle-right" />
          </a>
        </div>
      </div> */}
      {/* Nhận xét của khách hàng */}
      {/* <div className="container-fluid">
        <div className="row">
          <div
            id="feedback"
            className="carousel slide"
            data-ride="carousel"
            data-interval="false"
          >
            <ol className="carousel-indicators">
              <li data-target="#feedback" data-slide-to={0} />
              <li
                data-target="#feedback"
                data-slide-to={1}
                className="active"
              />
              <li data-target="#feedback" data-slide-to={2} />
            </ol>
            <div className="carousel-inner" role="listbox">
              <div className="item">
                <i className="fa fa-quote-left" />
                <p>
                  Min là địa chỉ yêu thích của mình mỗi khi cần mua đồ nội thất.
                  Sản phẩm nào cũng đẹp, cá tính. Nhân viên lại rất thân thiện.
                  Nhà mình góc nào cũng thấy đồ mua từ Min.
                </p>
                <i className="fa fa-quote-right" />
                <strong>
                  -- <span>Tony Stark</span>, Giám đốc kỹ thuật
                </strong>
              </div>
              <div className="item active">
                <i className="fa fa-quote-left" />
                <p>
                  Một không gian đủ sáng tạo dành cho ai yêu sự độc đáo, đủ ấm
                  áp thân quen với những người đôi chút hoài cổ, đủ phù hợp cho
                  những người tìm kiếm “trang sức” cho ngôi nhà, cửa hàng hay
                  không gian của mình. Yêu Min lắm!
                </p>
                <i className="fa fa-quote-right" />
                <strong>
                  -- <span>Lê Cát Trọng Lý</span>, Nhạc sĩ / Ca sĩ
                </strong>
              </div>
              <div className="item">
                <i className="fa fa-quote-left" />
                <p>
                  Căn hộ chung cư tôi đang ở do Min thiết kế và thi công nội
                  thất. Thật sự là hoàn hảo. Nội thất đơn giản, nhẹ nhàng và ấm
                  áp, tôi luôn thấy thư thái bình yên mỗi khi trở về tổ ấm của
                  mình.
                </p>
                <i className="fa fa-quote-right" />
                <strong>
                  -- <span>Haruki Murakami</span>, Nhà văn
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      {/* Dự án gần đây */}
      {/* <div className="container-fluid new-project">
        <div className="section-title">
          <h2>Thiết kế &amp; Thi công</h2>
          <p>Các dự án mới thực hiện</p>
        </div>
        <div className="project-container single">
          <div className="project-title">
            <h3>Homestay Lacaito</h3>
            <p>Số 2 ngõ Dã Tượng, phố Dã Tượng, Hà Nội</p>
          </div>
        </div>
        <div className="project-container double">
          <div className="project-title">
            <h3>Văn phòng BnW</h3>
            <p>Số 196 Vương Thừa Vũ, Đống Đa, Hà Nội</p>
          </div>
        </div>
        <div className="project-container double">
          <div className="project-title">
            <h3>Fika Cafe</h3>
            <p>Số 50 Lò Đúc, Hai Bà Trưng, Hà Nội</p>
          </div>
        </div>
        <div className="project-container single">
          <div className="project-title">
            <h3>Gardenista Cafe</h3>
            <p>Số 50 Vạn Bảo, Ba Đình, Hà Nội</p>
          </div>
        </div>
        <div className="link-container">
          <a className="link-to" href="blog.html">
            Xem tất cả dự án <i className="fa fa-angle-right" />
          </a>
        </div>
      </div> */}
      {/* Phong cách */}
      {/* <div className="section-title style">
        <h2>Phong cách</h2>
        <p>Các phong cách thiết kế tại MIN</p>
      </div>
      <div className="container-fluid project-style">
        <div className="row">
          <div className="style-title">
            <p>Bạn chọn phong cách nào cho</p>
            <div>
              <a href="#">
                <i className="fa fa-home" /> Ngôi Nhà
              </a>{" "}
              |{" "}
              <a href="#">
                <i className="fa fa-coffee" /> Cửa Hàng
              </a>
            </div>
            <p className="separator">hay</p>
            <div>
              <a href="#">
                <i className="fa fa-building-o" /> Không gian Làm việc
              </a>
            </div>
            <p>sắp tới của bạn?</p>
          </div>
          <ul className="nav custom-nav nav-tabs container">
            <li>
              <a href="#scandi" data-toggle="tab">
                Tối giản hiện đại
              </a>
            </li>
            <li className="active ">
              <a href="#modern" data-toggle="tab">
                Scandinavian
              </a>
            </li>
            <li>
              <a href="#wabi" data-toggle="tab">
                Wabi Sabi
              </a>
            </li>
          </ul>
          <div className="link-container">
            <a className="link-to" href="#">
              Xem dự án liên quan <i className="fa fa-angle-right" />
            </a>
          </div>
          <div className="tab-content custom-tab">
            <div className="tab-pane fade" id="scandi"></div>
            <div className="tab-pane active fade in" id="modern"></div>
            <div className="tab-pane fade" id="wabi"></div>
          </div>
        </div>
      </div> */}
      {/* Blog */}
      <div className="container blog-section">
        <div className="section-title">
          <h2>Blog</h2>
          <p>Bài viết mới nhất</p>
        </div>
        <div className="row">
          {blogs && blogs.length > 0 && (
            <div className="blog-container" id="blog1">
              <div
                className="blog-thumbnail"
                style={{
                  backgroundImage: `url("/images/${blogs[0].cover}")`,
                }}
              >
                <Link to={`/blog/${blogs[0]._id}`}>
                  <span className="cross" />
                </Link>
              </div>
              <div className="blog-content">
                <h3 style={{ fontSize: "24px" }}>{blogs[0].title}</h3>
                <p className="max-3-line">{parseHTML(blogs[0].content)}</p>
                <Link className="link-to" to={`/blog/${blogs[0]._id}`}>
                  Đọc thêm <i className="fa fa-angle-right" />
                </Link>
              </div>
            </div>
          )}
          {blogs && blogs.length > 1 && (
            <div className="blog-container" id="blog2">
              <div
                className="blog-thumbnail"
                style={{
                  backgroundImage: `url("/images/${blogs[1].cover}")`,
                }}
              >
                <Link to={`/blog/${blogs[1]._id}`}>
                  <span className="cross" />
                </Link>
              </div>
              <div className="blog-content">
                <h3 style={{ fontSize: "24px" }}>{blogs[1].title}</h3>
                <p className="max-3-line">{parseHTML(blogs[1].content)}</p>
                <Link className="link-to" to={`/blog/${blogs[1]._id}`}>
                  Đọc thêm <i className="fa fa-angle-right" />
                </Link>
              </div>
            </div>
          )}
        </div>
        <div className="link-container">
          <Link className="link-to" to="/blog">
            Xem tất cả bài viết <i className="fa fa-angle-right" />
          </Link>
        </div>
      </div>
    </>
  );
}

export default Home;
