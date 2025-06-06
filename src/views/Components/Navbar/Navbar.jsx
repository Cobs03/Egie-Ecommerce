import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../../../src/index.css";
import "flowbite";
import { IoNotifications } from "react-icons/io5";
import { IoBookmark } from "react-icons/io5";
import { FaShoppingCart } from "react-icons/fa";
import { FaSquareFacebook } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { FaBookmark } from "react-icons/fa";

const Navbar = ({ isAuth }) => {
  const [cartCount, setCartCount] = useState(2); // example
  const [notificationCount, setNotificationCount] = useState(3); // example

  const [isSignedIn, setIsSignedIn] = useState(true);
  const navigate = useNavigate();

  const location = useLocation();
  const isProductsActive = location.pathname.startsWith("/products");

  const isActive = (path) => location.pathname === path;

  const handleSignOut = () => {
    // Optional: clear any user session data, tokens, etc.
    // localStorage.removeItem('token');

    setIsSignedIn(true);
    navigate("/signin"); // Redirect to Sign In page
  };

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Replace this with your actual search logic
      alert(`Searching for: ${searchQuery}`);
    }
  };

  return (
    <div className={`navbar ${isAuth ? "auth-navbar" : "main-navbar"}`}>
      {isAuth ? (
        <div className="auth-header "></div>
      ) : (
        <div className="main-header">
          <nav className="bg-black border-gray-200 fixed w-full top-0 z-50">
            {/* UPPER NAVBAR */}
            <div className="hidden md:block  bg-[#111] text-white text-sm px-5">
              <div className="flex flex-row md:flex-row lg:flex-row md:order-1 justify-between items-center">
                <div className="leading-loose">
                  Mon-Sunday 8:00 AM - 5:30 PM
                </div>
                <div className="">
                  Visit our showroom at 1234 Street Address City Address, 1234{" "}
                  <a href="#">Contact Us</a>
                </div>
                <div className="">Call Us: +639151855519</div>

                <div className="flex gap-2 text-2xl ">
                  <a href="https://www.facebook.com/EGIEGameShop/">
                    <FaSquareFacebook className=" hover:text-[#4AA3E8]" />
                  </a>
                  <a href="https://www.instagram.com/egie_gameshop/">
                    <FaInstagram className="instagram-icon hover:text-[#4AA3E8]" />
                  </a>
                </div>
              </div>
            </div>

            {/* BOTTOM NAVBAR */}
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto bg-transparent">
              {/* LOGO */}
              <Link
                to="/"
                className="flex items-center space-x-3 rtl:space-x-reverse"
              >
                <img
                  src="https://i.ibb.co/Cpx2BBt5/egie-removebg-preview-1.png"
                  className="h-15"
                  alt="EGIE Logo"
                />
              </Link>

              {/* MAIN LINKS */}
              <div
                className="items-center justify-between hidden w-full md:flex md:w-auto md:order-2 sm:order-5 bg-black"
                id="navbar-user"
              >
                {/* Search bar for mobile */}
                <div className="relative mt-3 md:hidden">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search-navbar"
                    className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search..."
                  />
                </div>
                <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg  md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
                  <li>
                    <Link
                      to="/"
                      className={`block py-2 px-3 rounded-sm md:p-0 ${
                        isActive("/")
                          ? "text-blue-400 font-semibold"
                          : "text-white"
                      } hover:text-gray-300`}
                      aria-current="page"
                    >
                      Home
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/products"
                      className={`block py-2 px-3 rounded-sm md:p-0 ${
                        isActive("/products")
                          ? "text-blue-400 font-semibold"
                          : "text-white"
                      } hover:text-gray-300`}
                      aria-current="page"
                    >
                      All Products
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/buildpc"
                      className={`block py-2 px-3 rounded-sm md:p-0 ${
                        isActive("/buildpc")
                          ? "text-blue-400 font-semibold"
                          : "text-white"
                      } hover:text-gray-300`}
                    >
                      PC Build
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contactus"
                      className={`block py-2 px-3 rounded-sm md:p-0 ${
                        isActive("/contactus")
                          ? "text-blue-400 font-semibold"
                          : "text-white"
                      } hover:text-gray-300`}
                    >
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>

              {/* RIGHT */}
              <div className="flex flex-wrap items-center justify-between md:order-3 mx-5 ">
                <div className="flex items-center md:order-2">
                  {/* Small Screen Search Button */}
                  <button
                    type="button"
                    data-collapse-toggle="navbar-user"
                    aria-controls="navbar-search"
                    aria-expanded="false"
                    className="md:hidden text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 me-1"
                  >
                    <svg
                      className="w-5 h-5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                    <span className="sr-only">Search</span>
                  </button>

                  <div
                    className=" relative hidden md:block w-100 mx-5"
                    id="navbar-search"
                  >
                    {/* <div className="relative inset-y-0 start-0 flex items-center ps-3 pointer-events-cursor">
                      <svg className=" w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                      </svg>

                    </div> */}
                    <input
                      type="text"
                      id="search-navbar"
                      className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
                      placeholder="Search..."
                    />
                  </div>
                </div>

                {/* BUTTONS */}
                <div
                  className={`flex md:order-3 mx-4  auth-buttons ${
                    isSignedIn ? "signed-in" : "signed-out"
                  }`}
                >
                  {isSignedIn ? (
                    <>
                      <Link
                        to="/wishlist"
                        className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 "
                      >
                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                          <FaBookmark />
                        </span>
                      </Link>

                      <Link
                        to="/cart"
                        className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 "
                      >
                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                          <FaShoppingCart className="cart" />
                        </span>
                        {cartCount > 0 && (
                          <span className="absolute top-2 right-2 transform translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {cartCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/notification"
                        className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 "
                      >
                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                          <IoNotifications />
                        </span>
                        {notificationCount > 0 && (
                          <span className="absolute top-2 right-2 transform translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {notificationCount}
                          </span>
                        )}
                      </Link>

                      {/* <!-- Dropdown menu --> */}
                      <div
                        className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600"
                        id="user-dropdown"
                      >
                        <div className="px-4 py-3">
                          <span className="block text-sm text-gray-900 dark:text-white">
                            Bonnie Green
                          </span>
                          <span className="block text-sm  text-gray-500 truncate dark:text-gray-400">
                            name@flowbite.com
                          </span>
                        </div>
                        <ul className="py-2" aria-labelledby="user-menu-button">
                          <li>
                            <button className="text-left cursor-pointer w-full block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
                              My Settings
                            </button>
                          </li>
                          <li>
                            <Link
                              to="/purchases"
                              className="text-left cursor-pointer w-full block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                            >
                              My Purchases
                            </Link>
                          </li>
                          <li>
                            <button
                              onClick={handleSignOut}
                              className="w-full text-left cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                            >
                              Sign out
                            </button>
                          </li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/signin"
                        className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800"
                      >
                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                          Sign In
                        </span>
                      </Link>

                      <Link
                        to="/auth"
                        className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800"
                      >
                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                          Sign Up
                        </span>
                      </Link>
                    </>
                  )}
                </div>

                {/* PROFILE AND HAMBURGER */}
                <div className="flex items-center md:order-4 space-x-3 md:space-x-0 rtl:space-x-reverse">
                  <button
                    type="button"
                    className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                    id="user-menu-button"
                    aria-expanded="false"
                    data-dropdown-toggle="user-dropdown"
                    data-dropdown-placement="bottom"
                  >
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="w-8 h-8 rounded-full"
                      src="/docs/images/people/profile-picture-3.jpg"
                      alt="user photo"
                    />
                  </button>

                  <button
                    data-collapse-toggle="navbar-user"
                    type="button"
                    className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                    aria-controls="navbar-user"
                    aria-expanded="false"
                  >
                    <span className="sr-only">Open main menu</span>
                    <svg
                      className="w-5 h-5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 17 14"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M1 1h15M1 7h15M1 13h15"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Navbar;
