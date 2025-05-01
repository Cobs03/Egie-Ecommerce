import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

const OrderSummary = () => {
  return (
    <div className="p-4 border-b-2 border-black">
      <h2 className="font-semibold text-4xl mb-2">Order Summary</h2>

      <div className="flex items-start justify-between flex-row">
        <div className="flex items-start gap-3">
          <FaMapMarkerAlt className="text-red-600 mt-1" />
          <div>
            <p className="text-sm font-medium text-gray-600">
              Delivery Address
            </p>
            <p className="text-sm font-semibold">
              Mik ko{" "}
              <span className="text-black font-normal">(+63) 9184549421</span>
            </p>
            <p className="text-sm text-gray-700">
              Blk 69 LOT 96, Dyan Lang Sa Gedil Ng Kanto Poblacion Santa Maria,
              North Luzon, Bulacan 3022
            </p>
          </div>
        </div>

        <button className="text-sm text-blue-600 hover:underline cursor-pointer">
          Change
        </button>
      </div>

    </div>
  );
};

export default OrderSummary;
