import React from "react";
import "./Footer.css";

const Footer = ({ isAuth }) => {
  return (
    <footer className={`footer ${isAuth ? "" : "main-footer"}`}>
      {isAuth ? null : (
        <>
          <div className="footer-content">
            <div className="footer-logo">
              <img
                src="https://i.ibb.co/Cpx2BBt5/egie-removebg-preview-1.png"
                alt="EGIE Game Shop"
              />
            </div>

            <div className="footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/shop">Shop</a>
                </li>
                <li>
                  <a href="/about">About Us</a>
                </li>
                <li>
                  <a href="/contact">Contact Us</a>
                </li>
                <li>
                  <a href="/faqs">FAQs</a>
                </li>
              </ul>
            </div>

            <div className="footer-contact">
              <h4>Contact Us</h4>
              <p>Email: support@[yourstorename].com</p>
              <p>Phone: (123) 456-7890</p>
            </div>

            <div className="footer-follow">
              <h4>Follow Us:</h4>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </div>

            <div className="footer-payment">
              <h4>We accept:</h4>
              <img src="path_to_mastercard_logo.png" alt="Mastercard" />
              <img src="path_to_visa_logo.png" alt="Visa" />
            </div>
          </div>

          <hr />

          <div className="footer-bottom">
            <p>
              © 2025 Egie Gameshop. All rights reserved.{" "}
              <a href="/terms">Terms of Service</a> |{" "}
              <a href="/privacy">Privacy Policy</a>
            </p>
          </div>
        </>
      )}
    </footer>
  );
};

export default Footer;
