import React from "react";
import CartItems from "./Cart Components/CartItems";
import Order from "./Cart Components/Order";
import OtherCart from "./Cart Components/OtherCart";

const Cart = () => {
  return (
    <div className="flex flex-col justify-around p-5">
      <div className="flex flex-row justify-around p-5 gap-4">
        <CartItems />
        <Order />
      </div>
      <OtherCart />
    </div>
  );
};

export default Cart;
