import React from "react";
import "./Banner.css";
import { Link } from "react-router-dom";

const LandingBanner = () => {
    return (
      <>
        <div className="banner-container">
            <div className="banner-gradient"></div>
          <div className="banner-content">
            <h1>FIND THE BEST PC PARTS FOR YOU</h1>
            <div className="button-container">
              <Link to="/products" className="shop-button">SHOP NOW</Link>
              <button className="learn-button">LEARN MORE</button>
            </div>
          </div>
        </div>
      </>
    );
}

export default LandingBanner;