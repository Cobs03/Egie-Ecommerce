import React from "react";
import Address from "./Checkout Components/Address";
import Payment from "./Checkout Components/Payment";
import OrderSum from "./Checkout Components/OrderSum";

const Checkout = () => {
  return (
    <div className="flex flex-col justify-center p-3 sm:p-5 item-center">
      <Address />
      {/* Desktop/Tablet Layout - side by side */}
      <div className="hidden md:flex gap-3 mt-5 w-[95%] sm:w-[90%] mx-auto">
        <div className="flex-[4]">
          <OrderSum />
        </div>
        <div className="flex-[1.5]">
          <Payment />
        </div>
      </div>
      
      {/* Mobile Layout - stacked */}
      <div className="flex flex-col md:hidden gap-4 mt-4 w-[95%] mx-auto">
        <div className="w-full">
          <OrderSum />
        </div>
        <div className="w-full sticky bottom-0 z-10">
          <Payment />
        </div>
      </div>
    </div>
  );
};

export default Checkout;