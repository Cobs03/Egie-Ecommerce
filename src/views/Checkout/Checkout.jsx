import React from "react";
import Address from "./Checkout Components/Address";
import Payment from "./Checkout Components/Payment";
import OrderSum from "./Checkout Components/OrderSum";

const Checkout = () => {
  return (
    <div className="flex flex-col justify-center p-5 item-center">
      <Address />
      <div className="flex gap-3 mt-5 w-[90%] mx-auto">
        <div className="flex-[4]">
          <OrderSum />
        </div>
        <div className="flex-[1.5]">
          <Payment />
        </div>
      </div>
    </div>
  );
};

export default Checkout;