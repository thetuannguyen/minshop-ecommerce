import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { addToCart } from "../redux/actions/products";
import formatPrice from "../utils/formatPrice";
import toastNotify from "../utils/toastNotify";

function Products() {
  const dispatch = useDispatch();

  const [searchInputFilter, setSearchInputFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState([]);
  const [priceFilter, setPriceFilter] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubCategoryFilter] = useState("");

  const [currentProducts, setCurrentProducts] = useState([]);

  const [page, setPage] = useState(0);

  const [
    products,
    categories,
    brands,
    isLoading,
  ] = useSelector(({ products, errors }) => [
    products.products,
    products.categories,
    products.brands,
    errors.isLoading,
  ]);

  useEffect(() => {
    document.title = "Sản phẩm";
  }, []);

  useEffect(() => {
    if (products) setCurrentProducts([...products.filter((e) => !e.isDeleted)]);
  }, [products]);

  useEffect(() => {
    if (products) {
      setCurrentProducts(
        products
          .filter((product) => {
            return (
              new RegExp(searchInputFilter, "gi").test(product.name) &&
              (brandFilter.length > 0
                ? brandFilter.includes(product.brandId._id)
                : true) &&
              (priceFilter.length > 0
                ? priceFilter.filter((e) => {
                    let prices = e.split("-");
                    console.log(prices);
                    if (
                      product.price >= +prices[0] &&
                      product.price <= +prices[1]
                    )
                      return 1;
                  }).length > 0
                  ? true
                  : false
                : true) &&
              (categoryFilter
                ? product.categoryId._id == categoryFilter
                : subcategoryFilter
                ? product.subcategoryId
                  ? product.subcategoryId._id == subcategoryFilter
                  : false
                : true)
            );
          })
          .sort((a, b) => {
            if (sortFilter === "new") {
              return 1;
            } else if (sortFilter === "low") {
              return a.price - b.price;
            } else if (sortFilter === "hight") {
              return b.price - a.price;
            } else {
              return 0;
            }
          })
      );
    }
  }, [
    searchInputFilter,
    brandFilter,
    priceFilter,
    sortFilter,
    categoryFilter,
    subcategoryFilter,
  ]);

  const checkBrandFilter = (id) => {
    const checkBox = window.document.getElementById(id);
    if (checkBox)
      if (checkBox.checked == true) {
        setBrandFilter([...brandFilter, id]);
      } else {
        setBrandFilter(brandFilter.filter((e) => e != id));
      }
  };

  const checkPriceFilter = (id, price) => {
    const checkBox = window.document.getElementById(id);
    if (checkBox)
      if (checkBox.checked == true) {
        setPriceFilter([...priceFilter, price]);
      } else {
        setPriceFilter(priceFilter.filter((e) => e != price));
      }
  };

  const setCategory = (id) => {
    if (subcategoryFilter) setSubCategoryFilter("");

    setCategoryFilter(id);
  };

  const setSubcategory = (id) => {
    if (categoryFilter) setCategoryFilter("");

    setSubCategoryFilter(id);
  };

  return (
    <>
      <div>
        <div className="container-fluid page-heading shop-heading">
          <div className="heading-content">
            <ol className="breadcrumb">
              <li>
                <Link to="/">Trang chủ</Link>
              </li>
              <li className="active">Sản phẩm</li>
            </ol>
          </div>
        </div>
        <div className="container shop-main">
          <div className="row">
            <nav className="navbar navbar-default" id="shop-menu">
              <button
                type="button"
                className="navbar-toggle collapsed pull-left"
                data-toggle="slide-collapse"
                data-target=".shop-nav"
              >
                <span className="icon-bar" />
                <span className="icon-bar" />
                <span className="icon-bar" />
              </button>
              <div className="collapse navbar-collapse pull-left shop-nav">
                <ul className="nav navbar-nav">
                  <li className="dropdown">
                    <form>
                      <a
                        href="#"
                        className="dropdown-toggle"
                        data-toggle="dropdown"
                      >
                        Lọc theo hãng sản xuất <span className="caret" />
                      </a>
                      <ul className="dropdown-menu">
                        {brands &&
                          brands.map((brand, index) => (
                            <>
                              {index === 0 ? null : (
                                <li role="separator" className="divider" />
                              )}
                              <li className="checkbox">
                                <input
                                  type="checkbox"
                                  id={brand._id}
                                  onClick={() => checkBrandFilter(brand._id)}
                                />
                                {brand.name}
                              </li>
                            </>
                          ))}
                      </ul>
                    </form>
                  </li>
                  <li className="dropdown">
                    <form>
                      <a
                        href="#"
                        className="dropdown-toggle"
                        data-toggle="dropdown"
                      >
                        Lọc theo mức giá <span className="caret" />
                      </a>
                      <ul className="dropdown-menu">
                        <li className="checkbox">
                          <input
                            type="checkbox"
                            name="price1"
                            defaultValue="price1"
                            id="price1"
                            onClick={() =>
                              checkPriceFilter("price1", "0-1000000")
                            }
                          />
                          Dưới 1 triệu
                        </li>
                        <li role="separator" className="divider" />
                        <li className="checkbox">
                          <input
                            type="checkbox"
                            name="price2"
                            defaultValue="price2"
                            id="price2"
                            onClick={() =>
                              checkPriceFilter("price2", "1000000-3000000")
                            }
                          />
                          Từ 1 triệu đến 3 triệu
                        </li>
                        <li role="separator" className="divider" />
                        <li className="checkbox">
                          <input
                            type="checkbox"
                            name="price3"
                            defaultValue="price3"
                            id="price3"
                            onClick={() =>
                              checkPriceFilter("price3", "3000000-5000000")
                            }
                          />
                          Từ 3 triệu đến 5 triệu
                        </li>
                        <li role="separator" className="divider" />
                        <li className="checkbox">
                          <input
                            type="checkbox"
                            name="price4"
                            defaultValue="price4"
                            id="price4"
                            onClick={() =>
                              checkPriceFilter("price4", "5000000-10000000")
                            }
                          />
                          Từ 5 triệu đến 10 triệu
                        </li>
                        <li role="separator" className="divider" />
                        <li className="checkbox">
                          <input
                            type="checkbox"
                            name="price5"
                            defaultValue="price5"
                            id="price5"
                            onClick={() =>
                              checkPriceFilter(
                                "price5",
                                "10000000-999999999999"
                              )
                            }
                          />
                          Trên 10 triệu
                        </li>
                        {/* <li role="separator" className="divider" />
                        <li>
                          <input
                            className="filter"
                            id="price"
                            type="submit"
                            defaultValue="Xem kết quả"
                          />
                        </li> */}
                      </ul>
                    </form>
                  </li>
                </ul>
              </div>
              <select
                className="form-control pull-right"
                onChange={(e) => setSortFilter(e.target.value)}
              >
                <option disabled selected hidden value="">
                  Sắp xếp
                </option>
                <option value="">Thứ tự mặc định</option>
                <option value="new">Thứ tự theo sản phẩm mới</option>
                <option value="low">Thứ tự theo giá: thấp đến cao</option>
                <option value="hight">Thứ tự theo giá: cao đến thấp</option>
              </select>
            </nav>
            <div className="product-list">
              <ul className="nav nav-stacked col-xs-3 collapse navbar-collapse shop-nav">
                <li className="search-box">
                  <div className="nav-title">
                    <h4>Tìm sản phẩm</h4>
                  </div>
                  <form className="navbar-form">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search"
                        onChange={(e) => setSearchInputFilter(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-default">
                      <i className="fa fa-search" />
                    </button>
                  </form>
                </li>
                <li className="nav-title" onClick={() => setCategory("")}>
                  <a data-toggle="display-all">
                    <h4>Danh mục sản phẩm</h4>
                  </a>
                </li>
                {categories &&
                  categories.map((category) => (
                    <li className="text-2xl">
                      <button
                        className={
                          categoryFilter == category._id
                            ? "product-group active"
                            : "product-group"
                        }
                        type="button"
                        onClick={() => setCategory(category._id)}
                      >
                        <h4>{category.name}</h4>
                      </button>
                      <ul className="nested-tab">
                        {category.subcategories &&
                          category.subcategories.map((subcategory) => (
                            <li>
                              <button
                                className={
                                  subcategoryFilter == subcategory._id
                                    ? "sub-group active"
                                    : "sub-group"
                                }
                                type="button"
                                onClick={() => setSubcategory(subcategory._id)}
                              >
                                <h5>{subcategory.name}</h5>
                              </button>
                            </li>
                          ))}
                      </ul>
                    </li>
                  ))}
              </ul>
              <div className="item-list col-xs-12 col-sm-9">
                <div className="row">
                  {currentProducts &&
                    currentProducts
                      .slice(page * 9, page * 9 + 9)
                      .map((product) => (
                        <div className="col-item chair arm-chair col-xs-6 col-lg-4">
                          <div className="item-container">
                            <div className="name">
                              <div
                                className="max-1-line"
                                style={{
                                  fontWeight: 600,
                                  fontSize: "16px",
                                }}
                              >
                                {product.name}
                              </div>
                              <div className="max-1-line">
                                by {product.brandId.name}
                              </div>
                            </div>
                            <div>
                              <div className="photo">
                                <div
                                  id={product._id}
                                  className="carousel slide"
                                  data-ride="carousel"
                                  data-interval="false"
                                >
                                  <ol className="carousel-indicators">
                                    {product.images.length > 1 &&
                                      product.images.map((image, index) => (
                                        <li
                                          data-target={`#${product._id}`}
                                          data-slide-to={index}
                                          className={
                                            index === 0 ? "active" : ""
                                          }
                                        />
                                      ))}
                                  </ol>
                                  <Link
                                    to={`/products/${product._id}`}
                                    className="carousel-inner"
                                    role="listbox"
                                  >
                                    {product.images.map((image, index) => (
                                      <div
                                        className={
                                          index === 0 ? "item active" : "item"
                                        }
                                        style={{
                                          backgroundImage: `url(/images/${image})`,
                                        }}
                                      ></div>
                                    ))}
                                  </Link>
                                </div>
                                <div className="vertical-icon">
                                  {/* <a href="#">
                                    <i className="fa fa-heart-o" />
                                  </a> */}
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (product.amount > 0) {
                                        dispatch(
                                          addToCart({
                                            productId: product._id,
                                            amount: 1,
                                          })
                                        );
                                        toastNotify(
                                          "success",
                                          "Thêm vào giỏ hàng thành công"
                                        );
                                      } else
                                        toastNotify(
                                          "warn",
                                          "Sản phẩm đã hết hàng"
                                        );
                                    }}
                                  >
                                    <i className="fa fa-shopping-cart" />
                                  </a>
                                  <Link to={`/products/${product._id}`}>
                                    <i className="fa fa-search-plus" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                            <div className="price">
                              {product.amount > 0 ? (
                                <strong>
                                  {product.priceDiscount && (
                                    <del
                                      style={{
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        marginRight: "8px",
                                        color: "#FF0000",
                                      }}
                                    >
                                      {formatPrice(product.price)}₫
                                    </del>
                                  )}
                                  {product.priceDiscount ? (
                                    <ins>
                                      {formatPrice(product.priceDiscount)}₫
                                    </ins>
                                  ) : (
                                    <ins>{formatPrice(product.price)}₫</ins>
                                  )}
                                </strong>
                              ) : (
                                <strong style={{ color: "red" }}>
                                  Hết hàng
                                </strong>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
                <nav>
                  <div className="pagination">
                    {currentProducts && currentProducts.length > 0 && (
                      <a className="prev page-no" href="#">
                        <i className="fa fa-long-arrow-left" />
                      </a>
                    )}
                    {currentProducts &&
                      currentProducts.length > 0 &&
                      Array(Math.floor(currentProducts.length / 9) + 1)
                        .fill(1)
                        .map((e, index) => (
                          <a
                            href="#"
                            className={
                              page === index ? "page-no current" : "page-no"
                            }
                            onClick={() => setPage(index)}
                          >
                            {index + 1}
                          </a>
                        ))}
                    {currentProducts && currentProducts.length > 0 && (
                      <a className="next page-no" href="#">
                        <i className="fa fa-long-arrow-right" />
                      </a>
                    )}
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Products;
