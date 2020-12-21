import React, { useState, useEffect } from "react";
import { useLocation, Redirect } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

import { checkout } from "../redux/actions/products";
import toastNotify from "../utils/toastNotify";
import { CLEAR_CART } from "../redux/types";

function CheckPayment() {
  const location = useLocation();
  const dispatch = useDispatch();

  const [isSuccess, setIsSuccess] = useState(false)

  const [
    isAuthenticated,
    // products,
    // cart,
  ] = useSelector(({ auth, products }) => [
    auth.isAuthenticated,
    // products.products,
    // products.cart,
  ]);


  function checkoutNoAuth(orderData) {
    console.log(orderData);
    axios
      .post("/api/orders/checkout-no-auth", { ...orderData, isPaid: true })
      .then((res) => {
        toastNotify("success", "Đặt hàng thành công");
        dispatch({
          type: CLEAR_CART,
        });
      });
  }

  // const query = location.split("/check?")[1];
  useEffect(() => {
    axios
      .get(`/api/vnpay/check-payment${location.search}`)
      .then((res) => {
        if (res.data.code === "00") {
          let orderData = JSON.parse(localStorage.getItem("cart_pending"));
          localStorage.removeItem("cart_pending");
          setIsSuccess(true);
          if (!isAuthenticated) return checkoutNoAuth(orderData);
          else return dispatch(checkout({ ...orderData, isPaid: true }));
        }
      })
      .catch((err) => console.log(err));
  }, [location]);

  return (
    isSuccess ?
    <div className="container payment-main">
      <div className="row">Kiểm tra thanh toán</div>
    </div> : <Redirect to={{
      pathname: '/cart',
      state: { step: 2}
    }} />
  );
}

export default CheckPayment;
