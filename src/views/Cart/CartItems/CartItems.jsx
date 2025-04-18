import React from "react";
import "./CartItems.css";


const CartItems = () => {

    return (
      <div className="cart-container">
        <h2>Egie Shopping Cart</h2>
        <div className="cart-header">
          <div className="product-header">Product</div>
          <div className="price-header">Unit Price</div>
          <div className="quantity-header">Quantity</div>
          <div className="total-header">Total Price</div>
          <div className="actions-header">Actions</div>
        </div>
        <div className="cart-item">
          <div className="product-info">
            <span className="remove-item">×</span>
            <span className="product-name">
              AMD Ryzen 5 5600X Socket AM4 3.7GHz with Wraith Stealth Cooler VR
              Ready Premium Desktop Processor
            </span>
          </div>
          <div className="unit-price">₱ 999</div>
          <div className="quantity">
            <button>-</button>
            <span>1</span>
            <button>+</button>
          </div>
          <div className="total-price">₱ 1,598</div>
          <div className="actions">
            <button className="delete-btn">Delete</button>
            <button className="find-similar-btn">Find Similar</button>
          </div>
        </div>
      </div>
    );
}

export default CartItems;