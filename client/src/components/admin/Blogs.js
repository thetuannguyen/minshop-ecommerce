import { ExclamationCircleOutlined } from "@ant-design/icons";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { Button, Modal, Select, Table, Tabs } from "antd";
import axios from "axios";
import parseHTML from "html-react-parser";
import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import toastNotify from "../../utils/toastNotify";

const { confirm } = Modal;

function Blogs() {
  const { Option } = Select;
  const { TabPane } = Tabs;

  const [currentTab, setCurrentTab] = useState("blogs");

  const [blogs, setBlogs] = useState([]);
  const [blogCategories, setBlogCategories] = useState([]);
  const [blogTags, setBlogTags] = useState([]);

  const [isVisible, setIsVisible] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  //add blog category and blog tag
  const [categoryName, setCategoryName] = useState("");
  const [tagName, setTagName] = useState("");
  const [isAddCategory, setIsAddCategory] = useState(false);
  const [isAddTag, setIsAddTag] = useState(false);

  const [title, setTitle] = useState("");
  const [categoryIdSelected, setCategoryIdSelected] = useState("");
  const [tagsSelected, setTagsSelected] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);

  const categoryRef = useRef();
  const tagRef = useRef();
  const fileRef = useRef();

  const [blogId, setBlogId] = useState("");
  const [blogCategoryId, setBlogCategoryId] = useState("");
  const [blogTagId, setBlogTagId] = useState("");

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  function handleChangeTab(key) {
    setCurrentTab(key);
  }

  useEffect(() => {
    axios
      .get("/api/blogs")
      .then((res) => {
        setBlogs(res.data);
      })
      .catch((err) => console.log(err));
    axios
      .get("/api/blogs/categories")
      .then((res) => {
        setBlogCategories(res.data);
      })
      .catch((err) => console.log(err));
    axios
      .get("/api/blogs/tags")
      .then((res) => {
        setBlogTags(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleDelete = (id) => {
    confirm({
      title: "Bạn chắc chắn muốn xóa blog này?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .delete(`/api/blogs/${id}`)
          .then((res) => {
            setBlogs(blogs.filter((e) => e._id != id));
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
    setTitle("");
    setCategoryIdSelected("");
    setTagsSelected([]);
    setContent("");
    setImage(null);
    fileRef.current.value = null;

    setBlogId("");
    setIsUpdate(false);
  }

  const handleAdd = () => {
    if (currentTab === "blogs") {
      if (!title) return toastNotify("warn", "Tiêu đề không được để trống");
      else if (!categoryIdSelected)
        return toastNotify("warn", "Danh mục không được để trống");
      else if (!image)
        return toastNotify("warn", "Ảnh bìa không được để trống");
      else if (!content)
        return toastNotify("warn", "Nội dung không được để trống");
      else {
        let formData = new FormData();

        formData.append("title", title);
        formData.append("category", categoryIdSelected);
        formData.append("cover", image);
        formData.append("content", content);

        if (tagsSelected.length > 0)
          formData.append("tags", JSON.stringify(tagsSelected));

        confirm({
          title: "Bạn chắc chắn muốn thêm blog này?",
          icon: <ExclamationCircleOutlined />,
          onOk() {
            axios
              .post("/api/blogs", formData)
              .then((res) => {
                toastNotify("success", "Thêm blog thành công");
                resetState();
                setIsVisible(false);
                setBlogs([res.data, ...blogs]);
              })
              .catch((err) => toastNotify("error", "Đã có lỗi xảy ra"));
          },
          onCancel() {
            console.log("Cancel");
          },
        });
      }
    } else if (currentTab === "blog-categories") {
      if (!categoryName)
        return toastNotify("warn", "Tên danh mục không được để trống");

      confirm({
        title: "Bạn chắc chắn muốn thêm danh mục blog này?",
        icon: <ExclamationCircleOutlined />,
        onOk() {
          axios
            .post("/api/blogs/categories", { name: categoryName })
            .then((res) => {
              toastNotify("success", "Thêm danh mục blog thành công");
              setCategoryName("");
              setIsVisible(false);
              setBlogCategories([res.data, ...blogCategories]);
            })
            .catch((err) => {
              console.log(err);
              toastNotify("error", "Đã có lỗi xảy ra");
            });
        },
        onCancel() {
          console.log("Cancel");
        },
      });
    } else if (currentTab === "blog-tags") {
      if (!tagName)
        return toastNotify("warn", "Tên blog tag không được để trống");

      confirm({
        title: "Bạn chắc chắn muốn thêm blog tag này?",
        icon: <ExclamationCircleOutlined />,
        onOk() {
          axios
            .post("/api/blogs/tags", { tag: tagName })
            .then((res) => {
              toastNotify("success", "Thêm blog tag thành công");
              setTagName("");
              setIsVisible(false);
              setBlogTags([res.data, ...blogTags]);
            })
            .catch((err) => {
              console.log(err);
              toastNotify("error", "Đã có lỗi xảy ra");
            });
        },
        onCancel() {
          console.log("Cancel");
        },
      });
    }
  };

  const handleUpdate = () => {
    if (currentTab === "blogs") {
      if (!title) return toastNotify("warn", "Tiêu đề không được để trống");
      else if (!categoryIdSelected)
        return toastNotify("warn", "Danh mục không được để trống");
      else if (!content)
        return toastNotify("warn", "Nội dung không được để trống");

      let formData = new FormData();

      formData.append("title", title);
      formData.append("category", categoryIdSelected);
      formData.append("content", content);

      if (tagsSelected.length > 0)
        formData.append("tags", JSON.stringify(tagsSelected));
      if (image) formData.append("cover", image);

      confirm({
        title: "Bạn chắc chắn muốn cập nhật thông tin blog này?",
        icon: <ExclamationCircleOutlined />,
        onOk() {
          axios
            .put(`/api/blogs/${blogId}`, formData)
            .then((res) => {
              setIsVisible(false);
              // dispatch(updateBrand(res.data));
              let _i = _.findIndex(blogs, { _id: res.data._id });
              if (_i > -1)
                setBlogs([
                  ...blogs.slice(0, _i),
                  res.data,
                  ...blogs.slice(_i + 1, blogs.length),
                ]);
              else setBlogs([res.data, ...blogs.slice(0, _i)]);
              resetState();
              toastNotify("success", "Cập nhật thành công");
            })
            .catch((err) => {
              console.log(err);
              toastNotify("error", "Đã có lỗi xảy ra");
            });
        },
        onCancel() {
          console.log("Cancel");
        },
      });
    } else if (currentTab === "blog-categories") {
      if (!categoryName)
        return toastNotify("warn", "Tên danh mục không được để trống");

      confirm({
        title: "Bạn chắc chắn muốn cập nhật thông tin danh mục blog này?",
        icon: <ExclamationCircleOutlined />,
        onOk() {
          axios
            .put(`/api/blogs/categories/${blogCategoryId}`, {
              name: categoryName,
            })
            .then((res) => {
              const idx = blogCategories.findIndex(
                (e) => e._id === blogCategoryId
              );
              setBlogCategories([
                ...blogCategories.slice(0, idx),
                res.data,
                ...blogCategories.slice(idx + 1, blogCategories.length),
              ]);
              setCategoryName("");
              setBlogTagId("");
              setIsUpdate(false);
              setIsVisible(false);
              toastNotify("success", "Cập nhật danh mục blog thành công");
            })
            .catch((err) => toastNotify("error", "Đã có lỗi xảy ra"));
        },
        onCancel() {
          console.log("Cancel");
        },
      });
    } else if (currentTab === "blog-tags") {
      if (!tagName)
        return toastNotify("warn", "Tên danh mục không được để trống");

      confirm({
        title: "Bạn chắc chắn muốn cập nhật thông tin danh mục blog này?",
        icon: <ExclamationCircleOutlined />,
        onOk() {
          axios
            .put(`/api/blogs/tags/${blogTagId}`, { tag: tagName })
            .then((res) => {
              const idx = blogTags.findIndex((e) => e._id === blogTagId);
              setBlogTags([
                ...blogTags.slice(0, idx),
                res.data,
                ...blogTags.slice(idx + 1, blogTags.length),
              ]);
              setTagName("");
              setBlogTagId("");
              setIsUpdate(false);
              setIsVisible(false);
              toastNotify("success", "Cập nhật blog tag thành công");
            })
            .catch((err) => toastNotify("error", "Đã có lỗi xảy ra"));
        },
        onCancel() {
          console.log("Cancel");
        },
      });
    }
  };

  const showDataUpdate = (blog) => {
    setIsVisible(true);
    setTitle(blog.title);
    setCategoryIdSelected(blog.category._id);
    setTagsSelected(blog.tags);
    setContent(blog.content);
    setBlogId(blog._id);
    setIsUpdate(true);
  };

  const blogColumns = [
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
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
      render: (text) => text.name,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (text) => text.name,
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (text) => text.join(", "),
    },

    {
      title: "Ảnh bìa",
      dataIndex: "cover",
      key: "cover",
      render: (text) => <img src={`/images/${text}`} alt="image" />,
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      render: (text) => <div class="max-3-line">{parseHTML(text)}</div>,
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

  const deleteBlogCategory = (id) => {
    axios
      .delete(`/api/blogs/categories/${id}`)
      .then((res) => {
        toastNotify("success", "Xóa danh mục blog thành công");
        setBlogCategories(blogCategories.filter((e) => e._id !== id));
      })
      .catch((err) => {
        if (err.response) {
          return toastNotify("error", Object.values(err.response.data)[0]);
        }
        toastNotify("error", "Đã có lỗi xảy ra");
      });
  };

  const blogCategoryColumns = [
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
      title: "Danh mục",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 200,
      render: (text, record) => (
        <>
          <Button
            onClick={() => {
              setCategoryName(record.name);
              setBlogCategoryId(record._id);
              setIsUpdate(true);
              setIsVisible(true);
            }}
            type="primary"
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => deleteBlogCategory(record._id)}
          >
            Xóa
          </Button>
        </>
      ),
    },
  ];

  const deleteBlogTag = (id) => {
    axios
      .delete(`/api/blogs/tags/${id}`)
      .then((res) => {
        toastNotify("success", "Xóa danh mục blog thành công");
        setBlogTags(blogTags.filter((e) => e._id !== id));
      })
      .catch((err) => {
        if (err.response) {
          return toastNotify("error", Object.values(err.response.data)[0]);
        }
        toastNotify("error", "Đã có lỗi xảy ra");
      });
  };

  const blogTagColumns = [
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
      title: "Tag",
      dataIndex: "tag",
      key: "tag",
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 200,
      render: (text, record) => (
        <>
          <Button
            onClick={() => {
              setTagName(record.tag);
              setBlogTagId(record._id);
              setIsUpdate(true);
              setIsVisible(true);
            }}
            type="primary"
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => deleteBlogTag(record._id)}
          >
            Xóa
          </Button>
        </>
      ),
    },
  ];

  // handle on add tag
  const handleOnAddTag = () => {
    if (tagName) {
      axios
        .post("/api/blogs/tags", { tag: tagName })
        .then((res) => {
          toastNotify("success", "Thêm thành công");
          setBlogTags([...blogTags, res.data]);
          setIsAddTag(false);
          tagRef.current.select();
        })
        .catch((err) => console.log(err));
    }
  };

  return (
    <>
      <Modal
        style={{ top: "20px" }}
        title={!isUpdate ? "Thêm blog mới" : "Cập nhật blog"}
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
          {currentTab === "blogs" && (
            <>
              <div className="flex flex-wrap -mx-3 mb-6">
                <div className="w-full px-3">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                    htmlFor="price"
                  >
                    Tiêu đề
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="price"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>
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
                      className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      id="grid-state"
                      onChange={(e) => setCategoryIdSelected(e.target.value)}
                      value={categoryIdSelected}
                    >
                      <option value="">Chọn danh mục</option>
                      {blogCategories && blogCategories.length > 0
                        ? blogCategories.map((category) => (
                            <option value={category._id}>
                              {category.name}
                            </option>
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
              <div className="flex flex-wrap -mx-3 mb-6">
                <div className="w-full">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                    htmlFor="price"
                  >
                    Tags
                  </label>
                  <div className="flex">
                    <Select
                      mode="multiple"
                      allowClear
                      style={{ width: "100%" }}
                      placeholder="Chọn tag cho blog"
                      onChange={(value) => setTagsSelected(value)}
                      value={tagsSelected}
                      ref={tagRef}
                    >
                      {blogTags &&
                        blogTags.length > 0 &&
                        blogTags.map((tag) => (
                          <Option key={tag._id} value={tag.tag}>
                            {tag.tag}
                          </Option>
                        ))}
                    </Select>
                    <div className="w-1/2 flex justify-start items-center">
                      <Button type="primary" onClick={() => setIsAddTag(true)}>
                        Thêm tag
                      </Button>
                      {isAddTag && (
                        <>
                          <input
                            type="text"
                            className="border border-gray-400 p-1 ml-3"
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                          />
                          <Button
                            type="primary"
                            onClick={() => handleOnAddTag()}
                          >
                            Save
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
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
                    htmlFor="price"
                  >
                    Nội dung
                  </label>
                  <CKEditor
                    editor={ClassicEditor}
                    data={content}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setContent(data);
                      console.log({ event, editor, data });
                    }}
                  />
                </div>
              </div>
            </>
          )}
          {currentTab === "blog-categories" && (
            <>
              <div className="flex flex-wrap -mx-3 mb-6">
                <div className="w-full px-3">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                    htmlFor="price"
                  >
                    Tên danh mục
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="price"
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
          {currentTab === "blog-tags" && (
            <>
              <div className="flex flex-wrap -mx-3 mb-6">
                <div className="w-full px-3">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                    htmlFor="price"
                  >
                    Tên tag
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="price"
                    type="text"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
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
        {/* <div style={{ display: "flex" }}>
          <Input style={{ marginLeft: "4px" }} placeholder="Tìm kiếm" />
        </div> */}
      </div>

      <Tabs defaultActiveKey={currentTab} onChange={handleChangeTab}>
        <TabPane tab="Blog" key="blogs">
          <Table
            columns={blogColumns}
            dataSource={blogs}
            rowKey={(record) => record._id}
            pagination={pagination}
            onChange={(_pagination, filters, sorter) =>
              setPagination(_pagination)
            }
            scroll={{ x: "100%" }}
          />
        </TabPane>
        <TabPane tab="Danh mục blog" key="blog-categories">
          <Table
            columns={blogCategoryColumns}
            dataSource={blogCategories}
            rowKey={(record) => record._id}
            pagination={pagination}
            onChange={(_pagination, filters, sorter) =>
              setPagination(_pagination)
            }
          />
        </TabPane>
        <TabPane tab="Blog tags" key="blog-tags">
          <Table
            columns={blogTagColumns}
            dataSource={blogTags}
            rowKey={(record) => record._id}
            pagination={pagination}
            onChange={(_pagination, filters, sorter) =>
              setPagination(_pagination)
            }
          />
        </TabPane>
      </Tabs>
    </>
  );
}

export default Blogs;
