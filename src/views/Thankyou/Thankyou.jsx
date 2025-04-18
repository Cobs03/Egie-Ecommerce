import React from "react";
import "./ThankYou.css";
import {Link} from "react-router-dom";

const ThankYou = () => {
  return (
    <div className="thank-you-container">
      <div className="icon-container">
        <i className="fas fa-shopping-cart"></i>
      </div>
      <h1>Thank you for Shopping at Egie Online GameShop</h1>
      <Link to="/" className="return-button">RETURN TO SHOP MORE</Link>
    </div>
  );
};

export default ThankYou;
