import React, { useState } from "react";
import {Link} from "react-router-dom";

import "./Navbar.css";
import { FaSquareFacebook } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { IoBookmark } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { IoNotifications } from "react-icons/io5";


const Navbar = ({isAuth}) => {

  const [isSignedIn, setIsSignedIn] = useState(true);

  return (
    <div className={`navbar ${isAuth ? "auth-navbar" : "main-navbar"}`}>
      {isAuth ? (
        <div className="auth-header">
          <div className="auth-Navbar">
            <div className="auth-logo">
              <img
                src="https://i.ibb.co/Cpx2BBt5/egie-removebg-preview-1.png"
                alt="EGIE Game Shop"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="main-header">
          <div className="navbar">
            <div className="navbar-top">
              <div className="contact-info">Mon-Sunday 8:00 AM - 5:30 PM</div>
              <div className="showroom-info">
                Visit our showroom at 1234 Street Address City Address, 1234{" "}
                <a href="#">Contact Us</a>
              </div>
              <div className="call">Call Us: +639151855519</div>

              <div className="social-media">
                <a href="https://www.facebook.com/EGIEGameShop/">
                  <FaSquareFacebook className="facebook-icon" />
                </a>
                <a href="https://www.instagram.com/egie_gameshop/">
                  <FaInstagram className="instagram-icon" />
                </a>
              </div>
            </div>
            <div className="navbar-bottom">
              <div className="logo">
                <img
                  src="https://i.ibb.co/Cpx2BBt5/egie-removebg-preview-1.png"
                  alt="EGIE Game Shop"
                />
              </div>
              <div className="nav-links">
                <Link to="/" href="#">
                  Home
                </Link>
                <div className="dropdown">
                  <button className="dropbtn">Products</button>
                  <div className="dropdown-content">
                    <a href="#">Desktops</a>
                    <a href="#">Laptops</a>
                    <Link to="/products" href="#">
                      All Products
                    </Link>
                  </div>
                </div>
                <a href="#">System Builder</a>
                <a href="#">Contact Us</a>
              </div>
              <div className="search">
                <input type="text" placeholder="Search" />
                <button type="submit">
                  <FaSearch />
                </button>
              </div>
              <div
                className={`auth-buttons ${
                  isSignedIn ? "signed-in" : "signed-out"
                }`}
              >
                {isSignedIn ? (
                  <>
                    <button className="sign-in">
                      <IoBookmark className="bookmark" />
                    </button>
                    <button className="sign-up">
                      <FaShoppingCart className="cart" />
                    </button>
                    <button className="sign-up">
                      <IoNotifications />
                    </button>
                    <button className="profile">
                      <CgProfile className="profile-pic" />
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/signin">
                      <button className="sign-in">Sign In</button>
                    </Link>
                    <Link to="/auth">
                      <button className="sign-up">Sign Up</button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
