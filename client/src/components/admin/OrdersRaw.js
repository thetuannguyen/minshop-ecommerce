import { DownloadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Checkbox, Input, Modal, Select, Table, Tabs, Tag } from "antd";
import axios from "axios";
import * as FileSaver from "file-saver";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { formatDate } from "../../utils/formatDate";
import formatPrice from "../../utils/formatPrice";
import toastNotify from "../../utils/toastNotify";
import OrderDetail from "./OrderDetail";

const fileType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";

const { confirm } = Modal;
const { Option } = Select;
const { TabPane } = Tabs;

function OrdersRaw({
  orders,
  products,
  updateOrders,
  addOrder,
  deleteOrder,
  isAddOrderRaw,
  setIsAddOrderRaw,
}) {
  // tabs orders raw
  const [currentTab, setCurrentTab] = useState("orders-all");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 4 });

  const [paid, setPaid] = useState(false);
  const [unpaid, setUnpaid] = useState(false);
  const [ordersSelected, setOrdersSelected] = useState([]);

  const [orderSelected, setOrderSelected] = useState("");

  function handleChangeTab(key) {
    setCurrentTab(key);
  }

  // add order raw
  const [productsSelected, setProductsSelected] = useState([]);
  const [_productsSelected, _setProductsSelected] = useState([]);
  const [searchName, setSearchName] = useState("");

  const [shipType, setShipType] = useState("standard");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const [searchInput, setSearchInput] = useState("");

  function handleAddProductsSelected(value) {
    let product = products.find((product) => product._id === value);
    let _product = productsSelected.find((product) => product._id === value);
    if (product && !_product) {
      _setProductsSelected([
        { productId: product._id, amount: 1 },
        ..._productsSelected,
      ]);

      setProductsSelected([product, ...productsSelected]);

      setSearchName("");
    }
  }

  function handleDeleteProductSelected(id) {
    _setProductsSelected([
      ..._productsSelected.filter((e) => e.productId !== id),
    ]);

    setProductsSelected([...productsSelected.filter((e) => e._id !== id)]);
  }

  function onBlur() {
    console.log("blur");
  }

  function onFocus() {
    console.log("focus");
  }

  function onSearch(val) {
    setSearchName(val);
    console.log(val);
  }

  function getAmountOfProductSelected(id) {
    let product = _productsSelected.find((e) => e.productId === id);
    return product ? product.amount : null;
  }

  function handleUpdateAmountOfProductSelected(id, amount) {
    let idx = _productsSelected.findIndex((e) => e.productId === id);
    _setProductsSelected([
      ..._productsSelected.slice(0, idx),
      { productId: id, amount: +amount },
      ..._productsSelected.slice(idx + 1, _productsSelected.length),
    ]);
  }

  function getTotalPrice() {
    return productsSelected.reduce(
      (acc, product) =>
        acc + product.price * +getAmountOfProductSelected(product._id),
      0
    );
  }

  function addNewOrder() {
    if (!name) return toastNotify("warn", "Họ tên không được để trống");
    if (!phone) return toastNotify("warn", "Điện thoại không được để trống");
    if (!address) return toastNotify("warn", "Địa chỉ không được để trống");
    if (_productsSelected.length === 0)
      return toastNotify("warn", "Chọn sản phẩm cho đơn hàng");
    // if (shipType) return toastNotify("warn", "Hãy chọn hình thức vận chuyển");

    confirm({
      title: "Bạn chắc chắn muốn thêm đơn hàng nháp này này?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .post("/api/orders/admin/checkout", {
            products: _productsSelected,
            name,
            phone,
            address,
            note,
            shipType,
            total: getTotalPrice() + (shipType === "fast" ? 40000 : 0),
          })
          .then((res) => {
            toastNotify("success", "Thêm đơn hàng thành công");
            setTimeout(() => addOrder(res.data), 1000);
          })
          .catch((err) =>
            toastNotify("error", "Đã có lỗi xảy ra. Vui lòng thử lại sau")
          );
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  }

  const handleDeleteOrder = (id) => {
    deleteOrder(id);
    setOrderSelected("");
  };

  const exportToCSV = (csvData, fileName) => {
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  const handleCancelOrder = (id) => {
    axios
      .get(`/api/orders/${id}/cancel`)
      .then((res) => updateOrders(res.data))
      .catch((err) => console.log(err));
  };

  const columns = [
    {
      title: "STT",
      width: 60,
      dataIndex: "stt",
      key: "stt",
      fixed: "left",
      render: (_, __, index) =>
        index + 1 + (pagination.current - 1) * pagination.pageSize,
    },
    // {
    //   title: "Người dùng",
    //   dataIndex: "user",
    //   key: "user",
    //   render: (text) => (
    //     <div style={{ fontWeight: 600 }}>
    //       {text && text.name ? text.name : ""}
    //       <br />
    //       {text && text.email}
    //     </div>
    //   ),
    // },
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
      width: 100,
      fixed: "left",
      render: (text, record) => (
        <a onClick={() => setOrderSelected(record)}>{text}</a>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    { title: "Ghi chú", dataIndex: "note", key: "note" },
    {
      title: "Hình thức vận chuyển",
      dataIndex: "shipType",
      key: "shipType",
      render: (text) => (
        <div>
          {text === "standard"
            ? "Tiêu chuẩn"
            : text === "fast"
            ? "Giao hàng nhanh"
            : null}
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (text) => formatPrice(text),
    },
    {
      title: "Tranh toán",
      dataIndex: "isPaid",
      key: "isPaid",
      render: (text) =>
        text ? (
          <Tag color="#87d068">Đã thanh toán</Tag>
        ) : (
          <Tag color="#ff4d4f">Chưa thanh toán</Tag>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (text) =>
        text === "pending" ? (
          <Tag color="#f50">Đang xử lý</Tag>
        ) : text === "packed" ? (
          <Tag color="#2db7f5">Đã đóng hộp</Tag>
        ) : text === "delivered" ? (
          <Tag color="#108ee9">Đã chuyển hàng</Tag>
        ) : text === "success" ? (
          <Tag color="#87d068">Đã hoàn thành</Tag>
        ) : (
          <Tag color="#ff4d4f">Đã hủy</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 100,
      render: (text, record) => (
        <>
          {record.status !== "cancel" ? (
            <Button
              type="primary"
              danger
              onClick={() => handleCancelOrder(record._id)}
            >
              Hủy
            </Button>
          ) : null}
        </>
      ),
    },
  ];

  return (
    <>
      {isAddOrderRaw ? (
        <div className="text-3xl">
          {/* <div>Đơn hàng nháp</div> */}
          <div className="text-4xl font-semibold">Tạo đơn hàng</div>
          {/* <Button type="primary" onClick={() => setOrderSelected("")} size="large">
        Back
      </Button> */}
          <div className="flex">
            <div className="w-2/3 bg-white mr-8 px-10 py-6">
              <div>Chi tiết đơn hàng</div>
              {productsSelected.length > 0 &&
                productsSelected.map((product) => (
                  <div className="my-4 flex justify-between">
                    <div className="w-1/2 flex justify-start">
                      <img
                        className="h-24 m-0"
                        src={`/images/${product.images[0]}`}
                        alt=""
                      />
                      <div className="ml-4">{product.name}</div>
                    </div>
                    <div className="w-1/2 flex text-right my-auto pl-24">
                      <div className="">{formatPrice(product.price)}₫</div>
                      <div className="mx-2"> x </div>
                      <input
                        className="w-16 mx-4border border-gray-600"
                        type="number"
                        onChange={(e) => {
                          if (!/^[0-9]*$/gi.test(e.target.value))
                            return toastNotify(
                              "warn",
                              "Bạn chỉ có thể nhập số dương"
                            );
                          handleUpdateAmountOfProductSelected(
                            product._id,
                            e.target.value
                          );
                        }}
                        value={getAmountOfProductSelected(product._id)}
                      />
                      <span>
                        {formatPrice(
                          product.price *
                            getAmountOfProductSelected(product._id)
                        )}
                        ₫
                      </span>
                      <button
                        className="ml-auto"
                        onClick={() => handleDeleteProductSelected(product._id)}
                      >
                        <i className="fa fa-trash-o" />
                      </button>
                    </div>
                  </div>
                ))}
              <Select
                showSearch
                placeholder="Tìm kiếm sản phẩm"
                className="my-4 w-full"
                value={null}
                onChange={(val) => handleAddProductsSelected(val)}
                onSearch={onSearch}
                filterOption={(input, option) => {
                  let product = products.find((e) => e._id == option.value);
                  return product
                    ? new RegExp(searchName, "gi").test(product.name)
                    : true;
                }}
              >
                {products && products.length > 0 ? (
                  products
                    .filter((e) => !e.isDeleted)
                    .map((product) => (
                      <Option value={product._id}>
                        <div>
                          <div className="flex justify-between">
                            <div className="w-1/2 flex justify-between">
                              <img
                                className="h-24 m-0"
                                src={`/images/${product.images[0]}`}
                                alt=""
                              />
                              <div className="my-auto ml-4">
                                {product.name.length > 50
                                  ? `${product.name.slice(0, 50)}...`
                                  : product.name}
                              </div>
                            </div>
                            <div className="w-1/2 flex justify-end text-right my-auto pl-24">
                              <span className="flex-1">
                                {product.amount} sản phẩm
                              </span>
                              <span className="flex-1">
                                {formatPrice(product.price)}₫
                              </span>
                            </div>
                          </div>
                        </div>
                      </Option>
                    ))
                ) : (
                  <Option value="">Chưa có sản phẩm nào</Option>
                )}
              </Select>
              <div className="my-4 text-right">
                <div className="flex w-full text-right">
                  <div className="w-1/2">
                    <div>Tạm tính</div>
                    {/* <div>Khuyến mãi</div> */}
                    <div>Phương thức vận chuyển</div>
                    <div>Tổng cộng</div>
                  </div>
                  <div className="w-1/2">
                    <div>{formatPrice(getTotalPrice())}₫</div>
                    {/* <div>KM</div> */}
                    <div className="flex ml-10">
                      <Select
                        value={shipType}
                        style={{ width: "60%" }}
                        onChange={(value) => setShipType(value)}
                      >
                        <Option value="standard">Giao hàng tiêu chuẩn</Option>
                        <Option value="fast">Giao hàng nhanh</Option>
                      </Select>
                      <div className="flex-1">
                        {shipType === "fast" ? formatPrice(40000) + "₫" : "0₫"}
                      </div>
                    </div>
                    <div>
                      {formatPrice(
                        getTotalPrice() + (shipType === "fast" ? 40000 : 0)
                      )}
                      ₫
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-white px-10 py-6">
              <div>Thông tin khách hàng</div>
              <input
                type="text"
                className="form-control my-4"
                id="name"
                placeholder="Họ tên"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
              <input
                type="number"
                min="1"
                className="form-control my-4"
                id="phone"
                placeholder="Số điện thoại"
                onChange={(e) => {
                  if (e.target.value.includes("-")) {
                    setPhone("");
                    return toastNotify("warn", "Bạn không thể nhập số âm");
                  }

                  setPhone(e.target.value);
                }}
                value={phone}
              />

              <input
                type="text"
                className="form-control my-4"
                id="address"
                placeholder="Địa chỉ"
                onChange={(e) => setAddress(e.target.value)}
                value={address}
              />
              <input
                type="text"
                className="form-control my-4"
                id="note"
                placeholder="Ghi chú"
                onChange={(e) => setNote(e.target.value)}
                value={note}
              />
            </div>
          </div>
          <div className="flex my-4">
            <Button
              className="ml-auto"
              type="primary"
              size="large"
              onClick={() => addNewOrder()}
            >
              Lưu
            </Button>
          </div>
        </div>
      ) : (
        <>
          {orderSelected ? (
            <OrderDetail
              products={products}
              orderSelected={orderSelected}
              setOrderSelected={setOrderSelected}
              updateOrders={updateOrders}
              handleDeleteOrder={handleDeleteOrder}
            />
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "8px",
                  borderBottom: "1px solid #999",
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setIsAddOrderRaw(true)}
                >
                  Tạo đơn hàng nháp
                </Button>
                <div style={{ display: "flex" }}>
                  <Button
                    onClick={() =>
                      exportToCSV(orders, `orders ${formatDate(new Date())}`)
                    }
                    type="primary"
                    icon={<DownloadOutlined />}
                    size="large"
                  >
                    Xuất Excel
                  </Button>
                  <Input
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={{ marginLeft: "4px" }}
                    placeholder="Tìm kiếm"
                  />
                </div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-semibold mb-2">
                  Tình trạng thanh toán
                </div>
                <div className="ml-4">
                  <Checkbox onChange={() => setPaid(!paid)} checked={paid}>
                    Đã thanh toán
                  </Checkbox>
                  <Checkbox
                    onChange={() => setUnpaid(!unpaid)}
                    checked={unpaid}
                  >
                    Chưa thanh toán
                  </Checkbox>
                </div>
              </div>
              <Tabs defaultActiveKey={currentTab} onChange={handleChangeTab}>
                <TabPane tab="Tất cả đơn hàng" key="orders-all">
                  <Table
                    columns={columns}
                    dataSource={
                      paid && unpaid
                        ? orders
                            .filter(
                              (order) =>
                                (paid ? order.isPaid : true) ||
                                (unpaid ? !order.isPaid : true)
                            )
                            .filter(
                              (e) =>
                                new RegExp(searchInput, "gi").test(e.name) ||
                                new RegExp(searchInput, "gi").test(e.phone) ||
                                new RegExp(searchInput, "gi").test(e.address)
                            )
                        : paid
                        ? orders
                            .filter((order) => (paid ? order.isPaid : true))
                            .filter(
                              (e) =>
                                new RegExp(searchInput, "gi").test(e.name) ||
                                new RegExp(searchInput, "gi").test(e.phone) ||
                                new RegExp(searchInput, "gi").test(e.address)
                            )
                        : unpaid
                        ? orders
                            .filter((order) => (unpaid ? !order.isPaid : true))
                            .filter(
                              (e) =>
                                new RegExp(searchInput, "gi").test(e.name) ||
                                new RegExp(searchInput, "gi").test(e.phone) ||
                                new RegExp(searchInput, "gi").test(e.address)
                            )
                        : orders.filter(
                            (e) =>
                              new RegExp(searchInput, "gi").test(e.name) ||
                              new RegExp(searchInput, "gi").test(e.phone) ||
                              new RegExp(searchInput, "gi").test(e.address)
                          )
                    }
                    rowKey={(record) => record._id}
                    pagination={pagination}
                    // rowSelection={rowSelection}
                    onChange={(_pagination, filters, sorter) =>
                      setPagination(_pagination)
                    }
                    scroll={{ x: "100%" }}
                  />
                </TabPane>
                <TabPane tab="Đang xử lý" key="orders-pending">
                  <Table
                    columns={columns}
                    dataSource={
                      paid && unpaid
                        ? orders
                            .filter(
                              (order) =>
                                (paid ? order.isPaid : true) ||
                                ((unpaid ? !order.isPaid : true) &&
                                  order.status === "pending")
                            )
                            .filter(
                              (e) =>
                                new RegExp(searchInput, "gi").test(e.name) ||
                                new RegExp(searchInput, "gi").test(e.phone) ||
                                new RegExp(searchInput, "gi").test(e.address)
                            )
                        : paid
                        ? orders
                            .filter(
                              (order) =>
                                (paid ? order.isPaid : true) &&
                                order.status === "pending"
                            )
                            .filter(
                              (e) =>
                                new RegExp(searchInput, "gi").test(e.name) ||
                                new RegExp(searchInput, "gi").test(e.phone) ||
                                new RegExp(searchInput, "gi").test(e.address)
                            )
                        : unpaid
                        ? orders
                            .filter(
                              (order) =>
                                (unpaid ? !order.isPaid : true) &&
                                order.status === "pending"
                            )
                            .filter(
                              (e) =>
                                new RegExp(searchInput, "gi").test(e.name) ||
                                new RegExp(searchInput, "gi").test(e.phone) ||
                                new RegExp(searchInput, "gi").test(e.address)
                            )
                        : orders
                            .filter((order) => order.status === "pending")
                            .filter(
                              (e) =>
                                new RegExp(searchInput, "gi").test(e.name) ||
                                new RegExp(searchInput, "gi").test(e.phone) ||
                                new RegExp(searchInput, "gi").test(e.address)
                            )
                    }
                    rowKey={(record) => record._id}
                    pagination={pagination}
                    // rowSelection={rowSelection}
                    onChange={(_pagination, filters, sorter) =>
                      setPagination(_pagination)
                    }
                    scroll={{ x: "100%" }}
                  />
                </TabPane>
                <TabPane tab="Đã đóng gói" key="orders-packed">
                  <Table
                    columns={columns}
                    dataSource={orders
                      .filter((order) => order.status === "packed")
                      .filter(
                        (e) =>
                          new RegExp(searchInput, "gi").test(e.name) ||
                          new RegExp(searchInput, "gi").test(e.phone) ||
                          new RegExp(searchInput, "gi").test(e.address)
                      )}
                    rowKey={(record) => record._id}
                    pagination={pagination}
                    // rowSelection={rowSelection}
                    onChange={(_pagination, filters, sorter) =>
                      setPagination(_pagination)
                    }
                    scroll={{ x: "100%" }}
                  />
                </TabPane>
                <TabPane tab="Đã giao hàng" key="orders-delivered">
                  <Table
                    columns={columns}
                    dataSource={orders
                      .filter((order) => order.status === "delivered")
                      .filter(
                        (e) =>
                          new RegExp(searchInput, "gi").test(e.name) ||
                          new RegExp(searchInput, "gi").test(e.phone) ||
                          new RegExp(searchInput, "gi").test(e.address)
                      )}
                    rowKey={(record) => record._id}
                    pagination={pagination}
                    // rowSelection={rowSelection}
                    onChange={(_pagination, filters, sorter) =>
                      setPagination(_pagination)
                    }
                    scroll={{ x: "100%" }}
                  />
                </TabPane>
                <TabPane tab="Thành công" key="orders-success">
                  <Table
                    columns={columns}
                    dataSource={orders
                      .filter((order) => order.status === "success")
                      .filter(
                        (e) =>
                          new RegExp(searchInput, "gi").test(e.name) ||
                          new RegExp(searchInput, "gi").test(e.phone) ||
                          new RegExp(searchInput, "gi").test(e.address)
                      )}
                    rowKey={(record) => record._id}
                    pagination={pagination}
                    // rowSelection={rowSelection}
                    onChange={(_pagination, filters, sorter) =>
                      setPagination(_pagination)
                    }
                    scroll={{ x: "100%" }}
                  />
                </TabPane>
                <TabPane tab="Bị hủy" key="orders-cancel">
                  <Table
                    columns={columns}
                    dataSource={orders
                      .filter((order) => order.status === "cancel")
                      .filter(
                        (e) =>
                          new RegExp(searchInput, "gi").test(e.name) ||
                          new RegExp(searchInput, "gi").test(e.phone) ||
                          new RegExp(searchInput, "gi").test(e.address)
                      )}
                    rowKey={(record) => record._id}
                    pagination={pagination}
                    // rowSelection={rowSelection}
                    onChange={(_pagination, filters, sorter) =>
                      setPagination(_pagination)
                    }
                    scroll={{ x: "100%" }}
                  />
                </TabPane>
              </Tabs>
            </>
          )}
        </>
      )}
    </>
  );
}

export default OrdersRaw;
