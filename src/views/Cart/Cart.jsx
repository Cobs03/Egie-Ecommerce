import React from "react";
import "./Cart.css";
import CartItems from "./CartItems/CartItems";
import Order from "./Order/Order";
import OtherCart from "./OtherCart/OtherCart";

const Cart = () => {
    return (
      <div className="cart-contain">
        <div className="top">
          <CartItems />
          <Order />
        </div>
        <OtherCart />
      </div>
    );
}

export default Cart;