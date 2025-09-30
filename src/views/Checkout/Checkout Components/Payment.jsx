import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCcVisa } from "react-icons/fa";
import { RiMastercardFill } from "react-icons/ri";

const Payment = () => {
  // Change default to null to require explicit selection
  const [selectedPayment, setSelectedPayment] = useState(null);
  // Add error state to track validation errors
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  // Handle form submission
  const handlePayment = () => {
    // Clear any previous errors
    setError(false);

    // Validate payment method selection
    if (!selectedPayment) {
      setError(true);
      // Scroll to error message if needed
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // If validation passes, navigate to thank you page
    navigate("/thankyou");
  };

  return (
    <div className="p-5 border rounded-lg shadow-md w-full max-w-2xl bg-white">
      <h2 className="text-xl font-bold mb-2">Payment Method</h2>
      <p className="text-gray-600 mb-4">
        All transactions are secure and encrypted
      </p>

      {/* Error message display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Please select a payment method to continue
        </div>
      )}

      <div className="mb-4 space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={selectedPayment === "cod"}
            onChange={() => {
              setSelectedPayment("cod");
              setError(false); // Clear error when user selects an option
            }}
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
            onChange={() => {
              setSelectedPayment("gcash");
              setError(false);
            }}
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
            onChange={() => {
              setSelectedPayment("card");
              setError(false);
            }}
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

      {/* Changed from Link to button to handle validation */}
      <button
        onClick={handlePayment}
        className="block text-center w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
      >
        Pay now
      </button>
    </div>
  );
};

export default Payment;
