import React, { useState, useEffect } from "react";
import CartItems from "./Cart Components/CartItems";
import Order from "./Cart Components/Order";
import OtherCart from "./Cart Components/OtherCart";
import { useCart } from "../../context/CartContext";

const Cart = () => {
  const { cartItems: dbCartItems, cartTotal, loading, loadCart } = useCart();
  const [selectedItems, setSelectedItems] = useState(new Set());
  
  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Auto-select all items when cart loads
  useEffect(() => {
    if (dbCartItems && dbCartItems.length > 0) {
      setSelectedItems(new Set(dbCartItems.map(item => item.id)));
    }
  }, [dbCartItems]);

  // Transform database cart items to match component format
  const cartItems = dbCartItems.map(item => ({
    id: item.id,
    product_id: item.product_id,
    name: item.product_name,
    image: item.product_image,
    price: item.price_at_add,
    quantity: item.quantity,
    variant_name: item.variant_name,
    discount: 0, // Can be calculated if you have discount logic
    selected: selectedItems.has(item.id),
  }));

  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const selected = cartItems.filter((item) => item.selected);

    const calcSubtotal = selected.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const calcDiscount = selected.reduce(
      (acc, item) => acc + (item.discount || 0),
      0
    );
    const calcTotal = calcSubtotal - calcDiscount;

    setSubtotal(calcSubtotal);
    setDiscount(calcDiscount);
    setTotal(calcTotal);
  }, [cartItems, selectedItems]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col max-w-7xl mx-auto px-4 py-6 h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <p className="mt-4 text-gray-600">Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-7xl mx-auto px-4 py-6 h-auto max-md:h-screen max-md:overflow-y-auto">
      <h1 className="text-2xl [@media(min-width:763px)]:text-4xl font-['Bruno_Ace_SC'] mb-4 [@media(min-width:763px)]:mb-6">
        Shopping Cart
      </h1>

      {/* Desktop/Tablet Layout */}
      <div className="hidden [@media(min-width:763px)]:flex [@media(min-width:763px)]:flex-col md:flex-row gap-6 mb-8">
        <div className="flex gap-6">
          <div className="flex-1">
            <CartItems 
              cartItems={cartItems} 
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
            />
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
        <CartItems 
          cartItems={cartItems} 
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
        />

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
