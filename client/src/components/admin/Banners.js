import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Modal, Table } from "antd";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toastNotify from "../../utils/toastNotify";

const { confirm } = Modal;

function Banners() {
  const [banners, setBanners] = useState([]);

  const [isVisible, setIsVisible] = useState(false);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileRef = useRef();

  const [isUpdate, setIsUpdate] = useState(false);

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    axios
      .get("/api/banners")
      .then((res) => {
        setBanners(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleDelete = (id) => {
    confirm({
      title: "Bạn chắc chắn muốn xóa banner này?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .delete(`/api/banners/${id}`)
          .then((res) => {
            toastNotify("success", "Xóa thành công");
            setBanners(banners.filter((e) => e._id != id));
          })
          .catch((err) => {
            toastNotify("error", "Đã có lỗi xảy ra");
          });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  function resetState() {
    setImage(null);
    setImagePreview("");
    setIsUpdate(false);
    fileRef.current.value = null;
  }

  const handleAdd = () => {
    if (!image) return toastNotify("warn", "Hình ảnh không được để trống");
    else {
      let formData = new FormData();
      formData.append("image", image);

      confirm({
        title: "Bạn chắc chắn muốn thêm banner này?",
        icon: <ExclamationCircleOutlined />,
        onOk() {
          axios
            .post("/api/banners", formData)
            .then((res) => {
              resetState();
              setBanners([res.data, ...banners]);
              toastNotify("success", "Thêm thành công");
              setIsVisible(false);
            })
            .catch((err) => toastNotify("error", "Đã có lỗi xảy ra"));
        },
        onCancel() {
          console.log("Cancel");
        },
      });
    }
  };

  // const handleUpdate = () => {};

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
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (text) => <img src={`/images/${text}`} alt="image" />,
    },

    // { title: "Bắt đầu", dataIndex: "startAt", key: "startAt" },
    // { title: "Bắt đầu", dataIndex: "endAt", key: "endAt" },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 200,
      render: (text, record) => (
        <>
          <Button
            type="primary"
            danger
            onClick={() => handleDelete(record._id)}
          >
            Xóa
          </Button>
        </>
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
                htmlFor="image"
              >
                Hình ảnh
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="image"
                type="file"
                // value={image}
                ref={fileRef}
                onChange={(e) => {
                  if (
                    e.target.files &&
                    e.target.files[0].type.includes("image")
                  ) {
                    setImage(e.target.files[0]);
                    let reader = new FileReader();
                    reader.readAsDataURL(e.target.files[0]);
                    reader.onloadend = () => {
                      setImagePreview(reader.result);
                    };
                  } else
                    return toastNotify("warn", "Bạn vui lòng chọn 1 hình ảnh");
                }}
              />
            </div>
          </div>
          {imagePreview && (
            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full px-3">
                <label
                  className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                  htmlFor="preview"
                >
                  Preview
                </label>
                <img src={imagePreview} alt="" />
              </div>
            </div>
          )}
          <div className="md:flex md:items-center">
            <div className="md:w-1/3">
              <button
                className="shadow bg-teal-400 hover:bg-teal-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-8 rounded"
                type="button"
                onClick={() => {
                  if (!isUpdate) handleAdd();
                  // else handleUpdate();
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
        dataSource={banners}
        rowKey={(record) => record._id}
        pagination={pagination}
        onChange={(_pagination, filters, sorter) => setPagination(_pagination)}
        scroll={{ x: "100%" }}
      />
    </>
  );
}

export default Banners;
