import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TbTruckDelivery } from "react-icons/tb";
import { TiThumbsOk } from "react-icons/ti";
import { FaChevronUp, FaChevronDown, FaExclamationCircle } from "react-icons/fa";
import { useCart } from "../../../context/CartContext";

const Order = ({ subtotal, discount, total }) => {
  const { orderNotes, setOrderNotes, deliveryType, setDeliveryType } = useCart();
  // State to track if mobile order details are expanded
  const [isExpanded, setIsExpanded] = useState(false);
  // State to track error message
  const [error, setError] = useState(false);
  
  const navigate = useNavigate();

  // Toggle function to select a delivery method
  const selectDeliveryMethod = (method) => {
    setDeliveryType(method === 'local' ? 'local_delivery' : 'store_pickup');
    setError(false); // Clear error when user selects a delivery method
  };

  // Toggle expanded state
  const toggleExpand = (e) => {
    if (e) e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Handle checkout click
  const handleCheckout = (e) => {
    e.preventDefault();
    
    if (!deliveryType) {
      setError(true);
      setIsExpanded(true); // Expand options when error occurs
      return;
    }
    
    // If delivery method is selected, proceed to checkout
    navigate("/checkout");
  };

  return (
    <>
      {/* Desktop/Tablet Order Component - Visible above 763px */}
      <div className="bg-white shadow p-4 rounded w-full max-w-sm hidden [@media(min-width:763px)]:block">
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Add note to your order</h3>
          <textarea
            className="w-full border border-gray-300 rounded p-2"
            placeholder="Write your note here..."
            rows={4}
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          ></textarea>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Checkout</h3>
          <hr className="border-t border-black mb-4" />
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="text-green-900 font-bold">
              ₱{subtotal.toLocaleString()}
            </span>
          </div>
          <hr className="border-t border-black mt-4" />
        </div>

        <h3 className="font-semibold mb-2">Choose mode of Delivery</h3>
        {error && (
          <div className="text-red-500 flex items-center gap-2 text-sm mb-3">
            <FaExclamationCircle />
            <span>Please select a delivery method before proceeding</span>
          </div>
        )}
        <div className="flex justify-between mb-4">
          <button
            className={`px-4 py-2 rounded flex flex-col items-center gap-2 cursor-pointer transition-colors ${
              deliveryType === "local_delivery"
                ? "bg-white text-green-600 border-green-500 border-2 shadow shadow-green-800"
                : "bg-white border border-gray-300 shadow hover:bg-gray-300"
            }`}
            onClick={() => selectDeliveryMethod("local")}
          >
            <TbTruckDelivery className="text-3xl" />
            Local Delivery
          </button>
          <button
            className={`px-4 py-2 rounded flex flex-col items-center gap-2 cursor-pointer transition-colors ${
              deliveryType === "store_pickup"
                ? "bg-white text-green-600 border-green-500 border-2 shadow shadow-green-800"
                : "bg-white border border-gray-300 shadow hover:bg-gray-300"
            }`}
            onClick={() => selectDeliveryMethod("pickup")}
          >
            <TiThumbsOk className="text-3xl" />
            Store Pickup
          </button>
        </div>

        <button
          onClick={handleCheckout}
          className="block w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-center cursor-pointer"
        >
          Proceed to Checkout
        </button>
      </div>

      {/* Mobile Order Component - For sticky positioning at the bottom */}
      <div className="w-full [@media(min-width:763px)]:hidden">
        <div className="bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] rounded-t-md">
          {/* Header with expand/collapse button */}
          <div className="flex justify-between items-center p-4 border-b relative">
            <h3 className="font-medium text-lg">Checkout</h3>
            <button
              onClick={toggleExpand}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center"
              aria-label={isExpanded ? "Collapse checkout details" : "Expand checkout details"}
            >
              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>

          {/* Expandable content */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              isExpanded ? "max-h-[400px]" : "max-h-0"
            }`}
          >
            <div className="p-4">
              {/* Order note */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Add note to your order</h4>
                <textarea
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Write your note here..."
                  rows={3}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                ></textarea>
              </div>

              {/* Delivery options */}
              <h4 className="font-medium mb-2">Choose mode of Delivery</h4>
              {error && (
                <div className="text-red-500 flex items-center gap-2 text-sm mb-3">
                  <FaExclamationCircle />
                  <span>Please select a delivery method</span>
                </div>
              )}
              <div className="flex justify-between mb-4">
                <button
                  className={`px-3 py-2 rounded flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                    deliveryType === "local_delivery"
                      ? "bg-white text-green-600 border-green-500 border-2 shadow shadow-green-800"
                      : "bg-white border border-gray-300 shadow hover:bg-gray-300"
                  }`}
                  onClick={() => selectDeliveryMethod("local")}
                >
                  <TbTruckDelivery className="text-xl" />
                  <span className="text-sm">Local Delivery</span>
                </button>
                <button
                  className={`px-3 py-2 rounded flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                    deliveryType === "store_pickup"
                      ? "bg-white text-green-600 border-green-500 border-2 shadow shadow-green-800"
                      : "bg-white border border-gray-300 shadow hover:bg-gray-300"
                  }`}
                  onClick={() => selectDeliveryMethod("pickup")}
                >
                  <TiThumbsOk className="text-xl" />
                  <span className="text-sm">Store Pickup</span>
                </button>
              </div>
            </div>
          </div>

          {/* Always visible section */}
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold">₱{subtotal.toLocaleString()}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="block w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-center"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Order;
