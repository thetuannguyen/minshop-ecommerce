import axios from "axios";
import jwt_decode from "jwt-decode";
import setAuthToken from "../../utils/setAuthToken";
import toastNotify from "../../utils/toastNotify";
import { SET_CURRENT_USER } from "../types";

// // Register User
// export const registerUser = (userData, history) => dispatch => {
//   axios.post('/api/users/register', userData)
//     .then(res => history.push('/login'))
//     .catch(err =>
//       dispatch({
//         type: GET_ERRORS,
//         payload: err.response.data
//       }))

// }
// mục đích call api giưa client và server
// Login && Set Token User
export const login = (data) => (dispatch) => {
  axios
    .post("/api/auth/login", data)
    .then((res) => {
      console.log(res);
      // Save to localStorage
      const { token } = res.data;
      // Set token to localStorage
      localStorage.setItem("jwtToken", token);
      // Set token to Auth header
      setAuthToken(token);
      // Decode token to get user infor
      const decoded = jwt_decode(token);
      // Set current user
      dispatch(setCurrentUser(decoded));
      window.location.href = "/";
    })
    .catch((err) => {
      const { errors } = err.response.data;
      if (typeof errors !== "undefined" && errors.length > 0) {
        return toastNotify("warn", errors[0].message);
      } else {
        return toastNotify("warn", "Đã có lỗi xảy ra. Hãy thử lại");
      }

      // dispatch({
      //   type: GET_ERRORS,
      //   payload: err.response.data.errors,
      // });
    });
};

export const loginAdmin = (data) => (dispatch) => {
  axios
    .post("/api/auth/login", data)
    .then((res) => {
      // Save to localStorage
      const { token } = res.data;
      const decoded = jwt_decode(token);

      if (decoded.role === "ROLE_ADMIN") {
        localStorage.setItem("jwtToken", token);
        // Set token to Auth header
        setAuthToken(token);
        // Decode token to get user infor

        // Set current user
        dispatch(setCurrentUser(decoded));
        // window.location.href = "/admin";
      } else {
        return toastNotify("error", "Unauthorized");
      }
    })
    .catch((err) => {
      const { errors } = err.response.data;
      if (typeof errors !== "undefined" && errors.length > 0) {
        return toastNotify("warn", errors[0].message);
      } else {
        return toastNotify("warn", "Đã có lỗi xảy ra. Hãy thử lại");
      }
    });
};

// Set logged in user
export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded,
  };
};

// Log user out
export const logout = (isAdmin = false) => (dispatch) => {
  localStorage.removeItem("jwtToken");
  setAuthToken(false);
  dispatch(setCurrentUser({}));
  toastNotify("success", "Đăng xuất thành công");
  window.location.href = isAdmin ? "/admin" : "/";
};

export const register = (data) => (dispatch) => {
  axios
    .post("/api/auth/register", data)
    .then((res) => {
      window.location.href = "/";
    })
    .catch((err) => {
      console.log(err.response.data);
      const { errors } = err.response.data;
      if (typeof errors !== "undefined" && errors.length > 0) {
        return toastNotify("warn", errors[0].message);
      } else {
        return toastNotify("warn", "Đã có lỗi xảy ra. Hãy thử lại");
      }
    });
};
