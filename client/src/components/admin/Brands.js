import { ExclamationCircleOutlined } from "@ant-design/icons";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { Button, Input, Modal, Table } from "antd";
import axios from "axios";
import parseHTML from "html-react-parser";
import React, { useEffect, useRef, useState } from "react";
import {
  addBrand,
  deleteBrand,
  updateBrand,
} from "../../redux/actions/products";
import toastNotify from "../../utils/toastNotify";

const { confirm } = Modal;

function Brands({ brands, dispatch }) {
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [isUpdate, setIsUpdate] = useState(false);
  const [brandId, setBrandId] = useState("");
  const [currentBrands, setCurrentBrands] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  const [pagination, setPagination] = useState({ current: 1, pageSize: 4 });

  const fileRef = useRef();

  useEffect(() => {
    setCurrentBrands([...brands]);
  }, [brands]);

  const handleAdd = () => {
    if (!name) {
      return toastNotify("warn", "Tên không được để trống");
    }
    if (!image) {
      return toastNotify("warn", "Hình ảnh không đươc để trống");
    }
    if (!description) {
      return toastNotify("warn", "Mô tả không được để trống");
    }
    let formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", image);

    confirm({
      title: "Bạn chắc chắn muốn thêm thương hiệu này này?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .post("/api/brands", formData)
          .then((res) => {
            toastNotify("success", "Thêm thương hiệu thành công");
            setIsVisible(false);
            dispatch(addBrand(res.data));
            resetState();
          })
          .catch((err) => {
            const { errors } = err.response.data;
            if (typeof errors !== "undefined" && errors.length > 0) {
              return toastNotify("warn", errors[0].message);
            } else {
              return toastNotify("warn", "Đã có lỗi xảy ra");
            }
          });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const handleUpdate = () => {
    if (!name) {
      return alert("Tên không được để trống");
    }
    if (!description) {
      return alert("Mô tả không được để trống");
    }
    let formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);

    if (image) {
      formData.append("image", image);
      confirm({
        title: "Bạn chắc chắn muốn cập nhật thông tin thương hiệu này này?",
        icon: <ExclamationCircleOutlined />,
        onOk() {
          axios
            .put(`/api/brands/${brandId}`, formData)
            .then((res) => {
              setIsVisible(false);
              dispatch(updateBrand(res.data));
              resetState();
              toastNotify("success", "Cập nhật thương hiệu thành công");
            })
            .catch((err) => {
              const { errors } = err.response.data;
              if (typeof errors !== "undefined" && errors.length > 0) {
                return toastNotify("warn", errors[0].message);
              } else {
                return toastNotify("warn", "Đã có lỗi xảy ra");
              }
            });
        },
        onCancel() {
          console.log("Cancel");
        },
      });
    } else {
      confirm({
        title: "Bạn chắc chắn muốn cập nhật thông tin thương hiệu này này?",
        icon: <ExclamationCircleOutlined />,
        onOk() {
          axios
            .put(`/api/brands/${brandId}`, { name, description })
            .then((res) => {
              setIsVisible(false);
              dispatch(updateBrand(res.data));
              resetState();
              toastNotify("success", "Cập nhật thương hiệu thành công");
            })
            .catch((err) => {
              const { errors } = err.response.data;
              if (typeof errors !== "undefined" && errors.length > 0) {
                return toastNotify("warn", errors[0].message);
              } else {
                return toastNotify("warn", "Đã có lỗi xảy ra");
              }
            });
        },
        onCancel() {
          console.log("Cancel");
        },
      });
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: "Bạn chắc chắn muốn xóa thương hiệu này này?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .delete(`/api/brands/${id}`)
          .then((res) => {
            dispatch(deleteBrand(id));
            toastNotify("success", "Xóa thương hiệu thành công");
          })
          .catch((err) => {
            const { msg } = err.response.data;
            if (msg) return toastNotify("warn", msg);

            toastNotify("warn", "Đã có lỗi xảy ra");
          });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const showDataUpdate = (brand) => {
    setName(brand.name);
    setImage(null);
    setDescription(brand.description);
    setBrandId(brand._id);
    setIsUpdate(true);
    setIsVisible(true);
  };

  const resetState = () => {
    setName("");
    setImage(null);
    setDescription("");
    setIsUpdate(false);
    fileRef.current.value = null;
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
      title: "Tên thương hiệu",
      width: 150,
      dataIndex: "name",
      key: "name",
      fixed: "left",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => <div className="max-3-line">{parseHTML(text)}</div>,
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (text) => <img src={`/images/${text}`} alt="image" />,
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

  console.log(brands);

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
          <Input
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ marginLeft: "4px" }}
            placeholder="Tìm kiếm"
          />
        </div>
      </div>
      <Modal
        style={{ top: "20px" }}
        title={!isUpdate ? "Thêm thương hiệu" : "Cập nhật thương hiệu"}
        visible={isVisible}
        maskClosable={false}
        footer={null}
        width="70%"
        onCancel={() => {
          setIsVisible(false);
          resetState();
        }}
      >
        <form className="w-full m-auto">
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="name"
              >
                Tên thương hiệu
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="image"
              >
                Ảnh bìa
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="image"
                name="image"
                type="file"
                ref={fileRef}
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>
          </div>
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="description"
              >
                Mô tả
              </label>
              {/* <textarea
                className=" no-resize appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 h-48 resize-none"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              /> */}
              <CKEditor
                editor={ClassicEditor}
                data={description}
                onReady={(editor) => {
                  // You can store the "editor" and use when it is needed.
                  console.log("Editor is ready to use!", editor);
                }}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  console.log({ event, editor, data });
                  setDescription(data);
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
        dataSource={currentBrands.filter((brand) =>
          new RegExp(searchInput, "gi").test(brand.name)
        )}
        rowKey={(record) => record._id}
        pagination={pagination}
        onChange={(_pagination, filters, sorter) => setPagination(_pagination)}
        scroll={{ x: "100%" }}
      />
    </>
  );
}

export default Brands;
