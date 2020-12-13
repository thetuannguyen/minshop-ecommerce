import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Menu, Modal } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminAuth from "../components/admin/AdminAuth";
import Banners from "../components/admin/Banners";
import Blogs from "../components/admin/Blogs";
import Brands from "../components/admin/Brands";
import Categories from "../components/admin/Categories";
import Contacts from "../components/admin/Contacts";
import Coupons from "../components/admin/Coupons";
import Dashboard from "../components/admin/Dashboard";
import Discounts from "../components/admin/Discounts";
import Orders from "../components/admin/Orders";
import OrdersCOD from "../components/admin/OrdersCOD";
import OrdersRaw from "../components/admin/OrdersRaw";
import Products from "../components/admin/Products";
import Users from "../components/admin/Users";
import { logout } from "../redux/actions/auth";
import toastNotify from "../utils/toastNotify";

function Admin() {
  const { SubMenu } = Menu;
  const [currentTab, setCurrentTab] = useState("statistical");

  const handleClick = (e) => {
    console.log("click ", e);
    setCurrentTab(e.key);
    setIsAddOrderRaw(false);
  };

  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [isAddOrderRaw, setIsAddOrderRaw] = useState(false);

  // change password state
  const [isVisible, setIsVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [
    isAuthenticated,
    user,
    products,
    brands,
    categories,
    subcategories,
  ] = useSelector(({ auth, products }) => [
    auth.isAuthenticated,
    auth.user,
    products.products,
    products.brands,
    products.categories,
    products.subcategories,
  ]);

  const getData = () => {
    axios
      .get("/api/users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.log(err));

    axios
      .get("/api/orders/all")
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => console.log(err));

    axios
      .get("/api/contacts")
      .then((res) => {
        setContacts(res.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    document.title = "Admin";
  }, []);

  useEffect(() => {
    if (isAuthenticated && user.role === "ROLE_ADMIN") {
      getData();
    }
  }, [isAuthenticated]);

  const deleteContact = (id) => {
    setContacts(contacts.filter((contact) => contact._id != id));
  };

  const addUser = (user) => {
    setUsers([user, ...users]);
  };

  const deleteUser = (id) => {
    setUsers(users.filter((u) => u._id != id));
  };

  const updateUser = (user) => {
    const idx = users.findIndex((e) => e._id === user._id);
    setUsers([
      ...users.slice(0, idx),
      user,
      ...users.slice(idx + 1, users.length),
    ]);
  };

  const handleOnAddOrder = () => {
    setCurrentTab("orders-raw");
    setIsAddOrderRaw(true);
  };

  const addOrder = (order) => {
    setOrders([order, ...orders]);
    setCurrentTab("orders");
  };

  const updateOrders = (order) => {
    const idx = orders.findIndex((e) => e._id === order._id);
    setOrders([
      ...orders.slice(0, idx),
      order,
      ...orders.slice(idx + 1, orders.length),
    ]);
  };

  const deleteOrder = (id) => {
    setOrders(orders.filter((e) => e._id !== id));
  };

  const bodyContainer =
    currentTab === "statistical" ? (
      <Dashboard
        products={products}
        brands={brands}
        users={users}
        contacts={contacts}
        orders={orders}
      />
    ) : currentTab === "users" ? (
      <Users
        users={users.filter((u) => u._id != user.id)}
        addUser={addUser}
        deleteUser={deleteUser}
        updateUser={updateUser}
      />
    ) : currentTab === "products" ? (
      <Products
        products={products}
        brands={brands}
        categories={categories}
        subcategories={subcategories}
        dispatch={dispatch}
      />
    ) : currentTab === "brands" ? (
      <Brands brands={brands} dispatch={dispatch} />
    ) : currentTab === "categories" ? (
      <Categories
        categories={categories}
        subcategories={subcategories}
        dispatch={dispatch}
      />
    ) : currentTab === "contacts" ? (
      <Contacts contacts={contacts} deleteContact={deleteContact} />
    ) : currentTab === "orders" ? (
      <Orders
        orders={orders}
        products={products}
        handleOnAddOrder={handleOnAddOrder}
        updateOrders={updateOrders}
        deleteOrder={deleteOrder}
      />
    ) : currentTab === "orders-raw" ? (
      <OrdersRaw
        orders={orders.filter((e) => e.isCreatedByAdmin)}
        addOrder={addOrder}
        products={products}
        updateOrders={updateOrders}
        deleteOrder={deleteOrder}
        isAddOrderRaw={isAddOrderRaw}
        setIsAddOrderRaw={setIsAddOrderRaw}
      />
    ) : currentTab === "orders-cod" ? (
      <OrdersCOD
        orders={orders.filter(
          (e) => e.orderType === "COD" && !e.isCreatedByAdmin
        )}
        products={products}
        handleOnAddOrder={handleOnAddOrder}
        updateOrders={updateOrders}
        deleteOrder={deleteOrder}
      />
    ) : currentTab === "orders-vnpay" ? (
      <OrdersCOD
        orders={orders.filter(
          (e) => e.orderType === "VNPAY" && !e.isCreatedByAdmin
        )}
        products={products}
        handleOnAddOrder={handleOnAddOrder}
        updateOrders={updateOrders}
        deleteOrder={deleteOrder}
      />
    ) : currentTab === "discounts" ? (
      <Discounts
        brands={brands}
        categories={categories}
        subcategories={subcategories}
      />
    ) : currentTab === "coupons" ? (
      <Coupons />
    ) : currentTab === "banners" ? (
      <Banners />
    ) : currentTab === "blogs" ? (
      <Blogs />
    ) : null;

  const handleChangePassword = () => {
    if (newPassword) {
      axios
        .post("/api/users/change-password", { password: newPassword })
        .then((res) => {
          toastNotify(
            "success",
            "Đổi mật khẩu thành công. Vui lòng đăng nhập lại"
          );
          setTimeout(() => dispatch(logout(true)), 2000);
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
      {isAuthenticated && user.role === "ROLE_ADMIN" ? (
        <div style={{ display: "flex" }}>
          <Menu
            theme="dark"
            onClick={handleClick}
            style={{ width: 256 }}
            defaultOpenKeys={["dashboard"]}
            selectedKeys={[currentTab]}
            mode="inline"
            style={{ minHeight: "100vh", width: "250px", position: "relative" }}
          >
            <h2
              style={{
                textAlign: "center",
                borderBottom: "1px solid #fff",
                color: "#fff",
                padding: "12px 0",
                fontSize: "20px",
              }}
            >
              Hi, ADMIN!
            </h2>
            <SubMenu key="dashboard" icon={<MailOutlined />} title="Dashboard">
              <Menu.Item key="statistical">Thống kê</Menu.Item>
            </SubMenu>
            <SubMenu
              key="users-management"
              icon={<AppstoreOutlined />}
              title="Quản lý người dùng"
            >
              <Menu.Item key="users">Người dùng</Menu.Item>
              <Menu.Item key="contacts">Liên hệ</Menu.Item>
            </SubMenu>
            <SubMenu
              key="products-management"
              icon={<SettingOutlined />}
              title="Quản lý sản phẩm"
            >
              <Menu.Item key="products">Sản phẩm</Menu.Item>
              <Menu.Item key="brands">Thương hiệu</Menu.Item>
              <Menu.Item key="categories">Danh mục</Menu.Item>
            </SubMenu>
            <SubMenu
              key="orders-management"
              icon={<SettingOutlined />}
              title="Quản lý đơn hàng"
            >
              <Menu.Item key="orders">Danh sách đơn hàng</Menu.Item>
              <Menu.Item key="orders-raw">Đơn hàng nháp</Menu.Item>
              <Menu.Item key="orders-cod">Đơn hàng COD</Menu.Item>
              <Menu.Item key="orders-vnpay">Đơn hàng VNPAY</Menu.Item>
            </SubMenu>
            <SubMenu
              key="promotion-management"
              icon={<SettingOutlined />}
              title="Quản lý khuyến mãi"
            >
              <Menu.Item key="discounts">Khuyến mãi</Menu.Item>
              <Menu.Item key="coupons">Mã giảm giá</Menu.Item>
            </SubMenu>
            <SubMenu
              key="blogs-management"
              icon={<SettingOutlined />}
              title="Quản lý blog"
            >
              <Menu.Item key="blogs">Blog</Menu.Item>
            </SubMenu>
            <SubMenu
              key="banners-management"
              icon={<SettingOutlined />}
              title="Quản lý banner"
            >
              <Menu.Item key="banners">Banners</Menu.Item>
            </SubMenu>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "12px 0",
                flexDirection: "column",
              }}
            >
              <Button
                type="primary"
                danger
                onClick={() => dispatch(logout(true))}
              >
                Đăng xuất
              </Button>
              <Button
                type="primary"
                className="mt-4"
                onClick={() => setIsVisible(true)}
              >
                Đổi mật khẩu
              </Button>
            </div>
          </Menu>
          <div className="admin-tab" style={{ flex: 1 }}>
            {bodyContainer}
          </div>
        </div>
      ) : (
        <AdminAuth />
      )}
    </>
  );
}

export default Admin;
