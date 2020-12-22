import _ from "lodash";
import toastNotify from "../../utils/toastNotify";
import axios from "axios";

import {
  GET_PRODUCTS,
  GET_BRANDS,
  GET_NEWS,
  ADD_PRODUCT,
  DELETE_PRODUCT,
  UPDATE_PRODUCT,
  ADD_BRAND,
  DELETE_BRAND,
  UPDATE_BRAND,
  ADD_NEW,
  DELETE_NEW,
  UPDATE_NEW,
  GET_CATEGORIES,
  ADD_CART,
  GET_CART,
  CLEAR_CART,
  UPDATE_CATEGORY,
  ADD_CATEGORY,
  DELETE_CATEGORY,
  GET_SUBCATEGORIES,
  DELETE_SUBCATEGORY,
  ADD_SUBCATEGORY,
  UPDATE_SUBCATEGORY,
  DELETE_FROM_CART,
} from "../types";

const initialState = {
  products: [],
  categories: [],
  subcategories: [],
  cart: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_PRODUCTS:
      return {
        ...state,
        products: [...action.payload],
      };

    case GET_CATEGORIES:
      return {
        ...state,
        categories: [...action.payload],
      };

    case GET_SUBCATEGORIES:
      return {
        ...state,
        subcategories: [...action.payload],
      };

    case GET_BRANDS:
      return {
        ...state,
        brands: [...action.payload],
      };

    case ADD_PRODUCT:
      return {
        ...state,
        products: [action.payload, ...state.products],
      };

    case DELETE_PRODUCT:
      return {
        ...state,
        products: state.products.filter(
          (product) => product._id != action.payload
        ),
      };

    case UPDATE_PRODUCT:
      let i = _.findIndex(state.products, { _id: action.payload._id });
      if (i > -1)
        state.products = [
          ...state.products.slice(0, i),
          action.payload,
          ...state.products.slice(i + 1, state.products.length),
        ];
      else state.products.unshift(action.payload);
      return {
        ...state,
        products: state.products,
      };

    case ADD_BRAND:
      return {
        ...state,
        brands: [action.payload, ...state.brands],
      };

    case DELETE_BRAND:
      return {
        ...state,
        brands: state.brands.filter((brand) => brand._id != action.payload),
      };

    case UPDATE_BRAND:
      let _i = _.findIndex(state.brands, { _id: action.payload._id });
      if (_i > -1)
        state.brands = [
          ...state.brands.slice(0, _i),
          action.payload,
          ...state.brands.slice(_i + 1, state.brands.length),
        ];
      else state.brands.unshift(action.payload);
      return {
        ...state,
        brands: state.brands,
      };

    case ADD_CATEGORY:
      return {
        ...state,
        categories: [action.payload, ...state.categories],
      };

    case DELETE_CATEGORY:
      return {
        ...state,
        categories: state.categories.filter(
          (category) => category._id != action.payload
        ),
      };

    case UPDATE_CATEGORY:
      let categoryIndex = _.findIndex(state.categories, {
        _id: action.payload._id,
      });
      if (categoryIndex > -1)
        state.categories = [
          ...state.categories.slice(0, categoryIndex),
          action.payload,
          ...state.categories.slice(categoryIndex + 1, state.categories.length),
        ];
      else state.categories.unshift(action.payload);
      return {
        ...state,
        categories: state.categories,
      };

    case ADD_SUBCATEGORY:
      return {
        ...state,
        subcategories: [action.payload, ...state.subcategories],
      };

    case DELETE_SUBCATEGORY:
      return {
        ...state,
        subcategories: state.subcategories.filter(
          (category) => category._id != action.payload
        ),
      };

    case UPDATE_SUBCATEGORY:
      let subcategoryIndex = _.findIndex(state.subcategories, {
        _id: action.payload._id,
      });
      if (subcategoryIndex > -1)
        state.subcategories = [
          ...state.subcategories.slice(0, subcategoryIndex),
          action.payload,
          ...state.subcategories.slice(
            subcategoryIndex + 1,
            state.subcategories.length
          ),
        ];
      else state.subcategories.unshift(action.payload);
      return {
        ...state,
        categories: state.categories,
      };

    case ADD_NEW:
      return {
        ...state,
        news: [action.payload, ...state.news],
      };

    case DELETE_NEW:
      return {
        ...state,
        news: state.news.filter((brand) => brand._id != action.payload),
      };

    case UPDATE_NEW:
      let x = _.findIndex(state.news, { _id: action.payload._id });
      if (x > -1) state.news[x] = action.payload;
      else state.news.unshift(action.payload);
      return {
        ...state,
        news: state.news,
      };

    case GET_CART:
      const cart = localStorage.getItem("cart");
      if (action.payload && action.payload.length > 0) {
        localStorage.setItem("cart", JSON.stringify(action.payload));
        return { ...state, cart: [...action.payload] };
      } else {
        if (cart) return { ...state, cart: JSON.parse(cart) };
        return { ...state };
      }

    case ADD_CART:
      let newCart = [];
      if (state.cart.length > 0) {
        const cartElement = state.cart.find(
          (e) => e.productId == action.payload.productId
        );
        if (typeof cartElement !== "undefined") {
          for (let i = 0; i < state.cart.length; i++) {
            if (state.cart[i].productId == action.payload.productId) {
              newCart.push({
                productId: state.cart[i].productId,
                amount: +state.cart[i].amount + +action.payload.amount,
              });
            } else {
              newCart.push(state.cart[i]);
            }
          }
        } else {
          newCart = [...state.cart, action.payload];
        }
      } else {
        newCart.push(action.payload);
      }

      localStorage.setItem("cart", JSON.stringify(newCart));
      axios.post("/api/carts", { cart: newCart });
      return {
        ...state,
        cart: newCart,
      };

    case DELETE_FROM_CART:
      let cartCur = JSON.parse(localStorage.getItem("cart"));
      let _cart = cartCur.filter((e) => e.productId != action.payload);

      localStorage.setItem("cart", JSON.stringify(_cart));
      axios.post("/api/carts", { cart: _cart });
      if (!_cart.length) toastNotify("warn", "Giỏ hàng trống");
      return {
        ...state,
        cart: _cart,
      };

    case CLEAR_CART:
      localStorage.removeItem("cart");
      axios.post("/api/carts", { cart: [] });
      return {
        ...state,
        cart: [],
      };

    default:
      return state;
  }
}
