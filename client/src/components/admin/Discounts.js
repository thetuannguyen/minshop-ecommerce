import React, { useState, useEffect } from "react";
import axios from "axios";
import formatPrice from "../../utils/formatPrice";
import { Button, Input, Table, Modal, Radio, DatePicker } from "antd";
import toastNotify from "../../utils/toastNotify";
import moment from "moment";
import { formatDate } from "../../utils/formatDate";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { confirm } = Modal;

function Discounts({ brands, categories, subcategories }) {
  const [discounts, setDiscounts] = useState([]);

  const [isVisible, setIsVisible] = useState(false);

  const [applyFor, setApplyFor] = useState("");
  const [applyId, setApplyId] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("price");
  const [startAt, setStartAt] = useState(moment().format("DD/MM/YYYY"));
  const [endAt, setEndAt] = useState(moment().format("DD/MM/YYYY"));

  const [discountId, setDiscountId] = useState("");
  const [isUpdate, setIsUpdate] = useState(false);

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    axios
      .get("/api/discounts/admin")
      .then((res) => {
        setDiscounts(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleDelete = (id) => {
    confirm({
      title: "Bạn chắc chắn muốn xóa khuyến mãi này?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios.delete(`/api/discounts/${id}`).then((res) => {
          setDiscounts(discounts.filter((e) => e._id != id));
          toastNotify("success", "xóa thành công");
        });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  function resetState() {
    setApplyFor("");
    setApplyId("");
    setDiscount("");
    setDiscountType("price");
    setStartAt(moment().format("DD/MM/YYYY"));
    setEndAt(moment().format("DD/MM/YYYY"));
    setDiscountId("");
    setIsUpdate(false);
  }

  const handleAdd = () => {
    if (!applyFor) return toastNotify("warn", "Chọn loại áp dụng");
    else {
      if (applyFor === "all") {
        if (!discount)
          return toastNotify("warn", "Chi tiết khuyến mãi không được để trống");
        else {
          let data = { applyFor };
          if (startAt) data.startAt = startAt;
          if (endAt) data.endAt = endAt;
          if (discountType === "rate") data.discountRate = discount;
          else if (discountType === "price") data.discountPrice = discount;

          confirm({
            title: "Bạn chắc chắn muốn thêm khuyến mãi này?",
            icon: <ExclamationCircleOutlined />,
            onOk() {
              axios.post("/api/discounts", data).then((res) => {
                resetState();
                setDiscounts([...discounts, res.data]);
                toastNotify("success", "Thêm thành công");
                setIsVisible(false);
              });
            },
            onCancel() {
              console.log("Cancel");
            },
          });
        }
      } else {
        if (!discount)
          return toastNotify("warn", "Chi tiết khuyến mãi không được để trống");
        else {
          if (!applyId)
            return toastNotify("warn", "Chọn loại áp dụng chi tiết");
          else {
            let data = { applyFor, id: applyId };
            if (startAt) data.startAt = startAt;
            if (endAt) data.endAt = endAt;
            if (discountType === "rate") data.discountRate = discount;
            else if (discountType === "price") data.discountPrice = discount;

            confirm({
              title: "Bạn chắc chắn muốn thêm khuyến mãi này?",
              icon: <ExclamationCircleOutlined />,
              onOk() {
                axios.post("/api/discounts", data).then((res) => {
                  resetState();
                  setDiscounts([...discounts, res.data]);
                  toastNotify("success", "Thêm thành công");
                  setIsVisible(false);
                });
              },
              onCancel() {
                console.log("Cancel");
              },
            });
          }
        }
      }
    }
  };

  const showDataUpdate = (record) => {
    console.log(record);
    setApplyFor(record.applyFor);
    setApplyId(
      record.applyFor === "category"
        ? record.category._id
        : record.applyFor === "subcategory"
        ? record.subcategory._id
        : record.applyFor === "brand"
        ? record.brand._id
        : ""
    );
    setDiscount(
      record.discountRate ? record.discountRate + "" : record.discountPrice + ""
    );
    setDiscountType(record.discountRate ? "rate" : "price");
    setStartAt(moment(new Date(record.startAt), "DD/MM/YYYY"));
    setEndAt(record.endAt ? moment(new Date(record.endAt), "DD/MM/YYYY") : "");
    setDiscountId(record._id);
    setIsUpdate(true);
    setIsVisible(true);
  };
  const handleUpdate = () => {
    if (!applyFor) return toastNotify("warn", "Chọn loại áp dụng");
    else {
      if (applyFor === "all") {
        if (!discount)
          return toastNotify("warn", "Chi tiết khuyến mãi không được để trống");
        else {
          let data = { applyFor };
          if (startAt) data.startAt = startAt;
          if (endAt) data.endAt = endAt;
          if (discountType === "rate") data.discountRate = discount;
          else if (discountType === "price") data.discountPrice = discount;

          confirm({
            title: "Bạn chắc chắn muốn cập nhật thông tin khuyến mãi này?",
            icon: <ExclamationCircleOutlined />,
            onOk() {
              axios.put(`/api/discounts/${discountId}`, data).then((res) => {
                let idx = discounts.findIndex((e) => e._id === discountId);
                if (idx >= 0) {
                  resetState();
                  setDiscounts([
                    ...discounts.slice(0, idx),
                    res.data,
                    ...discounts.slice(idx + 1, discounts.length),
                  ]);
                  toastNotify("success", "Cập nhật thành công");
                  setIsVisible(false);
                }
              });
            },
            onCancel() {
              console.log("Cancel");
            },
          });
        }
      } else {
        if (!discount)
          return toastNotify("warn", "Chi tiết khuyến mãi không được để trống");
        else {
          if (!applyId)
            return toastNotify("warn", "Chọn loại áp dụng chi tiết");
          else {
            let data = { applyFor, id: applyId };
            if (startAt) data.startAt = startAt;
            if (endAt) data.endAt = endAt;
            if (discountType === "rate") data.discountRate = discount;
            else if (discountType === "price") data.discountPrice = discount;

            confirm({
              title: "Bạn chắc chắn muốn cập nhật thông tin khuyến mãi này?",
              icon: <ExclamationCircleOutlined />,
              onOk() {
                axios.put(`/api/discounts/${discountId}`, data).then((res) => {
                  let idx = discounts.findIndex((e) => e._id === discountId);
                  if (idx >= 0) {
                    resetState();
                    setDiscounts([
                      ...discounts.slice(0, idx),
                      res.data,
                      ...discounts.slice(idx + 1, discounts.length),
                    ]);
                    toastNotify("success", "Cập nhật thành công");
                    setIsVisible(false);
                  }
                });
              },
              onCancel() {
                console.log("Cancel");
              },
            });
          }
        }
      }
    }
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
    {
      title: "Áp dụng",
      dataIndex: "applyFor",
      key: "applyFor",
      render: (text, record) => {
        if (text === "all") {
          return <div>Tất cả các mặt hàng</div>;
        }
        if (text === "brand" && record.brand) {
          return <div>Thương hiệu</div>;
        }
        if (text === "category" && record.category) {
          return <div>Danh mục</div>;
        }
        if (text === "subcategory" && record.subcategory) {
          return <div>Danh mục phụ</div>;
        }
      },
    },
    {
      title: "Chi tiết áp dụng",
      dataIndex: "apply",
      key: "apply",
      render: (_, record) => {
        if (record.applyFor === "all") {
          return;
        }
        if (record.applyFor === "brand" && record.brand) {
          return <div>{record.brand.name}</div>;
        }
        if (record.applyFor === "category" && record.category) {
          return <div>{record.category.name}</div>;
        }
        if (record.applyFor === "subcategory" && record.subcategory) {
          return <div>{record.subcategory.name}</div>;
        }
      },
    },
    {
      title: "Chi tiết khuyến mãi",
      dataIndex: "discount",
      key: "discount",
      render: (_, record) =>
        record.discountRate ? (
          <div>-{record.discountRate}%</div>
        ) : record.discountPrice ? (
          <div>-{formatPrice(record.discountPrice + "")}₫</div>
        ) : null,
    },
    {
      title: "Bắt đầu",
      dataIndex: "startAt",
      key: "startAt",
      render: (text) => formatDate(text),
    },
    {
      title: "Kết  thúc",
      dataIndex: "endAt",
      key: "endAt",
      render: (text) => text && formatDate(text),
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (text, record) => (
        <div className="flex justify-between">
          <Button onClick={() => showDataUpdate(record)} type="primary">
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => handleDelete(record._id)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  // disable day before today
  function disabledDate(current) {
    // Can not select days before today and today
    return current < moment().endOf("day");
  }

  return (
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
        <Button type="primary" size="large" onClick={() => setIsVisible(true)}>
          Thêm
        </Button>
        <div style={{ display: "flex" }}>
          <Input style={{ marginLeft: "4px" }} placeholder="Tìm kiếm" />
        </div>
      </div>
      <Modal
        style={{ top: "20px" }}
        title={!isUpdate ? "Thêm khuyến mãi" : "Cập nhật khuyến mãi"}
        visible={isVisible}
        maskClosable={false}
        footer={null}
        width="70%"
        onCancel={() => {
          setIsVisible(false);
          resetState();
        }}
      >
        <form className="w-full m-auto" style={{ fontSize: "14px" }}>
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="brand"
              >
                Áp dụng
              </label>
              <div class="relative">
                <select
                  class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="grid-state"
                  onChange={(e) => {
                    setApplyFor(e.target.value);
                    setApplyId("");
                  }}
                  value={applyFor}
                >
                  <option value="" hidden>
                    Chọn loại áp dụng
                  </option>
                  <option value="all">Áp dụng cho tất cả sản phẩm</option>
                  <option value="brand">Áp dụng cho thương hiệu</option>
                  <option value="category">Áp dụng cho danh mục</option>
                  <option value="subcategory">Áp dụng cho danh mục phụ</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    class="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {applyFor === "brand" && brands && brands.length > 0 ? (
            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full px-3">
                <label
                  className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                  htmlFor="brand"
                >
                  Thương hiệu
                </label>
                <div class="relative">
                  <select
                    class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="grid-state"
                    onChange={(e) => setApplyId(e.target.value)}
                    value={applyId}
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands && brands.length > 0
                      ? brands.map((brand) => (
                          <option value={brand._id}>{brand.name}</option>
                        ))
                      : null}
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      class="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {applyFor === "category" && categories && categories.length > 0 ? (
            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full px-3">
                <label
                  className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                  htmlFor="brand"
                >
                  Danh mục
                </label>
                <div class="relative">
                  <select
                    class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="grid-state"
                    onChange={(e) => setApplyId(e.target.value)}
                    value={applyId}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories && categories.length > 0
                      ? categories.map((category) => (
                          <option value={category._id}>{category.name}</option>
                        ))
                      : null}
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      class="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {applyFor === "subcategory" &&
          subcategories &&
          subcategories.length > 0 ? (
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="brand"
              >
                Danh mục phụ
              </label>
              <div class="relative">
                <select
                  class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="grid-state"
                  onChange={(e) => setApplyId(e.target.value)}
                  value={applyId}
                >
                  <option value="">Chọn danh mục phụ</option>
                  {subcategories && subcategories.length > 0
                    ? subcategories.map((sub) => (
                        <option value={sub._id}>{sub.name}</option>
                      ))
                    : null}
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    class="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-1/2 px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="price"
              >
                Hình thức khuyễn mãi
              </label>
              <Radio.Group
                onChange={(e) => setDiscountType(e.target.value)}
                value={discountType}
                className="w-full flex justify-between px-12"
              >
                <Radio value="price">Giá (₫)</Radio>
                <Radio value="rate">Phần trăm (%)</Radio>
              </Radio.Group>
            </div>
            <div className="w-1/2 px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="price"
              >
                Khuyến mãi
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="price"
                type="text"
                min="1"
                value={formatPrice(discount)}
                onChange={(e) => {
                  if (e.target.value.match(/^[0-9]+\,?/) || !e.target.value)
                    setDiscount(e.target.value.split(",").join(""));
                  else
                    return toastNotify("warn", "Bạn chỉ có thể nhập số dương");
                }}
              />
            </div>
          </div>
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-1/2 px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="startAt"
              >
                Bắt đầu
              </label>
              <DatePicker
                // disabledDate={disabledDate}
                style={{
                  width: "100%",
                }}
                value={moment(
                  new Date(moment(startAt, "DD/MM/YYYY").format("YYYY/MM/DD")),
                  "DD/MM/YYYY"
                )}
                onChange={(date, dateString) => setStartAt(dateString)}
                id="startAt"
                format="DD/MM/YYYY"
              />
            </div>
            <div className="w-1/2 px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="endAt"
              >
                Kết thúc
              </label>
              <DatePicker
                // disabledDate={disabledDate}
                style={{
                  width: "100%",
                }}
                value={moment(
                  new Date(moment(endAt, "DD/MM/YYYY").format("YYYY/MM/DD")),
                  "DD/MM/YYYY"
                )}
                onChange={(date, dateString) => setEndAt(dateString)}
                id="endAt"
                format="DD/MM/YYYY"
              />
            </div>
          </div>
          <div className="md:flex md:items-center">
            <div className="md:w-1/3">
              <button
                className="shadow bg-teal-400 hover:bg-teal-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-8 rounded"
                type="button"
                onClick={() => {
                  if (!isUpdate) handleAdd();
                  else handleUpdate();
                }}
              >
                OK
              </button>
            </div>
            <div className="md:w-2/3" />
          </div>
        </form>
      </Modal>

      <Table
        columns={columns}
        dataSource={discounts}
        rowKey={(record) => record._id}
        pagination={pagination}
        onChange={(_pagination, filters, sorter) => setPagination(_pagination)}
        scroll={{ x: "100%" }}
      />
    </>
  );
}

export default Discounts;
