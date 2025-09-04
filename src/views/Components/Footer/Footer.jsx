import React from "react";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { RiMastercardFill } from "react-icons/ri";
import { FaCcVisa } from "react-icons/fa";

const Footer = ({ isAuth }) => {
  return (
    <footer
      className={`${isAuth ? "" : "bg-black text-white py-8 text-center"}`}
    >
      {!isAuth && (
        <>
          <div className="flex flex-wrap justify-around items-start text-left px-4 sm:px-8">
            {/* Logo */}
            <div className="mb-6 w-full sm:w-auto">
              <img
                src="https://i.ibb.co/tp4Bkfzs/egie-removebg-preview-1.png"
                alt="EGIE Game Shop"
                className="w-[280px] sm:w-[350px] mx-auto sm:mx-0"
              />
            </div>

            {/* Quick Links */}
            <div className="mb-6">
              <h4 className="mb-3 font-semibold text-lg">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="hover:underline">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/shop" className="hover:underline">
                    Shop
                  </a>
                </li>
                <li>
                  <a href="/about" className="hover:underline">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:underline">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/faqs" className="hover:underline">
                    Compare
                  </a>
                </li>
                <li>
                  <a href="/faqs" className="hover:underline">
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="mb-6">
              <h4 className="mb-3 font-semibold text-lg">Contact Us</h4>
              <p>Email: support@[yourstorename].com</p>
              <p>Phone: (123) 456-7890</p>
            </div>

            {/* Socials */}
            <div className="mb-6">
              <h4 className="mb-3 font-semibold text-lg">Follow Us:</h4>
              <div className="flex flex-row gap-2 space-y-1">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  <FaFacebook className="text-white hover:text-green-500 text-2xl" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  <FaInstagram className="text-white hover:text-green-500 text-2xl" />
                </a>
              </div>
            </div>

            {/* Payments */}
            <div className="mb-6">
              <h4 className="mb-3 font-semibold text-lg">We accept:</h4>
              <div className="flex flex-row space-x-2 justify-center sm:justify-start">
                <RiMastercardFill className="text-3xl" />

                <FaCcVisa className="text-3xl" />
              </div>
            </div>
          </div>

          <hr className="border-gray-600 my-6 mx-4" />

          <div className="text-sm px-4">
            <p>
              © 2025 Egie Gameshop. All rights reserved.{" "}
              <a href="/terms" className="hover:underline">
                Terms of Service
              </a>{" "}
              |{" "}
              <a href="/privacy" className="hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </>
      )}
    </footer>
  );
};

export default Footer;
