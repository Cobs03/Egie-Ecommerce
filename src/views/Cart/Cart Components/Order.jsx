import React from "react";

import { Link } from "react-router-dom";    


const Order = () => {

return (
  <div className="bg-white shadow p-4 rounded w-full max-w-sm">
    <div className="mb-4">
      <h3 className="font-semibold mb-2">Add note to your order</h3>
      <textarea
        className="w-full border border-gray-300 rounded p-2"
        placeholder="Write your note here..."
        rows={4}
      ></textarea>
    </div>

    <div className="mb-4">
      <h3 className="font-semibold mb-2">Discount Detail</h3>
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>₱29,495.00</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Product Discount</span>
        <span className="text-green-600">−₱1,495.00</span>
      </div>
      <div className="flex justify-between text-sm text-red-600 font-semibold">
        <span>Saved</span>
        <span>₱1,495.00</span>
      </div>
      <div className="flex justify-between text-sm font-bold mt-1">
        <span>Total Amount</span>
        <span>₱28,000.00</span>
      </div>
    </div>

    <div className="flex justify-between mb-4">
      <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
        Local Delivery
      </button>
      <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
        Store Pickup
      </button>
    </div>

    <Link to="/checkout" className="block w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-center">
      Proceed to Checkout
    </Link>
  </div>
);
}

export default Order;