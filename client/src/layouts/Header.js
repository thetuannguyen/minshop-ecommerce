import axios from "axios";
import { Button, Modal, Steps, message, Radio, Divider } from "antd";
import jwt_decode from "jwt-decode";
import React, { useEffect, useState } from "react";
import { GoogleLogin } from "react-google-login";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { login, logout, setCurrentUser } from "../redux/actions/auth";
import {
  getBrands,
  getCart,
  getCategories,
  getProducts,
  getSubcategories,
} from "../redux/actions/products";
import setAuthToken from "../utils/setAuthToken";
import toastNotify from "../utils/toastNotify";

const { Step } = Steps;

function Header({ props }) {
  const dispatch = useDispatch();
  const location = useLocation();

  // step survey
  const [current, setCurrent] = useState(0);
  const next = () => {
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };

  const [isVisible, setIsVisible] = useState(false);

  // user data input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [email1, setEmail1] = useState("");
  const [password1, setPassword1] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isShowPass, setIsShowPass] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // data of user's favorites
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");

  // get data from redux
  const [
    user,
    isAuthenticated,
    brands,
    categories,
    cart,
  ] = useSelector(({ auth, products }) => [
    auth.user,
    auth.isAuthenticated,
    products.brands,
    products.categories,
    products.cart,
  ]);

  // check is admin route
  const isAdminRoute = location.pathname.includes("/admin");

  // reset state to initial
  function resetState() {
    setEmail("");
    setPassword("");
    setEmail1("");
    setPassword1("");
    setName("");
    setPhone("");
  }

  const radioStyle = {
    display: "block",
    height: "30px",
    lineHeight: "30px",
  };

  const steps = [
    {
      // title: "First",
      content: (
        <>
          <div className="text-4xl my-8 font-bold">
            Liệu đây có phải những hãng bạn đang quan tâm?
          </div>
          <Radio.Group
            className="grid grid-cols-3 mb-8"
            onChange={(e) => setBrand(e.target.value)}
            value={brand}
          >
            {brands &&
              brands.length > 0 &&
              brands.slice(0, 6).map((e) => (
                <div className="text-center">
                  <Radio style={radioStyle} value={e._id}>
                    {e.name}
                  </Radio>
                  <img className="h-32" src={`/images/${e.image}`} alt="" />
                  <Divider />
                </div>
              ))}
          </Radio.Group>
        </>
      ),
    },
    {
      // title: "Second",
      content: (
        <>
          <div className="text-4xl my-8 font-bold">
            Một vài danh mục nổi bật của hãng, bạn có thể tham khảo!
          </div>

          <Radio.Group
            className="grid grid-cols-2 text-4xl mb-8"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
            {categories &&
              categories.slice(0, 6).map((e) => (
                <Radio style={radioStyle} value={e._id}>
                  {e.name}
                </Radio>
              ))}
          </Radio.Group>
        </>
      ),
    },
    {
      // title: "Third",
      content: (
        <>
          <div className="text-4xl my-8 font-bold">
            Tầm giá nào phù hợp cho bạn
          </div>
          <Radio.Group onChange={(e) => setPrice(e.target.value)} value={price}>
            <Radio style={radioStyle} value="0-1000000">
              Dưới 1 triệu
            </Radio>
            <Radio style={radioStyle} value="1000000-3000000">
              Từ 1 triệu đến 3 triệu
            </Radio>
            <Radio style={radioStyle} value="3000000-5000000">
              Từ 1 triệu đến 3 triệu
            </Radio>
            <Radio style={radioStyle} value="5000000-9999999999999">
              Từ 5 triệu trở lên
            </Radio>
          </Radio.Group>
        </>
      ),
    },
    // {
    //   // title: "Fourth",
    //   content: (
    //     <Radio.Group onChange={(e) => setBrand(e.target.value)} value={brand}>
    //       <Radio style={radioStyle} value="hoa">
    //         Nước hoa
    //       </Radio>
    //       <Radio style={radioStyle} value="son">
    //         Son
    //       </Radio>
    //       <Radio style={radioStyle} value="phấn">
    //         Phấn
    //       </Radio>
    //     </Radio.Group>
    //   ),
    // },
    // {
    //   // title: "Last",
    //   content: (
    //     <Radio.Group onChange={(e) => setBrand(e.target.value)} value={brand}>
    //       <Radio style={radioStyle} value="hoa">
    //         Nước hoa
    //       </Radio>
    //       <Radio style={radioStyle} value="son">
    //         Son
    //       </Radio>
    //       <Radio style={radioStyle} value="phấn">
    //         Phấn
    //       </Radio>
    //     </Radio.Group>
    //   ),
    // },
  ];
  // get user's favorite
  useEffect(() => {
    const favorites = localStorage.getItem("user-favorites");
    if (!favorites) return setIsVisible(true);
    const userKeys = JSON.parse(favorites);
    if (userKeys && Object.keys(userKeys).length > 0) {
      dispatch({
        type: "SET_KEYS",
        payload: userKeys,
      });
    }
  }, []);

  useEffect(() => {
    if (isShowPass) {
      const password = document.getElementById("password");
      if (password) password.type = "text";
    }
  }, [isShowPass]);

  // get auth token
  const getToken = () => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      const decoded = jwt_decode(token.split(" ")[1]);
      if (decoded.exp < new Date().getTime() / 1000) {
        localStorage.removeItem("jwtToken");
      } else {
        setAuthToken(token);
        dispatch(setCurrentUser(decoded));
      }
    }
  };

  useEffect(() => {
    getToken();
    dispatch(getCategories());
    dispatch(getSubcategories());
    dispatch(getProducts());
    dispatch(getBrands());
    if (isAuthenticated) dispatch(getCart());
  }, [isAuthenticated]);

  function hideModal() {
    let modal = window.document.getElementById("auth-modal");
    let fade = window.document.getElementsByClassName("modal-backdrop");
    if (modal && fade && fade.length > 0) {
      modal.style.display = "none";
      fade[0].style.display = "none";
    }
    resetState();
  }

  function register(data) {
    axios
      .post("/api/auth/register", data)
      .then((res) => {
        hideModal();
        Modal.success({
          content: 'Quý khách đăng ký tài khoản thành công, vui lòng xác nhận email để đăng nhập ạ!',
        });
      })
      .catch((err) => {
        const { errors } = err.response.data;
        if (typeof errors !== "undefined" && errors.length > 0) {
          return toastNotify("warn", errors[0].message);
        } else {
          return toastNotify("warn", "Đã có lỗi xảy ra. Hãy thử lại");
        }
      });
  }

  useEffect(() => {
    if (isAuthenticated) {
      hideModal();
      // window.location.href = location.pathname;
    }
  }, [isAuthenticated, user]);

  const googleLoginSuccess = (res) => {
    const { email, name } = res.profileObj;

    googleLogin({ email, name });
  };

  const googleLoginFailure = (res) => {
    toastNotify("warn", "Đăng nhập thất bại");
  };

  const googleLogin = (data) => {
    axios
      .post("/api/auth/google", data)
      .then((res) => {
        hideModal();
        const { token } = res.data;
        // Set token to localStorage
        localStorage.setItem("jwtToken", token);
        // Set token to Auth header
        setAuthToken(token);
        // Decode token to get user infor
        const decoded = jwt_decode(token);
        // Set current user
        dispatch(setCurrentUser(decoded));
        toastNotify("success", "Đăng nhập thành công");
        window.location.href = location.pathname;
      })
      .catch((err) => {
        if(err.response?.data?.errors) {
          return toastNotify("warn", err.response.data.errors[0].message);
        }
        console.log(err.response)
        return toastNotify("warn", "Đã có lỗi xảy ra. Hãy thử lại");
      });
  };

  function forgotPassword(data) {
    axios
      .post("/api/users/forgot-password", data)
      .then((res) => {
        hideModal();
        toastNotify(
          "success",
          "Mật khẩu mới đã được gửi tới email của bạn. Hãy kiểm tra email của bạn"
        );
      })
      .catch((err) => toastNotify("warn", "Đã có lỗi xảy ra. Hãy thử lại"));
  }

  const getTotalAmountInCart = () => {
    return cart.reduce((acc, e) => acc + e.amount, 0);
  };

  return (
    <>
      {!isAdminRoute ? (
        <header>
          <Modal
            style={{ top: "20px" }}
            // title={!isUpdate ? "Thêm danh mục" : "Cập nhật danh mục"}
            visible={isVisible}
            maskClosable={false}
            footer={null}
            width="50%"
            onCancel={() => {
              setIsVisible(false);
              // resetState();
            }}
            className="rounded-full"
          >
            <Steps current={current}>
              {steps.map((item) => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps>
            <div className="steps-content">{steps[current].content}</div>
            <div className="steps-action">
              {current < steps.length - 1 && (
                <Button type="primary" onClick={() => next()}>
                  Next
                </Button>
              )}
              {current === steps.length - 1 && (
                <Button
                  type="primary"
                  onClick={() => {
                    if (brand || category || price) {
                      let data = {};
                      if (brand) data.brand = brand;
                      if (category) data.category = category;
                      if (price) data.price = price;
                      if (Object.keys(data)) {
                        dispatch({
                          type: "SET_KEYS",
                          payload: data,
                        });
                        localStorage.setItem(
                          "user-favorites",
                          JSON.stringify(data)
                        );
                        message.success(
                          "Cám ơn bạn đã hoàn thành khảo sát của chúng tôi!"
                        );
                        setIsVisible(false);
                      }
                    } else {
                      return message.warning(
                        "Bạn vui lòng trả lời 1 trong các câu hỏi!"
                      );
                    }
                  }}
                >
                  Done
                </Button>
              )}
              {current > 0 && (
                <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
                  Previous
                </Button>
              )}
            </div>
          </Modal>

          <nav className="header-top">
            <span className="quick-mobile">
              <i className="fa fa-phone" /> 0985423664
            </span>
            <span className="quick-mail hidden-xs">
              <i className="fa fa-envelope-o" /> tuannhph07234@fpt.edu.vn
            </span>

            <span className="pull-right">
              {isAuthenticated && user ? (
                <div className="logged" style={{ display: "flex" }}>
                  {/* <i class="fa fa-user-o"></i> */}
                  <img src="/img/user-default.jpg" />
                  <div className="dropdown">
                    <button
                      className="btn btn-default dropdown-toggle"
                      type="button"
                      data-toggle="dropdown"
                    >
                      {user.name}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-right">
                      <li>
                        <Link to="/profile">Quản lý tài khoản</Link>
                      </li>
                      <li>
                        <a
                          id="logout-btn"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            dispatch(logout());
                          }}
                        >
                          Đăng xuất
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="before-log">
                  <button
                    data-toggle="modal"
                    data-tabs="login"
                    data-target=".user-modal"
                  >
                    Đăng nhập
                  </button>
                  <button
                    data-toggle="modal"
                    data-tabs="signup"
                    data-target=".user-modal"
                  >
                    Đăng ký
                  </button>
                </div>
              )}
            </span>
          </nav>
          <nav className="navbar navbar-default">
            <button
              type="button"
              className="navbar-toggle"
              data-toggle="collapse"
              data-target="#menu-collapse"
            >
              <span className="icon-bar" />
              <span className="icon-bar" />
              <span className="icon-bar" />
            </button>
            <a
              href="#"
              className="search"
              data-toggle="slide-collapse"
              data-target="#search-form"
              style={{
                visibility: "hidden",
              }}
            >
              <i className="fa fa-search" />
              <span className="hidden-xs"> Tìm kiếm</span>
            </a>
            <div className="container">
              <div className="menu row">
                <div className="collapse navbar-collapse" id="menu-collapse">
                  <ul className="nav navbar-nav navbar-left">
                    <li>
                      <Link to="/">Trang chủ</Link>
                    </li>
                    <li>
                      <Link to="/products">Sản phẩm</Link>
                    </li>
                    {/* <li>
                      <Link to="/blog">Dự án</Link>
                    </li> */}
                  </ul>
                  <ul className="nav navbar-nav navbar-right">
                    <li>
                      <Link to="/about">Về Min</Link>
                    </li>
                    <li>
                      <Link to="/blog">Blog</Link>
                    </li>
                    <li>
                      <Link to="/contact">Liên hệ</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="cart-box">
              {/* <Link to="/wishlist">
                <i className="fa fa-heart-o" />
              </Link> */}
              <Link to="/cart">
                <i
                  style={{ fontSize: "40px", position: "relative" }}
                  className="fa fa-shopping-cart fa-3x"
                >
                  <div
                    style={{
                      fontSize: "20px",
                      position: "absolute",
                      right: "-8px",
                      top: "-8px",
                      padding: "2px 8px",
                      borderRadius: "50%",
                      backgroundColor: "#336699",
                    }}
                  >
                    {cart && getTotalAmountInCart()}
                  </div>
                </i>
              </Link>
            </div>
            <Link className="logo" to="/">
              <img src="/img/logo-min.png" />
            </Link>
            <div id="search-form">
              <form>
                <input type="text" placeholder="Nhập từ khóa cần tìm" />
                <button type="submit">
                  <i className="fa fa-search" />
                </button>
              </form>
            </div>
          </nav>
          <div id="auth-modal" className="modal fade user-modal" tabIndex={1}>
            <div className="modal-dialog modal-sm">
              <div className="modal-content">
                <ul className="nav nav-tabs" role="tablist">
                  <li id="login-indicator" className="active">
                    <a href="#login" role="tab" data-toggle="tab">
                      Đăng nhập
                    </a>
                  </li>
                  <li id="signup-indicator">
                    <a href="#signup" role="tab" data-toggle="tab">
                      Đăng ký
                    </a>
                  </li>
                </ul>
                <div className="tab-content">
                  <div
                    role="tabpanel"
                    className="tab-pane active fade in"
                    id="login"
                  >
                    <form>
                      <div className="input-field">
                        <input
                          type="email"
                          name="Email"
                          id="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      {!isForgotPassword ? (
                        <>
                          <div className="input-field">
                            <input
                              type={isShowPass ? "text" : "password"}
                              name="Password"
                              id="password"
                              placeholder="Mật khẩu"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                          </div>
                          <div className="input-field check-field">
                            <input
                              type="checkbox"
                              id="remember"
                              name="remember"
                              checked={isShowPass}
                              onChange={(e) => setIsShowPass(!isShowPass)}
                            />
                            <label htmlFor="remember">Hiển thị mật khẩu</label>
                            <br />
                          </div>
                        </>
                      ) : null}
                      {/* <div className="input-field check-field">
                        <input type="checkbox" id="remember" name="remember" />
                        <label htmlFor="remember">Ghi nhớ tài khoản</label>
                        <br />
                      </div> */}
                      <div className="input-field">
                        <button
                          id="login-btn"
                          // data-dismiss="modal"
                          // defaultValue=""
                          onClick={(e) => {
                            e.preventDefault();
                            if (!isForgotPassword)
                              dispatch(login({ email, password }));
                            else forgotPassword({ email });
                          }}
                        >
                          {!isForgotPassword ? "Đăng nhập" : "Xác nhận email"}
                        </button>
                      </div>
                      {!isForgotPassword ? (
                        <>
                          <button
                            data-toggle="modal"
                            // data-target="#reset-password"
                            // data-dismiss="modal"
                            className="btn btn-default"
                            onClick={() => setIsForgotPassword(true)}
                          >
                            <i className="fa fa-question-circle-o" /> Quên mật
                            khẩu?
                          </button>
                          <GoogleLogin
                            clientId="529100369455-hdndf0tm9jdjmso9q4ntt4g9d04pbsl6.apps.googleusercontent.com"
                            buttonText="Đăng nhập bằng Google"
                            onSuccess={googleLoginSuccess}
                            onFailure={googleLoginFailure}
                            cookiePolicy={"single_host_origin"}
                          />
                        </>
                      ) : (
                        <button
                          data-toggle="modal"
                          // data-target="#reset-password"
                          // data-dismiss="modal"
                          className="btn btn-default"
                          onClick={() => setIsForgotPassword(false)}
                        >
                          <i className="fa fa-question-circle-o" /> Bạn đã có
                          mật khẩu? <u>Đăng nhập</u>
                        </button>
                      )}
                    </form>
                  </div>
                  <div role="tabpanel" className="tab-pane fade" id="signup">
                    <form>
                      <div className="input-field">
                        <input
                          type="email"
                          name="Email"
                          id="email"
                          placeholder="Email"
                          value={email1}
                          onChange={(e) => setEmail1(e.target.value)}
                        />
                      </div>
                      <div className="input-field">
                        <input
                          type={isShowPass ? "text" : "password"}
                          name="Password"
                          id="password"
                          placeholder="Mật khẩu"
                          value={password1}
                          onChange={(e) => setPassword1(e.target.value)}
                        />
                      </div>
                      <div className="input-field check-field">
                        <input
                          type="checkbox"
                          id="remember"
                          name="remember"
                          checked={isShowPass}
                          onChange={(e) => setIsShowPass(!isShowPass)}
                        />
                        <label htmlFor="remember">Hiển thị mật khẩu</label>
                        <br />
                      </div>
                      <div className="input-field">
                        <input
                          type="text"
                          name="Name"
                          id="name"
                          placeholder="Họ tên"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="input-field">
                        <input
                          type="text"
                          name="Phone"
                          id="phone"
                          placeholder="Số điện thoại"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div className="input-field">
                        <input
                          id="signup-btn"
                          type="submit"
                          defaultValue="Đăng ký"
                          onClick={(e) => {
                            e.preventDefault();
                            register({
                              email: email1,
                              password: password1,
                              name,
                              phone,
                            });
                          }}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <a href="#">
            <i className="fa fa-angle-up back-top" />
          </a>
        </header>
      ) : null}
    </>
  );
}

export default Header;
