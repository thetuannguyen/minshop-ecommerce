import { ExclamationCircleOutlined } from "@ant-design/icons";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { Button, Input, Modal, Table, Tabs } from "antd";
import axios from "axios";
import parseHTML from "html-react-parser";
import React, { useState } from "react";
import {
  addCategory,
  addSubcategory,
  deleteCategory,
  deleteSubcategory,
  updateCategory,
  updateSubcategory,
} from "../../redux/actions/products";
import toastNotify from "../../utils/toastNotify";

const { confirm } = Modal;
const { TabPane } = Tabs;

function Categories({ categories, subcategories, dispatch }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState("categories");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isUpdate, setIsUpdate] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [categoryIdSelected, setCategoryIdSelected] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 6 });

  function callback(key) {
    setCurrentTab(key);
  }

  const handleAddCategory = () => {
    if (!name.trim()) {
      return toastNotify("warn", "Tên không được để trống");
    }

    if (!description.trim()) {
      return toastNotify("warn", "Mô tả không được để trống");
    }

    if (currentTab == "categories") {
      confirm({
        title: "Bạn chắc chắn muốn thêm danh mục này?",
        icon: <ExclamationCircleOutlined />,
        onOk() {
          axios
            .post("/api/categories", { name, description })
            .then((res) => {
              toastNotify("success", "Thêm danh mục thành công");
              setIsVisible(false);
              dispatch(addCategory(res.data));
              resetState();
            })
            .catch((err) => {
              const { errors } = err.response.data;
              if (typeof errors !== "undefined" && errors.length > 0) {
                return toastNotify("warn", errors[0].message);
              } else {
                return toastNotify("warn", "Đã có lỗi xảy ra. Hãy thử lại");
              }
            });
        },
        onCancel() {
          console.log("Cancel");
        },
      });
    } else {
      confirm({
        title: "Bạn chắc chắn muốn thêm danh mục phụ này?",
        icon: <ExclamationCircleOutlined />,
        onOk() {
          axios
            .post("/api/subcategories", {
              name,
              description,
              categoryId: categoryIdSelected,
            })
            .then((res) => {
              toastNotify("success", "Thêm danh mục phụ thành công");
              setIsVisible(false);
              dispatch(addSubcategory(res.data));
              resetState();
            })
            .catch((err) => {
              const { errors } = err.response.data;
              if (typeof errors !== "undefined" && errors.length > 0) {
                return toastNotify("warn", errors[0].message);
              } else {
                return toastNotify("warn", "Đã có lỗi xảy ra. Hãy thử lại");
              }
            });
        },
        onCancel() {
          console.log("Cancel");
        },
      });
    }
  };

  const handleUpdate = () => {
    if (!name) {
      return toastNotify("warn", "Tên không được để trống");
    }
    if (!description) {
      return alert("Mô tả không được để trống");
    }

    if (currentTab == "categories") {
      confirm({
        title: "Bạn chắc chắn muốn cập nhật thông tin danh mục này?",
        icon: <ExclamationCircleOutlined />,
        onOk() {
          axios
            .put(`/api/categories/${categoryId}`, { name, description })
            .then((res) => {
              toastNotify("success", "Cập nhật thành công");
              setIsVisible(false);
              dispatch(updateCategory(res.data));
              resetState();
            })
            .catch((err) => {
              const { errors } = err.response.data;
              if (typeof errors !== "undefined" && errors.length > 0) {
                return toastNotify("warn", errors[0].message);
              } else {
                return toastNotify("warn", "Đã có lỗi xảy ra. Hãy thử lại");
              }
            });
        },
        onCancel() {
          console.log("Cancel");
        },
      });
    } else {
      confirm({
        title: "Bạn chắc chắn muốn cập nhật thông tin danh mục phụ này?",
        icon: <ExclamationCircleOutlined />,
        onOk() {
          axios
            .put(`/api/subcategories/${categoryId}`, {
              name,
              description,
              categoryId: categoryIdSelected,
            })
            .then((res) => {
              toastNotify("success", "Cập nhật thành công");
              setIsVisible(false);
              dispatch(updateSubcategory(res.data));
              resetState();
            })
            .catch((err) => {
              const { errors } = err.response.data;
              if (typeof errors !== "undefined" && errors.length > 0) {
                return toastNotify("warn", errors[0].message);
              } else {
                return toastNotify("warn", "Đã có lỗi xảy ra. Hãy thử lại");
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
    if (currentTab == "categories") {
      confirm({
        title: "Bạn chắc chắn muốn xóa danh mục này?",
        icon: <ExclamationCircleOutlined />,
        onOk() {
          axios
            .delete(`/api/categories/${id}`)
            .then((res) => {
              dispatch(deleteCategory(id));
              toastNotify("success", "Xóa thành công");
            })
            .catch((err) => {
              const { msg } = err.response.data;
              if (msg) return toastNotify("warn", msg);

              toastNotify("warn", "Có lỗi xảy ra");
            });
        },
        onCancel() {
          console.log("Cancel");
        },
      });
    } else {
      confirm({
        title: "Bạn chắc chắn muốn xóa danh mục phụ này?",
        icon: <ExclamationCircleOutlined />,
        onOk() {
          axios
            .delete(`/api/subcategories/${id}`)
            .then((res) => {
              dispatch(deleteSubcategory(id));
              toastNotify("success", "Xóa thành công");
            })
            .catch((err) => {
              const { msg } = err.response.data;
              if (msg) return toastNotify("warn", msg);

              toastNotify("warn", "Có lỗi xảy ra");
            });
        },
        onCancel() {
          console.log("Cancel");
        },
      });
    }
  };

  const showDataUpdate = (category) => {
    setName(category.name);
    setDescription(category.description);
    if (currentTab === "subcategories") {
      setCategoryIdSelected(category.categoryId._id);
    }
    setCategoryId(category._id);
    setIsUpdate(true);
    setIsVisible(true);
  };

  const resetState = () => {
    setName("");
    setDescription("");
    setCategoryIdSelected("");
    setCategoryId("");
    setIsUpdate(false);
  };

  const categoryColumns = [
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
      title: "Tên danh mục",
      width: 200,
      dataIndex: "name",
      key: "name",
      fixed: "left",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => parseHTML(text),
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

  const subcategoryColumns = [
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
      title: "Tên danh mục",
      width: 200,
      dataIndex: "name",
      key: "name",
      fixed: "left",
    },
    {
      title: "Danh mục chính",
      dataIndex: "categoryId",
      key: "categoryId",
      render: (text) => text.name,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => parseHTML(text),
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

  return (
    <>
      <Modal
        style={{ top: "20px" }}
        title={!isUpdate ? "Thêm danh mục" : "Cập nhật danh mục"}
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
                Name
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
          {currentTab !== "categories" ? (
            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full px-3">
                <label
                  className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                  htmlFor="brand"
                >
                  Category
                </label>
                <div class="relative">
                  <select
                    class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="grid-state"
                    onChange={(e) => setCategoryIdSelected(e.target.value)}
                    value={categoryIdSelected}
                  >
                    <option value="">Chọn danh mục chính</option>
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

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="description"
              >
                Description
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
                  if (!isUpdate) handleAddCategory();
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

      <Tabs defaultActiveKey={currentTab} onChange={callback}>
        <TabPane tab="Danh mục" key="categories">
          <Table
            columns={categoryColumns}
            dataSource={categories.filter((e) =>
              new RegExp(searchInput, "gi").test(e.name)
            )}
            rowKey={(record) => record._id}
            pagination={pagination}
            onChange={(_pagination, filters, sorter) =>
              setPagination(_pagination)
            }
            scroll={{ x: "100%" }}
          />
        </TabPane>
        <TabPane tab="Danh mục phụ" key="subcategories">
          <Table
            columns={subcategoryColumns}
            dataSource={subcategories.filter((e) =>
              new RegExp(searchInput, "gi").test(e.name)
            )}
            rowKey={(record) => record._id}
            pagination={pagination}
            onChange={(_pagination, filters, sorter) =>
              setPagination(_pagination)
            }
            scroll={{ x: "100%" }}
          />
        </TabPane>
      </Tabs>
    </>
  );
}

export default Categories;
