import React from "react";
import "./Payment.css";
import {Link} from "react-router-dom";

const   Payment = () => {
    return (
      <div className="payment-container">
        <h2>Payment</h2>
        <p>All transactions are secure and encrypted.</p>
        <div className="payment-options">
          <div className="card">
            <span>BillEase | Buy Now, Pay Later. No card required.</span>
          </div>
          <p>
            After clicking "Pay now", you will be redirected to BillEase | Buy
            Now, Pay Later. No card required, to complete your purchase
            securely.
          </p>
          <div className="payment-methods">
            <label>
              <input type="radio" name="payment" /> Payments By Xendit
            </label>
            <label>
              <input type="radio" name="payment" /> Cash on Delivery (COD)
            </label>
          </div>
        </div>
        <div className="billing-address">
          <h3>Billing address</h3>
          <label>
            <input type="checkbox" /> Same as shipping address
          </label>
          <label>
            <input type="checkbox" /> Use a different billing address
          </label>
        </div>
        <Link to="/checkout/thankyou" className="pay-button">Pay now</Link>
      </div>
    );
}

export default Payment; 