import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Select, Radio, Steps, Modal } from "antd";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import ReactToPrint, { useReactToPrint } from "react-to-print";

import { formatDate } from "../../utils/formatDate";
import formatPrice from "../../utils/formatPrice";
import toastNotify from "../../utils/toastNotify";

const { Step } = Steps;
const { confirm } = Modal;
const { Option } = Select;

function OrderDetail({
  products,
  orderSelected,
  setOrderSelected,
  updateOrders,
  handleDeleteOrder,
}) {
  // print order
  const printRef = useRef();
  const [isShow, setIsShow] = useState(false);

  const [currentOrder, setCurrentOrder] = useState({});

  const [productsSelected, setProductsSelected] = useState([]);
  const [_productsSelected, _setProductsSelected] = useState([]);
  const [searchName, setSearchName] = useState("");

  const [isPaid, setIsPaid] = useState(false);
  const [status, setStatus] = useState("pending");
  const [shipType, setShipType] = useState("standard");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const [histories, setHistories] = useState([]);

  function getProductById(id) {
    return products.find((e) => e._id === id);
  }

  useEffect(() => {
    if (orderSelected) {
      setCurrentOrder(orderSelected);
      _setProductsSelected([
        ...orderSelected.products.map((e) => ({
          productId: e.productId._id,
          amount: e.amount,
        })),
      ]);
      setProductsSelected([
        ...orderSelected.products.map((e) => getProductById(e.productId._id)),
      ]);

      setShipType(orderSelected.shipType);
      setIsPaid(orderSelected.isPaid);
      setStatus(orderSelected.status);
      setName(orderSelected.name);
      setPhone(orderSelected.phone);
      setAddress(orderSelected.address);
      setNote(orderSelected.note);
    }
  }, [orderSelected]);

  useEffect(() => {
    if (orderSelected)
      axios
        .get(`/api/orders/${orderSelected._id}/histories`)
        .then((res) => setHistories(res.data))
        .catch((err) => console.log(err));
  }, [orderSelected]);

  async function handleAddProductsSelected(value) {
    let product = products.find((product) => product._id === value);
    let _product = productsSelected.find((product) => product._id === value);
    if (product && !_product) {
      await _setProductsSelected([
        { productId: product._id, amount: 1 },
        ..._productsSelected,
      ]);

      await setProductsSelected([product, ...productsSelected]);

      setSearchName("");
    }
  }

  function onBlur() {
    console.log("blur");
  }

  function onFocus() {
    console.log("focus");
  }

  function onSearch(val) {
    setSearchName(val);
  }

  function getAmountOfProductSelected(id) {
    let product = _productsSelected.find((e) => e.productId === id);
    // alert(product.amount);
    return product ? product.amount : null;
  }

  function handleUpdateAmountOfProductSelected(id, amount) {
    let idx = _productsSelected.findIndex((e) => e.productId === id);
    // alert(product.amount);
    // console.log(idx);
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

  function updateOrderDetail(id) {
    if (!name) return toastNotify("warn", "Họ tên không được để trống");
    if (!phone) return toastNotify("warn", "Điện thoại không được để trống");
    if (!address) return toastNotify("warn", "Địa chỉ không được để trống");
    if (_productsSelected.length === 0)
      return toastNotify("warn", "Chọn sản phẩm cho đơn hàng");
    // if (shipType) return toastNotify("warn", "Hãy chọn hình thức vận chuyển");

    confirm({
      title: "Bạn chắc chắn muốn cập nhật thông tin đơn hàng này này?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .put(`/api/orders/${orderSelected._id}`, {
            products: _productsSelected,
            name,
            phone,
            address,
            note,
            isPaid,
            status,
            shipType,
            total: getTotalPrice() + (shipType === "fast" ? 40000 : 0),
          })
          .then((res) => {
            setHistories([res.data.history, ...histories]);
            updateOrders(res.data.order);
            toastNotify("success", "Cập nhật thành công");
            setOrderSelected("");
          })
          .catch((err) => {
            if (err.response && err.response.data) {
              return toastNotify("warn", Object.values(err.response.data)[0]);
            }
            toastNotify("error", "Đã có lỗi xảy ra. Vui lòng thử lại");
          });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  }

  function deleteOrder() {
    axios
      .delete(`/api/orders/${orderSelected._id}`)
      .then((res) => {
        toastNotify("success", "Xóa đơn hàng nháp thành công");
        handleDeleteOrder(orderSelected._id);
      })
      .catch((err) =>
        toastNotify("error", "Đã có lỗi xảy ra. Không thể xóa đơn hàng")
      );
  }

  return (
    <>
      <Modal
        style={{ top: "20px" }}
        title="In hóa đơn"
        visible={isShow}
        maskClosable={false}
        footer={null}
        width="70%"
        onCancel={() => {
          setIsShow(false);
          // resetState();
        }}
      >
        <form className="w-full m-auto" style={{ fontSize: "14px" }}>
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <ComponentToPrint ref={printRef} order={orderSelected} />
            </div>
          </div>
          <div className="md:flex md:items-center">
            <div className="md:w-1/3">
              <ReactToPrint
                trigger={() => (
                  <button className="shadow bg-teal-400 hover:bg-teal-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-8 rounded">
                    OK
                  </button>
                )}
                content={() => printRef.current}
              />
            </div>
            <div className="md:w-2/3" />
          </div>
        </form>
      </Modal>
      <div className="text-3xl">
        <div className="flex justify-between">
          <div>
            <Button
              type="primary"
              onClick={() => setOrderSelected("")}
              size="large"
              className="mr-4"
            >
              Back
            </Button>

            <Button type="primary" onClick={() => setIsShow(true)} size="large">
              In hóa đơn
            </Button>
          </div>
          {orderSelected.isCreatedByAdmin && (
            <Button
              type="primary"
              danger
              size="large"
              onClick={() => deleteOrder()}
            >
              Xóa đơn hàng nháp
            </Button>
          )}
        </div>
        <div className="flex mt-4">
          <div className="w-2/3 bg-white mr-8 px-10 py-6">
            <div>
              {currentOrder.isCreatedByAdmin
                ? "Chi tiết đơn hàng nháp"
                : "Chi tiết đơn hàng"}
            </div>
            {productsSelected.length > 0 &&
              productsSelected.map((product) => (
                <div className="my-4 flex justify-between">
                  <div className="w-1/2 flex justify-start">
                    <img
                      className="h-24"
                      src={`/images/${product.images[0]}`}
                      alt=""
                    />
                    <div className="ml-4">{product.name}</div>
                  </div>
                  <div className="w-1/2 flex text-right my-auto pl-24">
                    <div className="">{formatPrice(product.price)}₫</div>
                    <div className="mx-2"> x </div>
                    <input
                      className="flex-1 mx-4 pl-4 w-4 border border-gray-600"
                      type="number"
                      defaultValue={1}
                      min={1}
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
                      disabled={!currentOrder.isCreatedByAdmin}
                    />
                    <span className="">
                      {formatPrice(
                        product.price * getAmountOfProductSelected(product._id)
                      )}
                      ₫
                    </span>
                  </div>
                </div>
              ))}

            {currentOrder.isCreatedByAdmin && (
              <Select
                showSearch
                placeholder="Tìm kiếm sản phẩm"
                className="my-4 w-full"
                value={null}
                onChange={(val) => handleAddProductsSelected(val)}
                onSearch={onSearch}
              >
                {products && products.length > 0 ? (
                  products
                    .filter((e) => !e.isDeleted)
                    // .filter((product) =>
                    //   new RegExp(searchName, "gi").test(product.name)
                    // )
                    .map((product) => (
                      <div value={product._id}>
                        <div className="flex justify-between">
                          <div className="w-1/2 flex justify-start">
                            <img
                              className="h-24"
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
                    ))
                ) : (
                  <Option value="">Chưa có sản phẩm nào</Option>
                )}
              </Select>
            )}
            <div className="mt-6 mb-4">Tình trạng thanh toán</div>
            <Radio.Group onChange={() => setIsPaid(!isPaid)} value={isPaid}>
              <Radio value={true}>Đã thanh toán</Radio>
              <Radio
                disabled={currentOrder.isPaid ? true : false}
                value={false}
              >
                Chưa thanh toán
              </Radio>
            </Radio.Group>
            <div className="mt-6 mb-4">Tình trạng đơn hàng</div>
            <Radio.Group
              onChange={(e) => setStatus(e.target.value)}
              value={status}
            >
              <Radio
                disabled={currentOrder.status !== "pending" ? true : false}
                value="pending"
              >
                Đang xử lý
              </Radio>
              <Radio
                disabled={
                  currentOrder.status !== "pending" &&
                  currentOrder.status !== "packed"
                    ? true
                    : false
                }
                value="packed"
              >
                Đã đóng gói
              </Radio>
              <Radio
                disabled={
                  currentOrder.status !== "pending" &&
                  currentOrder.status !== "packed" &&
                  currentOrder.status !== "delivered"
                    ? true
                    : false
                }
                value="delivered"
              >
                Đã chuyển hàng
              </Radio>
              <Radio
                disabled={
                  currentOrder.status !== "pending" &&
                  currentOrder.status !== "packed" &&
                  currentOrder.status !== "delivered" &&
                  currentOrder.status !== "success"
                    ? true
                    : false
                }
                value="success"
              >
                Đã hoàn thành
              </Radio>
              <Radio value="cancel">Đã hủy</Radio>
            </Radio.Group>
            <div className="my-4 text-right">
              <div className="flex w-full text-right">
                <div className="w-1/2">
                  <div>Tạm tính</div>
                  {/* <div>Khuyến mãi</div> */}
                  <div className="my-2">Phương thức vận chuyển</div>
                  <div>Tổng cộng</div>
                </div>
                <div className="w-1/2">
                  <div>{formatPrice(getTotalPrice())}₫</div>
                  {/* <div>KM</div> */}
                  <div>
                    <Select
                      value={shipType}
                      style={{ width: "50%" }}
                      onChange={(value) => setShipType(value)}
                      disabled={currentOrder.isCreatedByAdmin ? false : true}
                    >
                      <Option value="standard">Giao hàng tiêu chuẩn</Option>
                      <Option value="fast">Giao hàng nhanh</Option>
                    </Select>
                  </div>
                  <div>
                    {formatPrice(
                      getTotalPrice() + +(shipType === "fast" ? 40000 : 0)
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
              readOnly={currentOrder.isCreatedByAdmin ? false : true}
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
              readOnly={currentOrder.isCreatedByAdmin ? false : true}
            />

            <input
              type="text"
              className="form-control my-4"
              id="address"
              placeholder="Địa chỉ"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              readOnly={currentOrder.isCreatedByAdmin ? false : true}
            />
            <input
              type="text"
              className="form-control my-4"
              id="note"
              placeholder="Ghi chú"
              onChange={(e) => setNote(e.target.value)}
              value={note}
              readOnly={currentOrder.isCreatedByAdmin ? false : true}
            />
          </div>
        </div>
        <div className="flex my-4">
          <Button
            className="ml-auto"
            type="primary"
            size="large"
            onClick={() => updateOrderDetail()}
          >
            Lưu
          </Button>
        </div>
        <div className="bg-white px-10 py-6 mb-8">
          {histories && (
            <Steps progressDot current={histories.length} direction="vertical">
              {histories.map((e) => (
                <Step
                  title={e.name}
                  subTitle={formatDate(e.createdAt)}
                  description={e.description}
                />
              ))}
            </Steps>
          )}
        </div>
      </div>
    </>
  );
}

const ComponentToPrint = React.forwardRef((props, ref) => {
  const { order } = props;

  function getTotalTmp() {
    return order.products.reduce(
      (acc, e) => acc + e.productId.price * e.amount,
      0
    );
  }

  return (
    <div ref={ref} style={{ fontSize: "20px" }}>
      {order ? (
        <>
          <div style={{ fontSize: "24px", fontWeight: "1000" }}>
            Thông tin người nhận
          </div>
          <div>
            Họ tên: <strong>{order.name}</strong>
          </div>
          <div>
            Địa chỉ: <strong>{order.address}</strong>
          </div>
          <div>
            Số điện thoại: <strong>{order.phone}</strong>
          </div>
          <div>
            Ghi chú: <strong>{order.note}</strong>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "1000" }}>
            Thông tin đơn hàng
          </div>
          <table
            className="table-order-detail"
            style={{
              width: "100%",
              margin: "auto",
              borderCollapse: "collapse",
            }}
          >
            <tr>
              <th>Hàng hóa</th>
              <th>SL</th>
              <th>GIá</th>
            </tr>
            {order.products.map((e) => (
              <tr
                style={{
                  fontSize: "16px",
                  fontStyle: "italic",
                }}
              >
                <td>{e.productId.name}</td>
                <td style={{ width: "10%" }}>{e.amount}</td>
                <td style={{ width: "10%" }}>
                  {formatPrice(e.productId.price)}₫
                </td>
              </tr>
            ))}
          </table>
          <div
            style={{
              fontWeight: "1000",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div>Tạm tính</div>
              <div>Phí ship</div>
              <div>Tổng tiền</div>
            </div>
            <div>
              <div>{formatPrice(getTotalTmp())}₫</div>
              <div>{order.shipType === "fast" ? formatPrice(40000) : 0}₫</div>
              <div>{formatPrice(order.total)}₫</div>
            </div>
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
});

export default OrderDetail;
