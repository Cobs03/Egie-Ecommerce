import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import {Link} from "react-router-dom"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const CartItems = () => {
  // Simulated fetched cart data
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Lenovo V15 G4 IRU i5",
      image: "https://via.placeholder.com/60",
      price: 29495.0,
      quantity: 1,
    },
    {
      id: 2,
      name: "ASUS Vivobook 15 X1504ZA",
      image: "https://via.placeholder.com/60",
      price: 32499.0,
      quantity: 2,
    },
  ]);

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(item.quantity + delta, 1), // prevent < 1
            }
          : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="bg-white shadow p-4 rounded w-full max-w-4xl">
      <p className="text-4xl mb-6">Checkout</p>
      <hr className=""/>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left pb-2">Product</th>
            <th className="text-left pb-2">Price</th>
            <th className="text-left pb-2">Quantity</th>
            <th className="text-left pb-2">Cart Total</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2 flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-16 h-16" />
                <span>{item.name}</span>
              </td>
              <td className="py-2">₱{item.price.toLocaleString()}</td>
              <td className="py-2 flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="bg-red-500 text-white rounded px-2"
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="bg-green-500 text-white rounded px-2"
                >
                  +
                </button>
              </td>
              <td className="py-2">
                ₱{(item.price * item.quantity).toLocaleString()}
              </td>
              <td>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="cursor-pointer">
                      {" "}
                      <FaTrash />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete item from cart</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Total Summary */}
      <div className="mt-4 text-right font-semibold text-lg">
        Total: ₱{total.toLocaleString()}
      </div>
      {/* Action Buttons */}
      <div className="flex justify-between mt-4">
        <button
          onClick={clearCart}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Clear Cart
        </button>
        <Link
          to="/products"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default CartItems;
