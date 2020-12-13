import { ExclamationCircleOutlined } from "@ant-design/icons";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { Button, DatePicker, Input, Modal, Radio, Table } from "antd";
import axios from "axios";
import parseHTML from "html-react-parser";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { formatDate } from "../../utils/formatDate";
import formatPrice from "../../utils/formatPrice";
import toastNotify from "../../utils/toastNotify";

const { confirm } = Modal;

function Coupons() {
  const [coupons, setCoupons] = useState([]);

  const [isVisible, setIsVisible] = useState(false);

  const [isAutoGenerate, setIsAutoGenerate] = useState(true);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("price");
  const [count, setCount] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState(moment().format("DD/MM/YYYY"));
  const [endAt, setEndAt] = useState(moment().format("DD/MM/YYYY"));

  // for update
  const [couponId, setCouponId] = useState("");
  const [isUpdate, setIsUpdate] = useState(false);

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    axios
      .get("/api/coupons")
      .then((res) => {
        setCoupons(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleDelete = (id) => {
    confirm({
      title: "Bạn chắc chắn muốn xóa mã giảm giá này?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .delete(`/api/coupons/${id}`)
          .then((res) => {
            setCoupons(coupons.filter((e) => e._id != id));
            toastNotify("success", "Xóa thành công");
          })
          .catch((err) => {
            console.log(err);
          });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  function resetState() {
    setCode("");
    setDiscount("");
    setDiscountType("price");
    setCount("");
    setDescription("");
    setStartAt(moment().format("DD/MM/YYYY"));
    setEndAt(moment().format("DD/MM/YYYY"));
    setIsUpdate(false);
  }

  const handleAdd = () => {
    if (!isAutoGenerate && !code)
      return toastNotify("warn", "Tên mã giảm giá không được để trống");
    else if (!discount)
      return toastNotify(
        "warn",
        "Giá hay phần trăm giảm giá không được để trống"
      );
    else if (!count) return toastNotify("warn", "Số lượng không được để trống");
    else if (!description)
      return toastNotify("warn", "Mô tả không được để trống");
    else {
      let data = {
        code,
        discount,
        usableCount: count,
        description,
        isAutoGenerate,
      };
      if (startAt) data.startAt = startAt;
      if (endAt) data.endAt = endAt;
      if (discountType === "rate") data.discountRate = discount;
      else if (discountType === "price") data.discountPrice = discount;

      confirm({
        title: "Bạn chắc chắn muốn thêm mã giảm giá này?",
        icon: <ExclamationCircleOutlined />,
        onOk() {
          axios
            .post("/api/coupons", data)
            .then((res) => {
              resetState();
              setIsVisible(false);
              setCoupons([...coupons, res.data]);
              toastNotify("success", "Thêm thành công");
            })
            .catch((err) => {
              if (err.response.data.code)
                return toastNotify("error", "Đã tồn tại mã code");
              toastNotify("error", "Đã có lỗi xảy ra");
            });
        },
        onCancel() {
          console.log("Cancel");
        },
      });
    }
  };

  const showDataUpdate = (record) => {
    setIsAutoGenerate(false);
    setCode(record.code);
    setDiscount(
      record.discountRate ? record.discountRate + "" : record.discountPrice + ""
    );
    setDiscountType(record.discountRate ? "rate" : "price");
    setCount(record.usableCount);
    setDescription(record.description);
    setStartAt(
      record.startAt ? moment(new Date(record.startAt), "DD/MM/YYYY") : ""
    );
    setEndAt(record.endAt ? moment(new Date(record.endAt), "DD/MM/YYYY") : "");
    setCouponId(record._id);
    setIsUpdate(true);
    setIsVisible(true);
  };
  const handleUpdate = () => {
    if (!isAutoGenerate && !code)
      return toastNotify("warn", "Tên mã giảm giá không được để trống");
    else if (!discount)
      return toastNotify(
        "warn",
        "Giá hay phần trăm giảm giá không được để trống"
      );
    else if (!count) return toastNotify("warn", "Số lượng không được để trống");
    else if (!description)
      return toastNotify("warn", "Mô tả không được để trống");
    else {
      let data = {
        code,
        discount,
        usableCount: count,
        description,
        isAutoGenerate,
      };
      if (startAt) data.startAt = startAt;
      if (endAt) data.endAt = endAt;
      if (discountType === "rate") data.discountRate = discount;
      else if (discountType === "price") data.discountPrice = discount;

      confirm({
        title: "Bạn chắc chắn muốn thêm mã giảm giá này?",
        icon: <ExclamationCircleOutlined />,
        onOk() {
          axios
            .put(`/api/coupons/${couponId}`, data)
            .then((res) => {
              let idx = coupons.findIndex((e) => e._id === couponId);
              if (idx >= 0) {
                resetState();
                setCoupons([
                  ...coupons.slice(0, idx),
                  res.data,
                  ...coupons.slice(idx + 1, coupons.length),
                ]);
                toastNotify("success", "Cập nhật thành công");
                setIsVisible(false);
              }
            })
            .catch((err) => {
              if (err.response.data.code)
                return toastNotify("error", "Đã tồn tại mã code");
              toastNotify("error", "Đã có lỗi xảy ra");
            });
        },
        onCancel() {
          console.log("Cancel");
        },
      });
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
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Giá hay phần trăm giảm giá",
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
      title: "Số lượng dùng được",
      dataIndex: "usableCount",
      key: "usableCount",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => parseHTML(text),
    },
    {
      title: "Bắt đầu",
      dataIndex: "startAt",
      key: "startAt",
      render: (text) => formatDate(text),
    },
    {
      title: "Kết  đầu",
      dataIndex: "endAt",
      key: "endAt",
      render: (text) => text && formatDate(text),
    },
    // { title: "Bắt đầu", dataIndex: "startAt", key: "startAt" },
    // { title: "Bắt đầu", dataIndex: "endAt", key: "endAt" },
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
        title="Mã khuyễn mãi"
        visible={isVisible}
        maskClosable={false}
        footer={null}
        width="70%"
        onCancel={() => {
          setIsVisible(false);
          // resetState();
        }}
      >
        <form className="w-full m-auto" style={{ fontSize: "14px" }}>
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="price"
              >
                Tùy chỉnh mã
              </label>
              <Radio.Group
                class="w-full"
                value={isAutoGenerate}
                onChange={(e) => setIsAutoGenerate(e.target.value)}
              >
                <Radio value={true}>Tự động tạo mã</Radio>
                <Radio value={false}>Tùy chỉnh tên mã</Radio>
              </Radio.Group>
            </div>
          </div>
          {!isAutoGenerate && (
            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full px-3">
                <label
                  className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                  htmlFor="price"
                >
                  Tên mã giảm giá
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="price"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-1/3 px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="price"
              >
                Hình thức khuyễn mãi
              </label>
              <Radio.Group
                onChange={(e) => setDiscountType(e.target.value)}
                value={discountType}
              >
                <Radio value="price">Giá (₫)</Radio>
                <Radio value="rate">Phần trăm (%)</Radio>
              </Radio.Group>
            </div>
            <div className="w-2/3 px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="price"
              >
                Giá hay phần trăm giảm giá
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="price"
                type="text"
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
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="price"
              >
                Số lượng
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="price"
                type="number"
                min="1"
                value={count}
                onChange={(e) => {
                  if (!e.target.value.includes("-")) setCount(e.target.value);
                  else toastNotify("warn", "Bạn chỉ có thể nhập số dương");
                }}
              />
            </div>
          </div>
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="price"
              >
                Mô tả
              </label>
              <CKEditor
                editor={ClassicEditor}
                data={description}
                onReady={(editor) => {
                  // You can store the "editor" and use when it is needed.
                  console.log("Editor is ready to use!", editor);
                }}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setDescription(data);
                  console.log({ event, editor, data });
                }}
                onBlur={(event, editor) => {
                  console.log("Blur.", editor);
                }}
                onFocus={(event, editor) => {
                  console.log("Focus.", editor);
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
        dataSource={coupons}
        rowKey={(record) => record._id}
        pagination={pagination}
        onChange={(_pagination, filters, sorter) => setPagination(_pagination)}
        scroll={{ x: "100%" }}
      />
    </>
  );
}

export default Coupons;
