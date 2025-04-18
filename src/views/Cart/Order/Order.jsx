import React from "react";
import "./Order.css"    
import { Link } from "react-router-dom";    


const Order = () => {

    return (
      <div className="order-note-container">
        <h2>Add a note to your order</h2>
        <textarea placeholder="Write your note here..."></textarea>

        <div className="discount-details">
          <h3>Discount Detail</h3>
          <div className="discount-item">
            <span>Subtotal</span>
            <span>₱206</span>
          </div>
          <div className="discount-item">
            <span>Product Discount</span>
            <span>₱20</span>
          </div>
          <div className="discount-item">
            <span>Saved</span>
            <span>₱186</span>
          </div>
          <div className="total-amount">
            <span>Total Amount</span>
            <span>₱186</span>
          </div>
        </div>

        <div className="delivery-options">
          <button className="delivery-button">Local Delivery</button>
          <button className="pickup-button">Store Pickup</button>
        </div>

        <Link to="/checkout" className="checkout-button">Proceed to Checkout</Link>
      </div>
    );
}

export default Order;