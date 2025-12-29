import React, { useState } from "react";
import Address from "./Checkout Components/Address";
import Payment from "./Checkout Components/Payment";
import OrderSum from "./Checkout Components/OrderSum";
import GCashBillingModal from "../../components/shop/GCashBillingModal";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Checkout = () => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showGCashModal, setShowGCashModal] = useState(false);
  const [gcashUserInfo, setGcashUserInfo] = useState({ email: '', name: '' });
  const [gcashCallback, setGcashCallback] = useState(null);
  
  // Scroll animations
  const addressAnim = useScrollAnimation({ threshold: 0.1 });
  const desktopLayoutAnim = useScrollAnimation({ threshold: 0.1 });
  const mobileLayoutAnim = useScrollAnimation({ threshold: 0.1 });
  
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };
  
  const handleShowGCashModal = (userInfo, callback) => {
    setGcashUserInfo(userInfo);
    setGcashCallback(() => callback);
    setShowGCashModal(true);
  };
  
  const handleGCashSubmit = (billingInfo) => {
    if (gcashCallback) {
      gcashCallback(billingInfo);
    }
    setShowGCashModal(false);
  };

  return (
    <>
      {/* GCash Billing Modal - Rendered at top level */}
      <GCashBillingModal
        isOpen={showGCashModal}
        onClose={() => setShowGCashModal(false)}
        onSubmit={handleGCashSubmit}
        defaultEmail={gcashUserInfo.email}
        defaultName={gcashUserInfo.name}
      />
      
      <div className="flex flex-col justify-center p-3 sm:p-5 item-center">
        <div
          ref={addressAnim.ref}
          className={`transition-all duration-700 ${
            addressAnim.isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <Address onAddressSelect={handleAddressSelect} />
      </div>
      {/* Desktop/Tablet Layout - side by side */}
      <div
        ref={desktopLayoutAnim.ref}
        className={`hidden md:flex gap-3 mt-5 w-[95%] sm:w-[90%] mx-auto transition-all duration-700 ${
          desktopLayoutAnim.isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <div className="flex-[4]">
          <OrderSum />
        </div>
        <div className="flex-[1.5]">
          <Payment 
            selectedAddress={selectedAddress} 
            onShowGCashModal={handleShowGCashModal}
          />
        </div>
      </div>
      
      {/* Mobile Layout - stacked */}
      <div
        ref={mobileLayoutAnim.ref}
        className={`flex flex-col md:hidden gap-4 mt-4 w-[95%] mx-auto transition-all duration-700 ${
          mobileLayoutAnim.isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <div className="w-full">
          <OrderSum />
        </div>
        <div className="w-full sticky bottom-0 z-10">
          <Payment 
            selectedAddress={selectedAddress} 
            onShowGCashModal={handleShowGCashModal}
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default Checkout;