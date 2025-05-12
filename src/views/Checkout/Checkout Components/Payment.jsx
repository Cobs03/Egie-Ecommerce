import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaCcVisa } from "react-icons/fa";
import { RiMastercardFill } from "react-icons/ri";

const Payment = () => {
  const [selectedPayment, setSelectedPayment] = useState("cod");

  return (
    <div className=" p-5 border rounded-lg shadow-md w-full max-w-2xl bg-white">
      <h2 className="text-xl font-bold mb-2">Payment Method</h2>
      <p className="text-gray-600 mb-4">
        All transactions are secure and encrypted
      </p>

      <div className="mb-4 space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={selectedPayment === "cod"}
            onChange={() => setSelectedPayment("cod")}
            className="w-4 h-4 accent-green-500"
          />
          <span className="font-medium">Cash on Delivery (COD)</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="payment"
            value="gcash"
            checked={selectedPayment === "gcash"}
            onChange={() => setSelectedPayment("gcash")}
            className="w-4 h-4 accent-green-500"
          />
          <span className="font-medium">GCash</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="payment"
            value="card"
            checked={selectedPayment === "card"}
            onChange={() => setSelectedPayment("card")}
            className="w-4 h-4 accent-green-500"
          />
          <span className="font-medium">Credit/Debit Card</span>
        </label>
      </div>

      {/* Show card form if selected */}
      {selectedPayment === "card" && (
        <div className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="Card Number"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="MM/YY"
              className="w-1/2 p-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="CVV"
              className="w-1/2 p-2 border border-gray-300 rounded-md"
            />
          </div>
          <input
            type="text"
            placeholder="Name on Card"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      )}
      <div className="flex space-x-2 mb-4">
        <FaCcVisa size={22} />
        <RiMastercardFill size={22} />
      </div>

      <Link
        to="/thankyou"
        className="block text-center w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
      >
        Pay now
      </Link>
    </div>
  );
};

export default Payment;
