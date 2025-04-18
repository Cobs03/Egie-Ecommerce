import React from "react";
import "./Address.css";

const Address = () => {

    return (
      <div className="checkout-container">
        <h1 className="checkout-title">Egie Checkout</h1>
        <div className="address-section">
          <p className="delivery-address">🛍️ Delivery Address</p>
          <div className="address-details">
            <p className="name">Jacob Gino Cruz (+63) 9184549421</p>
            <p className="address">
              306 km 37, Pulong Buhangin, Santa Maria, North Luzon, Bulacan 3022
            </p>

            <button className="change-button">Change</button>
          </div>
        </div>
      </div>
    );
}

export default Address;