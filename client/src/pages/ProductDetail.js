import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import "../App.css";
import { addToCart } from "../redux/actions/products";
import parseHTML from "html-react-parser";
import toastNotify from "../utils/toastNotify";
import formatPrice from "../utils/formatPrice";
import { formatDate } from "../utils/formatDate";

function ProductDetail() {
  let { id } = useParams();

  const [product, setProduct] = useState({});
  const [productsRelated, setProductsRelated] = useState([]);
  const [comments, setComments] = useState([]);
  const [amount, setAmount] = useState(1);

  // comment
  const [comment, setComment] = useState("");

  const dispatch = useDispatch();

  const [isAuthenticated, products] = useSelector(({ auth, products }) => [
    auth.isAuthenticated,
    products.products,
  ]);

  // const product = products.find((p) => p._id == id);
  useEffect(() => {
    if (products) {
      const _p = products.find((p) => p._id === id);
      setProduct(_p);
    }
    axios
      .get(`/api/products/${id}`)
      .then((res) => {
        // setProduct(res.data.product);
        setComments(res.data.comments);
        console.log(res.data.comments);
        setProductsRelated(res.data.productsRelated);
      })
      .catch((err) => console.log(err));

    window.scrollTo(0, 0);
  }, [id, products]);

  function addComment() {
    axios
      .post("/api/comments", { content: comment, productId: id })
      .then((res) => {
        setComment("");
        toastNotify("success", "Đã gửi bình luận");
        setComments([...comments, res.data]);
      })
      .catch((err) => console.log(err));
  }

  return (
    <>
      {product && Object.keys(product).length > 0 && (
        <>
          <div className="container-fluid page-heading shop-heading">
            <div className="heading-content">
              <ol className="breadcrumb">
                <li>
                  <Link to="/">Trang chủ</Link>
                </li>
                <li>
                  <Link to="/products">Sản phẩm</Link>
                </li>
                <li className="active">Chi tiết Sản phẩm</li>
              </ol>
            </div>
          </div>
          <div className="single-product">
            <div className="images">
              <div
                id="single-1"
                className="carousel slide"
                data-ride="carousel"
                data-interval="false"
              >
                <ol className="carousel-indicators">
                  {product.images &&
                    product.images.map((image, index) => (
                      <li
                        data-target={product._id}
                        data-slide-to={index}
                        className={index === 0 ? "active" : ""}
                      >
                        <div
                          className="bg-img-responsive"
                          style={{
                            backgroundImage: `url("/images/${image}")`,
                          }}
                        ></div>
                      </li>
                    ))}
                </ol>
                <div className="carousel-inner" role="listbox">
                  {product.images &&
                    product.images.map((image, index) => (
                      <div
                        className={index === 0 ? "item active" : "item"}
                        style={{
                          backgroundImage: `url(/images/${image})`,
                        }}
                      ></div>
                    ))}
                </div>
                <a
                  className="left carousel-control"
                  href="#single-1"
                  data-slide="prev"
                >
                  <i className="fa fa-long-arrow-left" />
                </a>
                <a
                  className="right carousel-control"
                  href="#single-1"
                  data-slide="next"
                >
                  <i className="fa fa-long-arrow-right" />
                </a>
              </div>
            </div>
            <div className="summary">
              <h1 className="product-title">{product.name}</h1>
              <div className="single-price">
                {product.priceDiscount && (
                  <del
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      marginRight: "8px",
                      color: "#FF0000",
                    }}
                  >
                    {formatPrice(product.price)}₫
                  </del>
                )}
                {product.priceDiscount ? (
                  <ins>{formatPrice(product.priceDiscount)}₫</ins>
                ) : (
                  <ins>{formatPrice(product.price)}₫</ins>
                )}
              </div>
              {/* <div className="description">
                <p>{parseHTML(product.description)}</p>
              </div> */}
              <p className="stock">
                Tình trạng:{" "}
                {product.amount > 0 ? (
                  <>
                    <span className="in-stock">Còn hàng</span>
                    <br />
                    <div>Có sẵn: {product.amount} sản phẩm</div>
                    <form className="cart">
                      <span>Số lượng:</span>
                      <div className="quantity">
                        <button
                          className="qty-decrease"
                          onClick={() =>
                            amount > 1 ? setAmount(amount - 1) : null
                          }
                          type="button"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={amount}
                          onChange={(e) => {
                            console.log(e.target.value)
                           
                            if(/^[0-9]+$/gi.test(e.target.value) || !e.target.value)
                              if(e.target.value < product.amount)
                                setAmount(e.target.value)
                              else toastNotify('warn', "So luong san pham khong du")
                            else
                              toastNotify('warn', "Ban khong duoc nhap so am")
                          }}
                        />
                        <button
                          className="qty-increase"
                          onClick={() =>
                            amount < product.amount
                              ? setAmount(amount + 1)
                              : null
                          }
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      <div className="cart-button">
                        <button
                          disabled={product.amount > 0 ? false : true}
                          style={{
                            cursor:
                              product.amount > 0 ? "pointer" : "not-allowed",
                          }}
                          className="add-to-cart link-to"
                          onClick={(e) => {
                            e.preventDefault();
                            if (amount > product.amount)
                              return toastNotify(
                                "warn",
                                "Số sản phẩm không đủ"
                              );
                            dispatch(
                              addToCart({ productId: product._id, amount })
                            );
                            toastNotify(
                              "success",
                              "Thêm vào giỏ hàng thành công"
                            );
                          }}
                        >
                          Thêm vào giỏ hàng
                        </button>
                        {/* <a href="#">
                    <i className="fa fa-heart-o" />
                  </a> */}
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <span className="out-stock">Hết hàng</span>
                    <br />
                    <Link to="/contact" className="cart-button">
                      <button
                        style={{
                          cursor: "pointer",
                        }}
                        className="add-to-cart link-to"
                      >
                        Liên hệ với chúng tôi
                      </button>
                      {/* <a href="#">
                    <i className="fa fa-heart-o" />
                  </a> */}
                    </Link>
                  </>
                )}
              </p>

              <div className="product-category">
                Danh mục: <Link to="/products">{product.categoryId.name}</Link>,{" "}
                {product.subcategoryId ? (
                  <Link to="/products">{product.subcategoryId.name}</Link>
                ) : null}
              </div>
            </div>
          </div>

          <div className="container">
            <div className="commerce-tabs">
              <ul className="nav nav-tabs tabs">
                <li className="active">
                  <a data-toggle="tab" href="#tab-description">
                    Video
                  </a>
                </li>
                <li>
                  <a data-toggle="tab" href="#tab-info">
                    Thông tin
                  </a>
                </li>
                <li>
                  <a data-toggle="tab" href="#tab-reviews">
                    Đánh giá
                  </a>
                </li>
              </ul>
              <div className="tab-content">
                <div className="tab-pane fade active in" id="tab-description">
                  {product.describeLink.split("watch?v=").length > 1 && (
                    <iframe
                      width="100%"
                      height="400px"
                      src={`https://www.youtube.com/embed/${
                        product.describeLink.split("watch?v=")[1]
                      }`}
                    ></iframe>
                  )}
                </div>
                <div className="tab-pane fade" id="tab-info">
                  <p>{parseHTML(product.description)}</p>
                </div>
                <div id="tab-reviews" className="tab-pane fade">
                  {isAuthenticated ? (
                    <div className="comments-section">
                      <ul className="comments-list">
                        {comments &&
                          comments.map((e) => (
                            <li className="comment">
                              <div className="comment-wrap">
                                <div className="comment-img">
                                  <img src="/img/user-default.jpg" />
                                </div>
                                <div className="comment-block">
                                  <div className="comment-header">
                                    <span className="comment-author">
                                      <a href="#">{e.user.name}</a>
                                    </span>
                                    <span>{formatDate(e.createdAt)}</span>
                                    {/* <span className="pull-right">
                                      <a
                                        className="comment-reply-link"
                                        href="#"
                                      >
                                        <i className="fa fa-reply" />
                                        <span className="hidden-sm">
                                          {" "}
                                          Trả lời
                                        </span>
                                      </a>
                                    </span> */}
                                  </div>
                                  <div className="comment-content">
                                    <p>{e.content}</p>
                                  </div>
                                </div>
                              </div>
                              <ul className="children">
                                {e.replies &&
                                  e.replies.length > 0 &&
                                  e.replies.map((reply) => (
                                    <li className="comment">
                                      <div className="comment-wrap">
                                        <div className="comment-img">
                                          <img
                                            alt=""
                                            src="/img/user-default.jpg"
                                          />
                                        </div>
                                        <div className="comment-block">
                                          <div className="comment-header">
                                            <span className="comment-author">
                                              <a href="#">ADMIN</a>
                                            </span>
                                            <span>
                                              {formatDate(e.createdAt)}
                                            </span>
                                            {/* <span className="pull-right">
                                            <a
                                              className="comment-reply-link"
                                              href="#"
                                            >
                                              <i className="fa fa-reply" />
                                              <span className="hidden-sm">
                                                {" "}
                                                Trả lời
                                              </span>
                                            </a>
                                          </span> */}
                                          </div>
                                          <div className="comment-content">
                                            <p>{reply.content}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                              </ul>
                            </li>
                          ))}
                      </ul>
                      <div className="respond-wrap">
                        <h3 className="comment-reply-title">Viết bình luận</h3>
                        <form className="comment-form">
                          <div className="row">
                            <div className="comment-form-comment col-md-12">
                              <textarea
                                placeholder="Bình luận *"
                                id="comment"
                                name="comment"
                                cols={40}
                                rows={6}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                              />
                            </div>
                            <div
                              className="col-md-12 submit-wrap"
                              onClick={() => {
                                if (!comment.trim()) return;
                                addComment();
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="form-submit">Gửi bình luận</div>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="text-4xl text-blue-600 mt-8 text-center">
                      Bạn cần đăng nhập để thực hiện tính năng này
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="container-fluid relate-products">
            {productsRelated && productsRelated.length > 0 && (
              <div className="section-title">
                <h2>Sản phẩm liên quan</h2>
              </div>
            )}
            <div className="row">
              {productsRelated &&
                productsRelated.length > 0 &&
                productsRelated.slice(0, 4).map((e) => (
                  <div className="col-item col-xs-6 col-md-3">
                    <div className="item-container">
                      <div className="name">
                        <h3>{e.name}</h3>
                        <p>by {e.brandId.name}</p>
                      </div>
                      <div className="photo">
                        <div
                          id="casiers"
                          className="carousel slide"
                          data-ride="carousel"
                          data-interval="false"
                        >
                          <ol className="carousel-indicators">
                            <li
                              data-target="#casiers"
                              data-slide-to={0}
                              className="active"
                            />
                            <li data-target="#casiers" data-slide-to={1} />
                          </ol>

                          <Link
                            to={`/products/${product._id}`}
                            className="carousel-inner"
                            role="listbox"
                          >
                            {e.images &&
                              e.images.length > 0 &&
                              e.images.map((img, index) => (
                                <div
                                  className={
                                    index === 0 ? "item active" : "item"
                                  }
                                  style={{
                                    backgroundImage: `url(/images/${img})`,
                                  }}
                                ></div>
                              ))}
                          </Link>
                        </div>
                        <div className="vertical-icon">
                          {/* <a>
                            <i className="fa fa-heart-o" />
                          </a> */}
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
          </div>
          <a href="#">
            <i className="fa fa-angle-up back-top" />
          </a>
        </>
      )}
    </>
  );
}

export default ProductDetail;
