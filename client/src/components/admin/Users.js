import React, { useState } from "react";
import axios from "axios";
import { Input, Button, Modal, Table, Tag } from "antd";
import { DownloadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

import toastNotify from "../../utils/toastNotify";
import { formatDate } from "../../utils/formatDate";

const { confirm } = Modal;

function Users({ users, addUser, deleteUser, updateUser }) {
  const [isVisible, setIsVisible] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("ROLE_USER");

  const [userId, setUserId] = useState("");
  const [isUpdate, setIsUpdate] = useState(false);

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const [searchInput, setSearchInput] = useState("");

  const handleAdd = () => {
    if (!name) {
      return alert("Name field is required");
    }
    if (!email) {
      return alert("Email field is required");
    }
    if (!password) {
      return alert("password field is required");
    }
    if (!password2) {
      return alert("password confirm field is required");
    }
    // if (!address) {
    //   return alert("address field is required");
    // }
    if (password !== password2) {
      return alert("password confirm field is required");
    }

    axios
      .post("/api/users", {
        name,
        email,
        password,
        role,
        phone,
        address,
      })
      .then((res) => {
        toastNotify("success", "Create user success");
        setIsVisible(false);
        addUser(res.data);
        resetState();
      })
      .catch((err) => {
        const { errors } = err.response.data;
        if (typeof errors !== "undefined" && errors.length > 0) {
          return toastNotify("warn", errors[0].message);
        } else {
          return toastNotify("warn", "ERROR!");
        }
      });
  };

  const handleUpdate = () => {
    // if (!name) {
    //   return alert("Name field is required");
    // }
    // if (!description) {
    //   return alert("description field is required");
    // }
    // let formData = new FormData();
    // formData.append("name", name);
    // formData.append("description", description);
    // if (image) formData.append("image", image);
    // axios.put(`/api/brands/${brandId}`, formData).then((res) => {
    //   setIsVisible(false);
    //   dispatch(updateBrand(res.data));
    //   resetState();
    // });
  };

  const handleDelete = (id) => {
    axios
      .delete(`/api/users/${id}`)
      .then((res) => {
        deleteUser(id);
      })
      .catch((err) => {
        const { errors } = err.response.data;
        if (typeof errors !== "undefined" && errors.length > 0) {
          alert(errors[0].message);
        }
      });
  };

  const showDataUpdate = (u) => {
    setName(u.name);
    setEmail(u.email);
    setAddress(u.address);
    setRole(u.role);
    setUserId(u._id);
    setPhone(u.phone);
    setIsUpdate(true);
    setIsVisible(true);
  };

  const resetState = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPassword2("");
    setAddress("");
    setPhone("");
    setRole("user");
    setIsUpdate(false);
  };

  const disableUser = (id) => {
    confirm({
      title: "Bạn chắc chắn muốn vô hiệu hóa tài khản này?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .post("/api/users/deactivate", { id })
          .then((res) => {
            updateUser(res.data);
            toastNotify("success", "Disable người dùng thành công");
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

  const enableUser = (id) => {
    confirm({
      title: "Bạn chắc chắn muốn khôi phục tài khản này?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .post("/api/users/activate", { id })
          .then((res) => {
            updateUser(res.data);
            toastNotify("success", "Enable người dùng thành công");
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
      title: "Email",
      width: 150,
      dataIndex: "email",
      key: "email",
      fixed: "left",
    },
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (text) =>
        text === "ROLE_USER" ? (
          <Tag color="#87d068">USER</Tag>
        ) : (
          <Tag color="#ff4d4f">ADMIN</Tag>
        ),
    },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    { title: "Ngày sinh", dataIndex: "birthday", key: "birthday" },
    { title: "Giới tính", dataIndex: "gender", key: "gender" },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 100,
      render: (text, record) => (
        <>
          {record.role === "ROLE_USER" && record.isActive ? (
            <Button
              type="primary"
              danger
              onClick={() => disableUser(record._id)}
            >
              Disable
            </Button>
          ) : record.role === "ROLE_USER" && !record.isActive ? (
            <Button type="primary" onClick={() => enableUser(record._id)}>
              Enable
            </Button>
          ) : null}
        </>
      ),
    },
  ];

  const exportToCSV = (csvData, fileName) => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

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
          <Button
            type="primary"
            onClick={() =>
              exportToCSV(users, `users ${formatDate(new Date())}`)
            }
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
      <Modal
        style={{ top: "20px" }}
        title={!isUpdate ? "Thêm mới người dùng" : "Cập nhật người dùng"}
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
            <div className="w-full md:w-1/2 px-3">
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
            <div className="w-full md:w-1/2 px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          {!isUpdate ? (
            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full md:w-1/2 px-3">
                <label
                  className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                  htmlFor="password1"
                >
                  Password
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="password1"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="w-full md:w-1/2 px-3">
                <label
                  className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                  htmlFor="password2"
                >
                  Password Confirm
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="password2"
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                />
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-1/2 px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="role"
              >
                Role
              </label>
              <div class="relative">
                <select
                  class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="role"
                  onChange={(e) => setRole(e.target.value)}
                  value={role}
                >
                  <option value="ROLE_USER">User</option>
                  <option value="ROLE_ADMIN">Admin</option>
                  {/* <option value="super-admin">Super Admin</option> */}
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
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="phone"
              >
                Phone
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="phone"
                type="number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label
                className="block uppercase tracking-wide text-gray-700 text-md font-bold mb-2"
                htmlFor="address"
              >
                Address
              </label>
              <input
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
        dataSource={users.filter(
          (e) =>
            new RegExp(searchInput, "gi").test(e.name) ||
            new RegExp(searchInput, "gi").test(e.email) ||
            new RegExp(searchInput, "gi").test(e.phone)
        )}
        rowKey={(record) => record._id}
        pagination={pagination}
        onChange={(_pagination, filters, sorter) => setPagination(_pagination)}
        scroll={{ x: "100%" }}
      />
    </>
  );
}

export default Users;
