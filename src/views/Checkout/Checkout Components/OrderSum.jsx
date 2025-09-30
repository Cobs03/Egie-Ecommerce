import React, { useState } from "react";

const OrderSum = () => {
  const products = [
    {
      name: 'Lenovo V15 G4 IRU 15.6" FHD Intel Core i5-1335U/8GB DDR4/512GB M.2 SSD',
      price: 29495,
      image: "https://via.placeholder.com/150",
    },
    {
      name: "ASUS VivoBook 14 M415DA AMD Ryzen 5/8GB/256GB SSD",
      price: 23995,
      image: "https://via.placeholder.com/150",
    },
    {
      name: "Acer Aspire 3 Intel Core i3 11th Gen/8GB/512GB SSD",
      price: 20495,
      image: "https://via.placeholder.com/150",
    },
  ];

  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState(null);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  
  const availableDiscounts = [
    { code: "WELCOME10", discount: 0.1, expired: false, usageLimit: 100, currentUsage: 5 },
    { code: "SUMMER20", discount: 0.2, expired: false, usageLimit: 50, currentUsage: 50 },
    { code: "FLASH15", discount: 0.15, expired: true, usageLimit: 200, currentUsage: 45 },
  ];

  const shippingFee = 50;
  const subtotal = products.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = appliedDiscount ? Math.round(subtotal * appliedDiscount.discount) : 0;
  const total = subtotal + shippingFee - discountAmount;

  const handleApplyDiscount = () => {
    setDiscountError(null);
    
    const trimmedCode = discountCode.trim();
    
    if (!trimmedCode) {
      setDiscountError("Please enter a discount code");
      return;
    }
    
    const foundDiscount = availableDiscounts.find(
      discount => discount.code.toLowerCase() === trimmedCode.toLowerCase()
    );
    
    if (!foundDiscount) {
      setDiscountError("Invalid discount code");
      return;
    }
    
    if (foundDiscount.expired) {
      setDiscountError("This discount code has expired");
      return;
    }
    
    if (foundDiscount.currentUsage >= foundDiscount.usageLimit) {
      setDiscountError("This discount code has reached its usage limit");
      return;
    }
    
    setAppliedDiscount(foundDiscount);
  };

  const getErrorStyle = () => {
    if (!discountError) return "";
    
    return "text-sm text-red-600 mt-1";
  };

  return (
    <div className="p-5 border rounded-lg shadow-lg w-full bg-white">
      <div className="flex justify-between max-md:flex-col md:items-start md:gap-2">
        <h2 className="text-lg font-bold mb-2">Order Summary</h2>
        <p className="text-sm text-gray-600 mb-4">
          Order ID: #EGIE-
          {Math.random().toString(36).substring(2, 8).toUpperCase()}
        </p>
      </div>

      <p className="text-sm text-red-500 mt-4 bg-red-100 p-2 rounded-md border border-red-500">
        Currently, refunds are not supported. Please review your order carefully
        before purchase.
      </p>

      <hr className="my-4 stroke-black" />
      <div className="space-y-4">
        {products.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="h-24 w-24 bg-amber-400 rounded mr-4 overflow-hidden">
              <img
                src={item.image}
                alt="Product"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-sm">{item.name}</h3>
              <p className="text-sm text-gray-800">
                ₱{item.price.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Discount code or gift card"
            className={`border rounded-md p-2 w-full ${discountError ? 'border-red-500' : 'border-gray-300'}`}
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
          />
          <button 
            className="bg-green-500 text-white px-2 rounded-lg hover:bg-green-600 cursor-pointer"
            onClick={handleApplyDiscount}
          >
            Apply
          </button>
        </div>
        
        {discountError && (
          <div className={getErrorStyle()}>
            {discountError}
          </div>
        )}
        
        {appliedDiscount && !discountError && (
          <div className="text-sm text-green-600 mt-1">
            Discount code applied: {appliedDiscount.code} ({appliedDiscount.discount * 100}% off)
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₱{subtotal.toLocaleString()}</span>
        </div>
        
        {appliedDiscount && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({appliedDiscount.discount * 100}%)</span>
            <span>-₱{discountAmount.toLocaleString()}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₱{shippingFee.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between font-bold text-base mt-2 text-green-600">
          <span>Total</span>
          <span className="text-xl">₱{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSum;
