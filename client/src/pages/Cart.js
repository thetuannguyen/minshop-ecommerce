import React, { useState, useEffect } from "react";
import { Link, Redirect, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import formatPrice from "../utils/formatPrice";

import {
  addToCart,
  clearCart,
  deleteFromCart,
} from "../redux/actions/products";
import toastNotify from "../utils/toastNotify";
import { Steps, Button, message } from "antd";
import Payment from "./Payment";
import { CLEAR_CART } from "../redux/types";
const { Step } = Steps;

function Cart() {
  const dispatch = useDispatch();
  const location = useLocation();

  const [totalPrice, setTotalPrice] = useState(0);

  const [couponString, setCouponString] = useState("");
  const [coupon, setCoupon] = useState({});

  // steps
  const [current, setCurrent] = useState(0);
  const next = () => {
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };

  const [
    isAuthenticated,
    products,
    cart,
  ] = useSelector(({ auth, products }) => [
    auth.isAuthenticated,
    products.products,
    products.cart,
  ]);

  function getProductById(id) {
    return products.find((product) => product._id == id);
  }
  useEffect(() => {
    if (location.state && location.state.step) {
      console.log(location.state.step);
      setCurrent(location.state.step);
    }
  }, [location]);
  useEffect(() => {
    if (
      typeof cart !== "undefined" &&
      cart.length > 0 &&
      typeof products !== "undefined" &&
      products.length > 0
    ) {
      let total = 0;
      for (let i = 0; i < cart.length; i++) {
        let p = getProductById(cart[i].productId);
        if (typeof p !== "undefined") {
          total +=
            (p.priceDiscount ? p.priceDiscount : p.price) * cart[i].amount;
        }
      }
      setTotalPrice(total);
    }
  }, [cart, products]);

  function checkValidCoupon() {
    axios
      .post("/api/coupons/check", { code: couponString })
      .then((res) => {
        setCoupon(res.data.coupon);
        toastNotify("success", "Đã áp dụng mã giảm giá");
      })
      .catch((err) => toastNotify("warn", "Mã giảm giá không hợp lệ"));
  }

  function checkout(data) {
    axios
      .post("/api/orders/checkout", data)
      .then((res) => {
        toastNotify("success", "Đặt hàng thành công");
        setCurrent(2);
        return dispatch({
          type: CLEAR_CART,
        });
      })
      .catch((err) => console.log(err));
  }

  function checkoutNoAuth(orderData) {
    axios
      .post("/api/orders/checkout-no-auth", {
        ...orderData,
        products: [...cart],
        total:
          Object.keys(coupon).length > 0
            ? coupon.discountPrice
              ? totalPrice -
                coupon.discountPrice +
                (orderData.shipType === "fast" ? 40000 : 0)
              : totalPrice -
                Math.floor((coupon.discountRate * totalPrice) / 100) +
                (orderData.shipType === "fast" ? 40000 : 0)
            : totalPrice + (orderData.shipType === "fast" ? 40000 : 0),
        coupon: Object.keys(coupon).length > 0 ? coupon : "",
      })
      .then((res) => {
        toastNotify("success", "Đặt hàng thành công");
        setCurrent(2);
        return dispatch({
          type: CLEAR_CART,
        });
      });
  }

  const steps = [
    {
      title: "Giỏ hàng",
      content: (
        <>
          <div className="container">
            {cart && cart.length > 0 ? (
              <div className="row">
                <div className="col-sm-12">
                  <div className="cart-container">
                    <table className="cart">
                      <thead>
                        <tr>
                          <th className="product-thumbnail">Sản phẩm</th>
                          <th className="product-name">
                            <span className="hidden-mobile">Tên sản phẩm</span>
                          </th>
                          <th className="product-price">
                            <span className="hidden-mobile">Đơn giá</span>
                          </th>
                          <th className="product-quantity">
                            <span className="hidden-mobile">Số lượng</span>
                          </th>
                          <th className="product-subtotal">Thành tiền</th>
                          <th className="product-remove">&nbsp;</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart &&
                          products &&
                          cart.map((e) => (
                            <tr key={e.productId} className="cart-item">
                              <td className="product-thumbnail">
                                {getProductById(e.productId) ? (
                                  <Link
                                    to={`/products/${
                                      getProductById(e.productId)._id
                                    }`}
                                  >
                                    <img
                                      src={`/images/${
                                        getProductById(e.productId).images[0]
                                      }`}
                                    />
                                  </Link>
                                ) : null}
                              </td>
                              <td className="product-name">
                                <Link to={`/products/${e.productId}`}>
                                  {getProductById(e.productId)
                                    ? getProductById(e.productId).name
                                    : null}
                                </Link>
                              </td>
                              <td className="product-price">
                                {getProductById(e.productId)
                                  ? getProductById(e.productId).priceDiscount
                                    ? formatPrice(
                                        getProductById(e.productId)
                                          .priceDiscount
                                      )
                                    : formatPrice(
                                        getProductById(e.productId).price
                                      )
                                  : null}
                              </td>
                              <td className="product-quantity">
                                <div className="quantity">
                                  <button
                                    className="qty-decrease"
                                    onClick={() => {
                                      if (e.amount > 1)
                                        dispatch(
                                          addToCart({
                                            productId: e.productId,
                                            amount: -1,
                                          })
                                        );
                                      else
                                        dispatch(deleteFromCart(e.productId));
                                    }}
                                    type="button"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="text"
                                    value={e.amount}
                                    onChange={(e) =>
                                      console.log(e.target.value)
                                    }
                                  />
                                  <button
                                    className="qty-increase"
                                    onClick={() => {
                                      dispatch(
                                        addToCart({
                                          productId: e.productId,
                                          amount: 1,
                                        })
                                      );
                                      toastNotify(
                                        "success",
                                        "Bạn đã thêm sản phẩm"
                                      );
                                    }}
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="product-subtotal">
                                {getProductById(e.productId)
                                  ? formatPrice(
                                      (getProductById(e.productId).priceDiscount
                                        ? getProductById(e.productId)
                                            .priceDiscount
                                        : getProductById(e.productId).price) *
                                        e.amount
                                    )
                                  : null}
                              </td>
                              <td className="product-remove">
                                <button
                                  onClick={() => {
                                    dispatch(deleteFromCart(e.productId));
                                    toastNotify(
                                      "success",
                                      "Đã xóa sản phẩm khỏi giỏ hàng"
                                    );
                                  }}
                                >
                                  <i className="fa fa-trash-o" />
                                </button>
                              </td>
                            </tr>
                          ))}

                        <>
                          <td colSpan={6} className="actions">
                            <button
                              className="empty-cart link-to hidden-mobile"
                              onClick={() => {
                                dispatch(clearCart());
                                toastNotify(
                                  "success",
                                  "Đã xóa toàn bộ giỏ hàng"
                                );
                              }}
                            >
                              Xóa toàn bộ
                            </button>
                            <Link to="/products" className="link-to continue">
                              Tiếp tục mua hàng{" "}
                              <i className="fa fa-angle-right" />
                            </Link>
                          </td>
                        </>
                      </tbody>
                    </table>
                  </div>
                  <div className="cart-checkout container">
                    <div className="col-xs-12 col-sm-6">
                      <div className="cart-coupon">
                        <h3>Mã giảm giá</h3>
                        <input
                          type="text"
                          placeholder="Nhập mã giảm giá"
                          value={couponString}
                          onChange={(e) => setCouponString(e.target.value)}
                        />
                        <button
                          onClick={() => checkValidCoupon()}
                          className="apply-coupon link-to"
                        >
                          Áp dụng mã giảm giá
                        </button>
                      </div>
                    </div>
                    <div className="col-xs-12 col-sm-6">
                      <div className="cart-total">
                        <h3>Tổng tiền</h3>
                        <table>
                          <tbody>
                            <tr className="cart-subtotal">
                              <th>Tạm tính</th>
                              <td>{formatPrice(totalPrice)}</td>
                            </tr>
                            <tr className="cart-discount">
                              <th>
                                Giảm giá
                                <span className="discount-rate" />
                              </th>
                              <td>
                                {Object.keys(coupon).length > 0
                                  ? formatPrice(
                                      coupon.discountPrice
                                        ? coupon.discountPrice
                                        : Math.floor(
                                            (coupon.discountRate * totalPrice) /
                                              100
                                          )
                                    )
                                  : 0}
                              </td>
                            </tr>
                            <tr className="order-total">
                              <th>Tổng tiền</th>
                              <td className="amount">
                                <strong>
                                  {Object.keys(coupon).length > 0
                                    ? formatPrice(
                                        coupon.discountPrice
                                          ? formatPrice(
                                              totalPrice - coupon.discountPrice
                                            )
                                          : formatPrice(
                                              totalPrice -
                                                Math.floor(
                                                  (coupon.discountRate *
                                                    totalPrice) /
                                                    100
                                                )
                                            )
                                      )
                                    : formatPrice(totalPrice)}
                                </strong>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  fontSize: "28px",
                  minHeight: "50vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <img src="/img/empty-cart.png" alt="empty-cart" />
                <div>Giỏ hàng trống</div>
              </div>
            )}
          </div>
        </>
      ),
    },
    {
      title: "Thanh toán",
      content: (
        <Payment
          coupon={coupon}
          checkout={checkout}
          checkoutNoAuth={checkoutNoAuth}
        />
      ),
    },
    {
      title: "Hoàn thành",
      content: (
        <div className="container">
          <div className="row text-center m-8">
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                minHeight: "50vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <div className="text-4xl font-bold">THANK YOU </div>
              <div className="my-10 text-2xl">
                Cảm ơn bạn đã mua hàng tại shop của chúng tôi , mời bạn check
                mail để có thể xem chi tiết thông tin về đơn hàng ! Xin cảm ơn
                !!!{" "}
              </div>
              <div>
                <Link className="mt-4" to="/products">
                  <Button type="primary">Tiếp tục mua hàng</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex mx-20 mt-12 justify-center items-center relative">
        <div className="text-bold text-center">
          <Steps current={current}>
            {steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
        </div>
        <div className="absolute right-0">
          {current === 0 && (
            <Button
              type="primary"
              onClick={() => {
                if (cart && cart.length) next();
              }}
              style={{
                cursor: cart && cart.length == 0 ? "not-allowed" : "pointer",
              }}
              className="checkout-proceed"
            >
              THANH TOÁN
            </Button>
          )}
          {current === 1 && (
            <>
              <Button type="primary" onClick={() => prev()}>
                Quay lại
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="steps-content">{steps[current].content}</div>
      {/* <div className="steps-action">
        {current < steps.length - 1 && (
          <Button type="primary" onClick={() => next()}>
            Next
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button
            type="primary"
            onClick={() => message.success("Processing complete!")}
          >
            Done
          </Button>
        )}
        {current > 0 && (
          <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
            Previous
          </Button>
        )}
      </div> */}
    </>
  );
}

export default Cart;
