import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import formatPrice from "../utils/formatPrice";
import toastNotify from "../utils/toastNotify";

const { confirm } = Modal;

function Payment({ coupon, checkout, checkoutNoAuth }) {
  const dispatch = useDispatch();

  const [totalPrice, setTotalPrice] = useState(0);
  const [orderData, setOrderData] = useState({});

  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [shipAddressDefault, setShipAddressDefault] = useState({});

  const [
    isAuthenticated,
    products,
    cart,
  ] = useSelector(({ auth, products }) => [
    auth.isAuthenticated,
    products.products,
    products.cart,
  ]);

  function getAddressDefault() {
    axios
      .get("/api/profiles/address")
      .then((res) => {
        const _shipAddressDefault = res.data.find((e) => !!e.isShipDefault);
        if (_shipAddressDefault) {
          setShipAddressDefault(_shipAddressDefault);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function getProductById(id) {
    return products.find((product) => product._id == id);
  }

  useEffect(() => {
    if (isAuthenticated) getAddressDefault();
  }, [isAuthenticated]);

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

  // function checkoutNoAuth() {
  //   axios
  //     .post("/api/orders/checkout-no-auth", {
  //       ...orderData,
  //       products: [...cart],
  //       total:
  //         Object.keys(coupon).length > 0
  //           ? coupon.discountPrice
  //             ? totalPrice - coupon.discountPrice
  //             : totalPrice -
  //               Math.floor((coupon.discountRate * totalPrice) / 100)
  //           : totalPrice,
  //       coupon: Object.keys(coupon).length > 0 ? "coupon" : "",
  //     })
  //     .then((res) => {
  //       toastNotify("success", "Đặt hàng thành công");
  //       dispatch({
  //         type: CLEAR_CART,
  //       });
  //       window.location.href = "/cart";
  //     });
  // }

  function showConfirm() {
    confirm({
      title: "Bạn muốn thanh toán đơn hàng?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        checkoutOrder();
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  }

  function checkoutOrder() {
    if (typeof orderData.name === "undefined")
      return toastNotify("warn", "Họ tên không được để trống");
    if (typeof orderData.phone === "undefined")
      return toastNotify("warn", "Điện thoại không được để trống");
    if (typeof orderData.address === "undefined")
      return toastNotify("warn", "Địa chỉ không được để trống");

    if (typeof orderData.shipType === "undefined")
      return toastNotify("warn", "Hãy chọn hình thức vận chuyển");

    if (orderData.orderType === "VNPAY") {
      const total =
        Object.keys(coupon).length > 0
          ? coupon.discountPrice
            ? totalPrice -
              coupon.discountPrice +
              (orderData.shipType === "fast" ? 40000 : 0)
            : totalPrice -
              Math.floor((coupon.discountRate * totalPrice) / 100) +
              (orderData.shipType === "fast" ? 40000 : 0)
          : totalPrice + (orderData.shipType === "fast" ? 40000 : 0);
      axios
        .post("/api/vnpay/create-payment-url", {
          amount: total,
          bankCode: "NCB",
          orderDescription: "st",
          orderType: "210000",
          language: "vn",
        })
        .then(async (res) => {
          await localStorage.setItem(
            "cart_pending",
            JSON.stringify({
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
              coupon: Object.keys(coupon).length > 0 ? "coupon" : "",
            })
          );
          window.location.href = res.data.data;
        })
        .catch((err) => console.log(err));
    } else {
      if (!isAuthenticated) {
        checkoutNoAuth(orderData);
      } else
        checkout({
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
        });
    }
  }

  return (
    <div className="container payment-main">
      <div className="row">
        <div className="col-xs-12 col-sm-6 col-md-4">
          <div className="payment-tabs">
            <h3>Địa chỉ giao hàng</h3>
            <form>
              {isAuthenticated && (
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={isDefaultAddress}
                      onChange={() => {
                        if (typeof shipAddressDefault === "undefined") {
                          return toastNotify(
                            "warn",
                            "Bạn chưa có địa chỉ giao hàng mặc định"
                          );
                        }
                        setIsDefaultAddress(!isDefaultAddress);
                        setOrderData({
                          ...orderData,
                          name: shipAddressDefault.name,
                          phone: shipAddressDefault.phone,
                          address: shipAddressDefault.address,
                        });
                      }}
                    />{" "}
                    Sử dụng địa chỉ mặc định
                  </label>
                </div>
              )}
              <input
                type="text"
                className={
                  orderData.name
                    ? "form-control"
                    : "form-control required-field"
                }
                id="name"
                onChange={(e) =>
                  setOrderData({
                    ...orderData,
                    name: e.target.value,
                  })
                }
                value={orderData.name}
                placeholder="Họ tên"
              />
              <input
                type="number"
                min="1"
                className={
                  orderData.phone
                    ? "form-control"
                    : "form-control required-field"
                }
                id="phone"
                placeholder="Số điện thoại"
                onChange={(e) => {
                  if (e.target.value.includes("-"))
                    return toastNotify("warn", "Bạn không thể nhập số âm");
                  else
                    setOrderData({
                      ...orderData,
                      phone: e.target.value,
                    });
                }}
                value={orderData.phone}
              />
              {!isAuthenticated && (
                <input
                  type="text"
                  className={
                    orderData.email
                      ? "form-control"
                      : "form-control required-field"
                  }
                  id="note"
                  placeholder="Email"
                  onChange={(e) =>
                    setOrderData({
                      ...orderData,
                      email: e.target.value,
                    })
                  }
                  value={orderData.email}
                />
              )}
              <input
                type="text"
                className={
                  orderData.address
                    ? "form-control"
                    : "form-control required-field"
                }
                id="address"
                placeholder="Địa chỉ"
                onChange={(e) =>
                  setOrderData({
                    ...orderData,
                    address: e.target.value,
                  })
                }
                value={orderData.address}
              />
              <input
                type="text"
                className="form-control"
                id="note"
                placeholder="Ghi chú"
                onChange={(e) =>
                  setOrderData({
                    ...orderData,
                    note: e.target.value,
                  })
                }
                value={orderData.note}
              />
              <select
                className={
                  orderData.shipType
                    ? "form-control"
                    : "form-control required-field"
                }
                onChange={(e) =>
                  setOrderData({
                    ...orderData,
                    shipType: e.target.value,
                  })
                }
                value={orderData.shipType}
              >
                <option value="" selected hidden>
                  Hình thức vận chuyển
                </option>
                <option value="standard">Tiêu chuẩn (miễn phí)</option>
                <option value="fast">Giao hàng nhanh</option>
              </select>
              {/* <button type="submit" class="btn btn-default">Submit</button> */}
            </form>
          </div>
        </div>
        <div className="col-xs-12 col-sm-6 col-md-4">
          <div className="payment-tabs">
            <h3>Hình thức thanh toán</h3>
            <ul className="nav nav-tabs">
              <li className="active">
                <a
                  href="#payment-cod"
                  data-toggle="tab"
                  onClick={() =>
                    setOrderData({
                      ...orderData,
                      orderType: "COD",
                    })
                  }
                >
                  TT khi nhận hàng
                </a>
              </li>
              <li>
                <a
                  href="#payment-online"
                  data-toggle="tab"
                  onClick={() =>
                    setOrderData({
                      ...orderData,
                      orderType: "VNPAY",
                    })
                  }
                >
                  VNPAY
                </a>
              </li>
            </ul>
            <div className="tab-content">
              <div className="tab-pane active" id="payment-cod"></div>
              <div className="tab-pane" id="payment-online">
                <select className="form-control">
                  <option disabled selected hidden>
                    Tên ngân hàng
                  </option>
                  <option>NCB - Ngân hàng Quốc Dân</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xs-12 col-md-4">
          <div className="cart-total">
            <h3>Thông tin đơn hàng</h3>
            <table className="cart-brief">
              <tbody>
                {cart &&
                  products &&
                  cart.map((e) => (
                    <tr>
                      <td className="cart-p-thumbnail">
                        {getProductById(e.productId) ? (
                          <img
                            src={`/images/${
                              getProductById(e.productId).images[0]
                            }`}
                            className="img-responsive"
                          />
                        ) : null}
                        <div className="cart-p-qty">{e.amount}</div>
                      </td>
                      <td className="cart-p-name">
                        {getProductById(e.productId)
                          ? getProductById(e.productId).name
                          : null}
                      </td>
                      <td className="cart-p-price">
                        {getProductById(e.productId)
                          ? formatPrice(
                              (getProductById(e.productId).priceDiscount
                                ? getProductById(e.productId).priceDiscount
                                : getProductById(e.productId).price) * e.amount
                            )
                          : null}
                        ₫
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <table>
              <tbody>
                <tr className="cart-subtotal">
                  <th>Tạm tính</th>
                  <td>{formatPrice(totalPrice)}</td>
                </tr>
                <tr className="deli-fee">
                  <th>Phí giao hàng</th>
                  <td>
                    {orderData.shipType
                      ? orderData.shipType === "standard"
                        ? 0
                        : formatPrice(40000)
                      : 0}
                  </td>
                </tr>
                <tr className="deli-fee">
                  <th>Giảm giá</th>
                  <td>
                    {Object.keys(coupon).length > 0
                      ? formatPrice(
                          coupon.discountPrice
                            ? coupon.discountPrice
                            : Math.floor(
                                (coupon.discountRate * totalPrice) / 100
                              )
                        )
                      : 0}
                  </td>
                </tr>
                <tr className="order-total">
                  <th>Tổng tiền</th>
                  <td className="amount">
                    <strong>
                      {coupon && Object.keys(coupon).length
                        ? formatPrice(
                            coupon.discountPrice
                              ? formatPrice(
                                  totalPrice -
                                    +coupon.discountPrice +
                                    (orderData.shipType === "fast" ? 40000 : 0)
                                )
                              : formatPrice(
                                  totalPrice -
                                    Math.floor(
                                      (+coupon.discountRate * +totalPrice) / 100
                                    ) +
                                    (orderData.shipType === "fast" ? 40000 : 0)
                                )
                          )
                        : formatPrice(
                            orderData.shipType === "fast"
                              ? totalPrice + 40000
                              : totalPrice
                          )}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
            <button
              className="order-final"
              onClick={(e) => {
                e.preventDefault();
                showConfirm();
              }}
            >
              Đặt hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
