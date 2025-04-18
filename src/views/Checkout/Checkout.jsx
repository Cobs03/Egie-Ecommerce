import React from "react";
import Address from "./Address/Address";
import "./Checkout.css";
import Payment from "./Payment/Payment";
import OrderSum from "./OrderSummary/OrderSum";

const Checkout = () => {

    return (
      <div className="checkout-contain">
        <Address />
        <div className="checkout-bottom">
            <Payment />
            <OrderSum />
        </div>
      </div>
    );
}

export default Checkout;