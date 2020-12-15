import { Button, DatePicker, Steps } from "antd";
import axios from "axios";
import jwt_decode from "jwt-decode";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentUser, logout } from "../redux/actions/auth";
import { formatDate } from "../utils/formatDate";
import formatPrice from "../utils/formatPrice";
import setAuthToken from "../utils/setAuthToken";
import toastNotify from "../utils/toastNotify";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { confirm } = Modal;

const { Step } = Steps;

function Profile() {
  const dispatch = useDispatch();

  const [currentTab, setCurrentTab] = useState("general");

  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);

  const [shipAddressesDefault, setShipAddressesDefault] = useState({});
  const [paymentAddressDefault, setPaymentAddressDefault] = useState({});

  const [emailUpdate, setEmailUpdate] = useState("");
  const [passwordUpdate, setPasswordUpdate] = useState("");
  const [nameUpdate, setNameUpdate] = useState("");
  const [phoneUpdate, setPhoneUpdate] = useState("");
  const [birthdayUpdate, setBirthdayUpdate] = useState("");
  const [genderUpdate, setGenderUpdate] = useState("");

  const [addressName, setAddressName] = useState("");
  const [addressPhone, setAddressPhone] = useState("");
  const [addressAddress, setAddressAddress] = useState("");
  const [isAddressShipDefault, setIsAddressShipDefault] = useState(false);
  const [isAddressPaymentDefault, setIsAddressPaymentDefault] = useState(false);
  const [addressUpdate, setAddressUpdate] = useState({});

  // change password state
  const [isVisible, setIsVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // filter order
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // pagination
  const [page, setPage] = useState(0);

  const [user, isAuthenticated] = useSelector(({ auth }) => [
    auth.user,
    auth.isAuthenticated,
  ]);

  function getAddresses() {
    axios
      .get("/api/profiles/address")
      .then((res) => {
        setAddresses(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function getOrders() {
    axios
      .get("/api/orders")
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    if (user) {
      setNameUpdate(user.name);
      setEmailUpdate(user.email);
      setPhoneUpdate(user.phone);
      setBirthdayUpdate(user.birthday);
      setGenderUpdate(user.gender);
    }
  }, [user]);

  useEffect(() => {
    getAddresses();
    getOrders();
  }, []);

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      let _shipAddress = addresses.find((e) => e.isShipDefault);
      if (_shipAddress) setShipAddressesDefault(_shipAddress);

      let _paymentAddress = addresses.find((e) => e.isPaymentDefault);
      if (_paymentAddress) setPaymentAddressDefault(_paymentAddress);
    }
  }, [addresses]);

  function showConfirmUpdateProfile() {
    confirm({
      title: "Bạn chắc chắn muốn thay đổi thông tin?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        let dataUpdate = {};
        if (emailUpdate != user.email) {
          dataUpdate.email = emailUpdate;
        }
        if (passwordUpdate) {
          dataUpdate.password = passwordUpdate;
        }
        if (nameUpdate != user.name) {
          dataUpdate.name = nameUpdate;
        }
        if (phoneUpdate != user.phone) {
          dataUpdate.phone = phoneUpdate;
        }
        if (birthdayUpdate != user.birthday) {
          dataUpdate.birthday = birthdayUpdate;
        }
        if (genderUpdate != user.gender) {
          dataUpdate.gender = genderUpdate;
        }
        axios.post("/api/profiles/profile", dataUpdate).then((res) => {
          const { token } = res.data;
          // Set token to localStorage
          localStorage.setItem("jwtToken", token);
          // Set token to Auth header
          setAuthToken(token);
          // Decode token to get user infor
          const decoded = jwt_decode(token);
          console.log(decoded);
          // Set current user
          toastNotify("success", "Cập nhật thông tin thành công");
          dispatch(setCurrentUser(decoded));
        });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  }

  function updateProfile() {
    if (
      emailUpdate != user.email ||
      nameUpdate != user.name ||
      phoneUpdate != user.phone ||
      birthdayUpdate != user.phone ||
      genderUpdate != user.gender ||
      passwordUpdate.length > 0
    ) {
      showConfirmUpdateProfile();
    }
  }

  function addNewAddress() {
    if (!addressName) {
      return toastNotify("warn", "Họ tên không được để trống");
    }
    if (!addressPhone) {
      return toastNotify("warn", "Số điện không được để trống");
    }
    if (!addressAddress) {
      return toastNotify("warn", "Địa chỉ không được để trống");
    }

    axios
      .post("/api/profiles/address", {
        name: addressName,
        phone: addressPhone,
        address: addressAddress,
        isShipDefault: isAddressShipDefault,
        isPaymentDefault: isAddressPaymentDefault,
      })
      .then((res) => {
        getAddresses();
        setCurrentTab("address");
        toastNotify("success", "Thêm địa chỉ thành công");
        setAddressName("");
        setAddressPhone("");
        setAddressAddress("");
      })
      .catch((err) => toastNotify("error", "Đã có lỗi xảy ra"));
  }

  function showConfirmUpdateAddress() {
    confirm({
      title: "Bạn chắc chắn muốn thay đổi thông tin?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .put(`/api/profiles/address/${addressUpdate._id}`, {
            name: addressName,
            phone: addressPhone,
            address: addressAddress,
            isShipDefault: isAddressShipDefault,
            isPaymentDefault: isAddressPaymentDefault,
          })
          .then((res) => {
            getAddresses();
            setCurrentTab("address");
            toastNotify("success", "Cập nhật địa chỉ thành công");
            setAddressName("");
            setAddressPhone("");
            setAddressAddress("");
          })
          .catch((err) => toastNotify("error", "Đã có lỗi xảy ra"));
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  }

  function updateAddress() {
    if (!addressName) {
      return toastNotify("warn", "Họ tên không được để trống");
    }
    if (!addressPhone) {
      return toastNotify("warn", "Số điện không được để trống");
    }
    if (!addressAddress) {
      return toastNotify("warn", "Địa chỉ không được để trống");
    }

    if (
      addressName != addressUpdate.name ||
      addressPhone != addressUpdate.phone ||
      addressAddress != addressUpdate.address ||
      isAddressPaymentDefault != addressUpdate.isPaymentDefault ||
      isAddressShipDefault != addressUpdate.isShipDefault
    ) {
      showConfirmUpdateAddress();
    }
  }

  function deleteAddress(id) {
    axios
      .delete(`/api/profiles/address/${id}`)
      .then((res) => setAddresses(addresses.filter((e) => e._id != id)))
      .catch((err) => toastNotify("error", "Đã có lỗi xảy ra"));
  }

  const handleChangePassword = () => {
    if (newPassword) {
      axios
        .post("/api/users/change-password", { password: newPassword })
        .then((res) => {
          toastNotify(
            "success",
            "Đổi mật khẩu thành công. Vui lòng đăng nhập lại"
          );
          setTimeout(() => dispatch(logout()), 2000);
        })
        .catch((err) => console.log(err));
    } else toastNotify("warn", "Hãy nhập mật khẩu mới");
  };

  return (
    <>
      <Modal
        style={{ top: "20px" }}
        title={"Đổi mật khẩu"}
        visible={isVisible}
        maskClosable={false}
        footer={null}
        width="25%"
        onCancel={() => {
          setIsVisible(false);
        }}
      >
        <form className="w-full m-auto" style={{ fontSize: "14px" }}>
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="name"
              >
                Mật khẩu mới
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="name"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="md:flex md:items-center">
            <div className="md:w-1/3">
              <button
                className="shadow bg-teal-400 hover:bg-teal-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-8 rounded"
                type="button"
                onClick={() => handleChangePassword()}
              >
                OK
              </button>
            </div>
            <div className="md:w-2/3" />
          </div>
        </form>
      </Modal>
      <button
        type="button"
        className="navbar-toggle side-nav-toggle collapsed"
        data-toggle="slide-collapse"
        data-target=".side-nav"
      >
        <span className="icon-bar" />
        <span className="icon-bar" />
        <span className="icon-bar" />
      </button>
      <div className="container account-main">
        {user && (
          <div className="row">
            <nav className="side-nav">
              <div className="user-top-wrap">
                <div className="user-top">
                  <img src="img/feedback_1.jpg" />
                  <div
                    style={{
                      textAlign: "center",
                      wordWrap: "break-word",
                      whiteSpace: "-moz-pre-wrap",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {user.name}
                  </div>
                </div>
              </div>
              <ul className="nav nav-stacked">
                <li className={currentTab === "general" ? "active" : ""}>
                  <a href="#" onClick={() => setCurrentTab("general")}>
                    Quản lý tài khoản
                  </a>
                </li>
                <li className={currentTab === "account-info" ? "active" : ""}>
                  <a href="#" onClick={() => setCurrentTab("account-info")}>
                    Thông tin cá nhân
                  </a>
                </li>
                <li className={currentTab === "address" ? "active" : ""}>
                  <a href="#" onClick={() => setCurrentTab("address")}>
                    Sổ địa chỉ
                  </a>
                </li>
                <li className={currentTab === "history" ? "active" : ""}>
                  <a href="#" onClick={() => setCurrentTab("history")}>
                    Đơn mua
                  </a>
                </li>
              </ul>
            </nav>
            <div className="tab-content">
              {currentTab === "general" && (
                <div className="tab-pane active">
                  <div className="col-sm-6">
                    <div className="general-info">
                      <h3>Thông tin chung</h3>
                      <p>
                        <i className="fa fa-user-o" /> {user.name}
                      </p>
                      <p>
                        <i className="fa fa-phone" />{" "}
                        {user.phone ? user.phone : "N/A"}
                      </p>
                      <p>
                        <i className="fa fa-envelope-o" /> {user.email}
                      </p>
                      <p>
                        <i className="fa fa-birthday-cake" />{" "}
                        {user.birthday ? user.birthday : "N/A"}
                      </p>
                      <a
                        href="#"
                        className="edit-detail"
                        onClick={() => setCurrentTab("account-info")}
                      >
                        Chi tiết &amp; Chỉnh sửa
                      </a>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="address-info">
                      <h3>Địa chỉ mặc định</h3>
                      <p>
                        <strong>Địa chỉ giao hàng:</strong>
                      </p>
                      {shipAddressesDefault ? (
                        <p>{shipAddressesDefault.address}</p>
                      ) : (
                        <p></p>
                      )}
                      <p>
                        <strong>Địa chỉ thanh toán:</strong>
                      </p>
                      {paymentAddressDefault ? (
                        <p>{paymentAddressDefault.address}</p>
                      ) : (
                        <p></p>
                      )}
                      <a
                        href="#"
                        // data-toggle="tab"
                        className="edit-detail"
                        onClick={() => setCurrentTab("address")}
                      >
                        Chi tiết &amp; Chỉnh sửa
                      </a>
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <div className="recent-orders">
                      <h3>Đơn hàng gần đây</h3>
                      <table>
                        <thead>
                          <tr>
                            <th className="order-no">Mã đơn hàng</th>
                            <th className="order-date">Ngày đặt hàng</th>
                            <th className="order-sum">Tổng tiền</th>
                            <th className="order-status">Tình trạng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders &&
                            orders.slice(0, 5).map((e) => (
                              <tr className="order-item">
                                <td className="order-no">
                                  <a href="order-detail.html">09052017</a>
                                </td>
                                <td className="order-date">
                                  {formatDate(e.createdAt)}
                                </td>
                                <td className="order-sum">
                                  {formatPrice(e.total)}₫
                                </td>
                                {e.status === "pending" ? (
                                  <td className="order-status out-stock">
                                    Đang xử lý
                                  </td>
                                ) : e.status === "packed" ? (
                                  <td className="order-status order-closed">
                                    Đã đóng
                                  </td>
                                ) : e.status === "delivered" ? (
                                  <td className="order-status in-stock">
                                    Đã chuyển đi
                                  </td>
                                ) : e.status === "success" ? (
                                  <td className="order-status in-stock">
                                    Đã chuyển đi
                                  </td>
                                ) : e.status === "cancel" ? (
                                  <td className="order-status order-canceled">
                                    Đã hủy
                                  </td>
                                ) : null}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {currentTab === "account-info" && (
                <div className="tab-pane active" id="account-info">
                  <div className="flex justify-between">
                    <h3>Thông tin cá nhân</h3>
                    <Button type="primary" onClick={() => setIsVisible(true)}>
                      Đổi mật khẩu
                    </Button>
                  </div>
                  <form>
                    <ul>
                      <li>
                        <label htmlFor="email">Email</label>
                        <div className="input-field">
                          <input
                            type="text"
                            name="email"
                            id="email"
                            defaultValue={emailUpdate}
                            onChange={(e) => setEmailUpdate(e.target.value)}
                          />
                        </div>
                      </li>
                      {/* <li>
                        <label htmlFor="password">Mật khẩu</label>
                        <div className="input-field">
                          <input
                            style={{
                              width: "100%",
                              background: "#e7e7e7",
                              border: 0,
                              padding: "10px",
                            }}
                            type="password"
                            name="password_new"
                            id="password"
                            defaultValue="123456789"
                            onChange={(e) => setPasswordUpdate(e.target.value)}
                          />
                        </div>
                      </li> */}
                      <li>
                        <label htmlFor="name">Họ tên</label>
                        <div className="input-field">
                          <input
                            type="text"
                            name="name"
                            id="name"
                            defaultValue={nameUpdate}
                            onChange={(e) => setNameUpdate(e.target.value)}
                          />
                        </div>
                      </li>
                      <li>
                        <label htmlFor="phone">Điện thoại</label>
                        <div className="input-field">
                          <input
                            style={{
                              width: "100%",
                              background: "#e7e7e7",
                              border: 0,
                              padding: "10px",
                            }}
                            type="number"
                            name="phone"
                            id="phone"
                            defaultValue={phoneUpdate}
                            onChange={(e) => setPhoneUpdate(e.target.value)}
                          />
                        </div>
                      </li>
                      <li>
                        <label htmlFor="birthday">Ngày sinh:</label>
                        <div className="input-field">
                          <DatePicker
                            style={{
                              width: "30%",
                            }}
                            defaultValue={
                              birthdayUpdate
                                ? moment(birthdayUpdate, "DD/MM/YYYY")
                                : ""
                            }
                            onChange={(date, dateString) =>
                              setBirthdayUpdate(dateString)
                            }
                            id="birthday"
                            format="DD/MM/YYYY"
                          />
                        </div>
                      </li>
                      <li>
                        <label htmlFor="gender">Giới tính:</label>
                        <div className="input-field radio-field">
                          <input
                            type="radio"
                            className="gender"
                            name="Gender"
                            id="male"
                            value="male"
                            checked={genderUpdate === "male" ? true : false}
                            onChange={() => setGenderUpdate("male")}
                          />
                          <label className="gender" htmlFor="male">
                            Nam
                          </label>
                          <input
                            type="radio"
                            className="gender"
                            name="Gender"
                            id="female"
                            value="female"
                            checked={genderUpdate === "female" ? true : false}
                            onChange={() => setGenderUpdate("female")}
                          />
                          <label className="gender" htmlFor="female">
                            Nữ
                          </label>
                        </div>
                      </li>
                      <li>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            updateProfile();
                          }}
                          className="save-change"
                        >
                          <i className="fa fa-floppy-o" /> Lưu thông tin
                        </button>
                      </li>
                    </ul>
                  </form>
                </div>
              )}
              {currentTab === "address" && (
                <div className="tab-pane active" id="address">
                  <div className="default-address col-xs-12">
                    <h3>Địa chỉ mặc định</h3>
                    <div className="row">
                      <div className="deli-info col-xs-12 col-sm-6">
                        <h4>Địa chỉ giao hàng</h4>
                        {shipAddressesDefault && (
                          <>
                            <p className="add-name">
                              {shipAddressesDefault.name}
                            </p>
                            <p className="add-details">
                              <span className="add-no">
                                {shipAddressesDefault.address}
                              </span>
                              {/* <span className="add-ward">Cát Linh</span>
                                <span className="add-district">Đống Đa</span>
                                <span className="add-city">Hà Nội</span> */}
                            </p>
                            <p className="add-phone">
                              {shipAddressesDefault.phone}
                            </p>
                            {/* <a
                              href="#address-edit"
                              // data-toggle="tab"
                              className="edit-detail"
                              onClick={() => {
                                setAddressUpdate(shipAddressesDefault);
                                setAddressName(shipAddressesDefault.name);
                                setAddressPhone(shipAddressesDefault.phone);
                                setAddressAddress(addressAddress);
                                setIsAddressPaymentDefault(shipAddressesDefault.isPaymentDefault);
                                setIsAddressShipDefault(shipAddressesDefault.isShipDefault);
                                setCurrentTab("edit-address");
                              }}
                            >
                              Chỉnh sửa
                            </a> */}
                          </>
                        )}
                      </div>
                      <div className="payment-info col-xs-12 col-sm-6">
                        <h4>Địa chỉ thanh toán</h4>
                        {paymentAddressDefault && (
                          <>
                            <p className="add-name">
                              {paymentAddressDefault.name}
                            </p>
                            <p className="add-details">
                              <span className="add-no">
                                {paymentAddressDefault.address}
                              </span>
                              {/* <span className="add-ward">Cát Linh</span>
                                <span className="add-district">Đống Đa</span>
                                <span className="add-city">Hà Nội</span> */}
                            </p>
                            <p className="add-phone">
                              {paymentAddressDefault.phone}
                            </p>
                            {/* <a
                              href="#address-edit"
                              data-toggle="tab"
                              className="edit-detail"
                            >
                              Chỉnh sửa
                            </a> */}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="address-list col-xs-12">
                    <h3>Sổ địa chỉ</h3>
                    <div className="row">
                      {addresses &&
                        addresses.map((e) => (
                          <div className="col-xs-12">
                            <div className="add-item">
                              <p className="add-name">{e.name}</p>
                              <span className="default-mark">
                                {e.isShipDefault || e.isPaymentDefault ? (
                                  <>
                                    <i className="fa fa-check-square-o" /> "Địa
                                    chỉ mặc định
                                  </>
                                ) : null}
                              </span>
                              {!e.isShipDefault ? (
                                !e.isPaymentDefault ? (
                                  <button
                                    style={{ cursor: "pointer" }}
                                    onClick={() => deleteAddress(e._id)}
                                    className="add-remove pull-right"
                                    style={{
                                      pointerEvents: "auto",
                                      outline: "none",
                                    }}
                                  >
                                    Xóa
                                  </button>
                                ) : null
                              ) : null}
                              <a
                                href="#"
                                // data-toggle="tab"
                                onClick={() => {
                                  setAddressUpdate(e);
                                  setAddressName(e.name);
                                  setAddressPhone(e.phone);
                                  setAddressAddress(e.address);
                                  setIsAddressPaymentDefault(
                                    e.isPaymentDefault
                                  );
                                  setIsAddressShipDefault(e.isShipDefault);
                                  setCurrentTab("edit-address");
                                }}
                                className="edit-detail pull-right"
                              >
                                Chỉnh sửa
                              </a>
                              <p className="add-details">
                                <span className="add-no">{e.address}</span>
                                {/* <span className="add-ward">Cát Linh</span>
                          <span className="add-district">Đống Đa</span>
                          <span className="add-city">Hà Nội</span> */}
                              </p>
                              <p className="add-phone">{e.phone}</p>
                            </div>
                          </div>
                        ))}

                      <div className="col-xs-12">
                        <div className="address-add">
                          <i className="fa fa-plus-square-o" />
                          <a
                            href="#"
                            onClick={() => setCurrentTab("add-address")}
                          >
                            {" "}
                            Thêm địa chỉ mới
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {currentTab === "history" && (
                <div className="tab-pane active" id="history">
                  <div className="recent-orders">
                    <h3>Lịch sử giao dịch</h3>
                    <div className="history-filter">
                      <strong>Lọc kết quả:</strong>
                      <div className="date-block">
                        <span>Từ ngày: </span>
                        <input
                          onChange={(e) => setStartDate(e.target.value)}
                          type="date"
                          name="start-date"
                        />
                      </div>
                      <div className="date-block">
                        <span>Đến ngày: </span>
                        <input
                          onChange={(e) => setEndDate(e.target.value)}
                          type="date"
                          name="end-date"
                        />
                      </div>
                      <select
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                      >
                        <option value="" selected>
                          Theo tình trạng
                        </option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="delivered">Đã gửi đi</option>
                        <option value="packed">Đà đóng</option>
                        <option value="cancel">Đà hủy</option>
                      </select>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th className="order-no">Mã đơn hàng</th>
                          <th className="order-date">Ngày đặt hàng</th>
                          <th className="order-sum">Tổng tiền</th>
                          <th className="order-status">Tình trạng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders &&
                          orders
                            .filter((e) =>
                              orderStatusFilter
                                ? e.status === orderStatusFilter
                                : true
                            )
                            .filter((e) => {
                              console.log(new Date(e.createdAt).getTime());
                              console.log(new Date(startDate).getTime());
                              return startDate
                                ? new Date(e.createdAt).getTime() >
                                    new Date(startDate).getTime()
                                : true;
                            })
                            .filter((e) =>
                              endDate
                                ? new Date(e.createdAt).getTime() <
                                  new Date(endDate).getTime()
                                : true
                            )
                            .slice(page * 10, page * 10 + 10)
                            .map((e) => (
                              <tr className="order-item">
                                <td className="order-no">
                                  <a href="order-detail.html">09052017</a>
                                </td>
                                <td className="order-date">
                                  {formatDate(e.createdAt)}
                                </td>
                                <td className="order-sum">
                                  {formatPrice(e.total)}₫
                                </td>
                                {e.status === "pending" ? (
                                  <td className="order-status out-stock">
                                    Chờ xử lý
                                  </td>
                                ) : e.status === "packed" ? (
                                  <td className="order-status order-closed">
                                    Đã đóng
                                  </td>
                                ) : e.status === "delivered" ? (
                                  <td className="order-status in-stock">
                                    Đã chuyển đi
                                  </td>
                                ) : e.status === "success" ? (
                                  <td className="order-status in-stock">
                                    Đã chuyển đi
                                  </td>
                                ) : e.status === "cancel" ? (
                                  <td className="order-status order-canceled">
                                    Đã hủy
                                  </td>
                                ) : null}
                              </tr>
                            ))}
                      </tbody>
                    </table>
                    <nav>
                      <div className="pagination">
                        {orders && orders.length > 10 ? (
                          <a className="prev page-no" href="#">
                            <i className="fa fa-long-arrow-left" />
                          </a>
                        ) : null}
                        {orders &&
                          Array(Math.floor(orders.length / 10) + 1)
                            .fill(1)
                            .map((e, index) => (
                              <a
                                href="#"
                                onClick={() => setPage(index)}
                                className={
                                  page === index ? "page-no current" : "page-no"
                                }
                              >
                                {index + 1}
                              </a>
                            ))}

                        {orders && orders.length > 10 ? (
                          <a className="next page-no" href="#">
                            <i className="fa fa-long-arrow-right" />
                          </a>
                        ) : null}
                      </div>
                    </nav>
                  </div>
                </div>
              )}
              {currentTab === "edit-address" && (
                <div
                  className="tab-pane active address-change"
                  id="address-edit"
                >
                  <h3>Sửa địa chỉ</h3>
                  <form>
                    <ul>
                      <li>
                        <label>Họ tên</label>
                        <div className="input-field">
                          <input
                            type="text"
                            name="Name"
                            value={addressName}
                            onChange={(e) => setAddressName(e.target.value)}
                          />
                        </div>
                      </li>
                      <li>
                        <label>Điện thoại</label>
                        <div className="input-field">
                          <input
                            type="text"
                            name="Phone"
                            value={addressPhone}
                            onChange={(e) => setAddressPhone(e.target.value)}
                          />
                        </div>
                      </li>
                      <li>
                        <label>Địa chỉ</label>
                        <div className="input-field">
                          <input
                            type="text"
                            name="Address"
                            value={addressAddress}
                            onChange={(e) => setAddressAddress(e.target.value)}
                          />
                          <div className="check-field">
                            <input
                              type="checkbox"
                              id="default-deli"
                              name="default-deli"
                              checked={isAddressShipDefault}
                              onChange={() =>
                                setIsAddressShipDefault(!isAddressShipDefault)
                              }
                            />
                            <label htmlFor="default-deli">
                              Đặt làm địa chỉ giao hàng mặc định
                            </label>
                          </div>
                          <div className="check-field">
                            <input
                              type="checkbox"
                              id="default-pay"
                              name="default-pay"
                              checked={isAddressPaymentDefault}
                              onChange={() =>
                                setIsAddressPaymentDefault(
                                  !isAddressPaymentDefault
                                )
                              }
                            />
                            <label htmlFor="default-pay">
                              Đặt làm địa chỉ thanh toán mặc định
                            </label>
                          </div>
                        </div>
                      </li>
                      <li>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            updateAddress();
                          }}
                          className="save-change"
                        >
                          <i className="fa fa-floppy-o" /> Lưu
                        </button>
                        <a
                          href="#address"
                          onClick={() => setCurrentTab("address")}
                          className="cancel"
                        >
                          Bỏ qua
                        </a>
                      </li>
                    </ul>
                  </form>
                </div>
              )}
              {currentTab === "add-address" && (
                <div
                  className="tab-pane active address-change"
                  id="address-add"
                >
                  <h3>Thêm địa chỉ</h3>
                  <form>
                    <ul>
                      <li>
                        <label>Họ tên</label>
                        <div className="input-field">
                          <input
                            type="text"
                            name="Name"
                            placeholder="Nhập họ tên"
                            onChange={(e) => setAddressName(e.target.value)}
                          />
                        </div>
                      </li>
                      <li>
                        <label>Điện thoại</label>
                        <div className="input-field">
                          <input
                            style={{
                              width: "100%",
                              background: "#e7e7e7",
                              border: 0,
                              padding: "10px",
                            }}
                            type="number"
                            name="Phone"
                            placeholder="Nhập số điện thoại"
                            onChange={(e) => setAddressPhone(e.target.value)}
                          />
                        </div>
                      </li>
                      <li>
                        <label>Địa chỉ</label>
                        <div className="input-field">
                          <input
                            type="text"
                            name="Address"
                            placeholder="Nhập địa chỉ"
                            onChange={(e) => setAddressAddress(e.target.value)}
                          />
                          <div className="check-field">
                            <input
                              type="checkbox"
                              id="default-deli"
                              name="default-deli"
                              onChange={() =>
                                setIsAddressShipDefault(!isAddressShipDefault)
                              }
                            />
                            <label htmlFor="default-deli">
                              Đặt làm địa chỉ giao hàng mặc định
                            </label>
                          </div>
                          <div className="check-field">
                            <input
                              type="checkbox"
                              id="default-pay"
                              name="default-pay"
                              onChange={() =>
                                setIsAddressPaymentDefault(
                                  !isAddressPaymentDefault
                                )
                              }
                            />
                            <label htmlFor="default-pay">
                              Đặt làm địa chỉ thanh toán mặc định
                            </label>
                          </div>
                        </div>
                      </li>
                      <li>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addNewAddress();
                          }}
                          className="save-change"
                        >
                          <i className="fa fa-floppy-o" /> Lưu
                        </button>
                        <a
                          href="#"
                          onClick={() => setCurrentTab("address")}
                          className="cancel"
                        >
                          Bỏ qua
                        </a>
                      </li>
                    </ul>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Profile;
