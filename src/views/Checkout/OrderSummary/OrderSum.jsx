import React from "react";
import "./OrderSum.css";

const OrderSum = () => {
  return (
    <div className="order-summary">
      <h2>Products Ordered</h2>
      <div className="product-item">
        <span className="product-quantity">1</span>
        <span className="product-description">
          AMD Ryzen 5 5600X Socket AM4 3.7GHz with Wraith Stealth Cooler VR
          Ready Premium Desktop Processor
        </span>
        <span className="product-price">₱5,715.00</span>
      </div>
      <div className="discount-code">
        <input
          type="text"
          placeholder="Discount code or gift card"
          className="discount-input"
        />
        <button className="apply-button">Apply</button>
      </div>
      <div className="totals">
        <div className="subtotal">
          <span>Subtotal</span>
          <span>₱5,715.00</span>
        </div>
        <div className="shipping">
          <span>Shipping</span>
          <span>Enter shipping address</span>
        </div>
        <div className="total">
          <span>Total</span>
          <span>₱5,715.00</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSum;
