import React, { useState, useEffect } from "react";
import CartItems from "./Cart Components/CartItems";
import Order from "./Cart Components/Order";
import OtherCart from "./Cart Components/OtherCart";

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Lenovo V15 G4 IRU i5-13420H 16GB RAM 512GB SSD 15.6″",
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
    {
      id: 3,
      name: "Logitech G Pro X Superlight Wireless Gaming Mouse - Black",
      image: "https://via.placeholder.com/150?text=Logitech",
      price: 7599.0,
      quantity: 2,
      selected: true,
    },
    {
      id: 4,
      name: "SteelSeries Arctis Nova 7 Wireless Gaming Headset - PC, PS5",
      image: "https://via.placeholder.com/150?text=SteelSeries",
      price: 12950.0,
      quantity: 1,
      selected: true,
    },
    {
      id: "bundle-1",
      name: "Ultimate Gaming Bundle - Mouse, Keyboard, Headset, Mousepad",
      image: "https://via.placeholder.com/150?text=Gaming+Bundle",
      price: 15999.0,
      quantity: 1,
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
    <div className="flex flex-col max-w-7xl mx-auto px-4 py-6 h-screen overflow-y-auto">
      <h1 className="text-2xl [@media(min-width:763px)]:text-4xl font-['Bruno_Ace_SC'] mb-4 [@media(min-width:763px)]:mb-6">
        Shopping Cart
      </h1>

      {/* Desktop/Tablet Layout */}
      <div className="hidden [@media(min-width:763px)]:flex [@media(min-width:763px)]:flex-col md:flex-row gap-6 mb-8">
        <div className="flex gap-6">
          <div className="flex-1">
            <CartItems cartItems={cartItems} setCartItems={setCartItems} />
          </div>
          <div className="w-full md:w-80">
            <Order subtotal={subtotal} discount={discount} total={total} />
          </div>
        </div>

        {/* OtherCart Component */}
        <OtherCart />
      </div>

      {/* Mobile Layout - Reorganized with Order between CartItems and OtherCart */}
      <div className="[@media(min-width:763px)]:hidden flex flex-col gap-4 pb-4">
        {/* CartItems Component */}
        <CartItems cartItems={cartItems} setCartItems={setCartItems} />

        {/* Order Component - Now positioned between CartItems and OtherCart */}
        <div className="sticky bottom-15 z-40">
          <Order subtotal={subtotal} discount={discount} total={total} />
        </div>

        {/* OtherCart Component */}
        <OtherCart />
      </div>
    </div>
  );
};

export default Cart;
