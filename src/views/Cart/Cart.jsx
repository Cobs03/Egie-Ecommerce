import React, { useState, useEffect } from "react";
import CartItems from "./Cart Components/CartItems";
import Order from "./Cart Components/Order";
import OtherCart from "./Cart Components/OtherCart";

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Lenovo V15 G4 IRU i5",
      image: "https://via.placeholder.com/60",
      price: 29495.0,
      quantity: 1,
      discount: 500,
      selected: true,
    },
    {
      id: 2,
      name: "ASUS Vivobook 15 X1504ZA",
      image: "https://via.placeholder.com/60",
      price: 32499.0,
      quantity: 2,
      discount: 995,
      selected: true,
    },
  ]);

  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const selectedItems = cartItems.filter((item) => item.selected);

    const calcSubtotal = selectedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const calcDiscount = selectedItems.reduce(
      (acc, item) => acc + (item.discount || 0),
      0
    );
    const calcTotal = calcSubtotal - calcDiscount;

    setSubtotal(calcSubtotal);
    setDiscount(calcDiscount);
    setTotal(calcTotal);
  }, [cartItems]);

  return (
    <div className="flex flex-col justify-around p-5">
      <div className="flex flex-row justify-around p-5 gap-4">
        <CartItems cartItems={cartItems} setCartItems={setCartItems} />
        <Order subtotal={subtotal} discount={discount} total={total} />
      </div>
      <OtherCart />
    </div>
  );
};

export default Cart;
