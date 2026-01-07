import React, { useState, useEffect } from "react";
import { useCart } from "../../../context/CartContext";
import VoucherService from "../../../services/VoucherService";
import { toast } from "sonner";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const OrderSum = () => {
  const { 
    cartItems: dbCartItems, 
    checkoutItems, // Use checkout items instead of all cart items
    cartTotal, 
    deliveryType, 
    orderNotes, 
    loadCart, 
    appliedVoucher, 
    setAppliedVoucher 
  } = useCart();
  
  // Scroll animations
  const containerAnim = useScrollAnimation({ threshold: 0.1 });
  const productListAnim = useScrollAnimation({ threshold: 0.1 });
  const voucherAnim = useScrollAnimation({ threshold: 0.1 });
  const summaryAnim = useScrollAnimation({ threshold: 0.1 });
  
  useEffect(() => {
    loadCart();
  }, []);

  // Use checkoutItems if available, otherwise fall back to all cart items
  const itemsToDisplay = checkoutItems.length > 0 ? checkoutItems : dbCartItems;

  // Transform database cart items for display
  const products = itemsToDisplay.map(item => ({
    id: item.id,
    name: item.product_name,
    variant: item.variant_name,
    price: item.price_at_add,
    quantity: item.quantity,
    image: item.product_image || "https://via.placeholder.com/150",
  }));

  const [voucherCode, setVoucherCode] = useState("");
  const [voucherError, setVoucherError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Calculate subtotal from selected checkout items only
  const subtotal = itemsToDisplay.reduce((sum, item) => {
    return sum + (item.price_at_add * item.quantity);
  }, 0);

  // Calculate shipping fee based on delivery type
  const shippingFee = deliveryType === 'store_pickup' ? 0 : 100;
  const voucherDiscount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const total = subtotal + shippingFee - voucherDiscount;

  const handleApplyVoucher = async () => {
    setVoucherError(null);
    
    const trimmedCode = voucherCode.trim();
    
    if (!trimmedCode) {
      setVoucherError("Please enter a voucher code");
      return;
    }

    setIsValidating(true);
    
    try {
      const result = await VoucherService.validateVoucher(trimmedCode, subtotal);
      
      if (result.success && result.data.valid) {
        // Store voucher info in cart context
        setAppliedVoucher({
          code: trimmedCode.toUpperCase(),
          voucherId: result.data.voucherId,
          discountAmount: result.data.discountAmount,
          discountType: result.data.discountType,
          voucherValue: result.data.voucherValue
        });
        
        toast.success(`Voucher applied! You saved ₱${result.data.discountAmount.toLocaleString()}`);
        setVoucherCode("");
      } else {
        setVoucherError(result.error || result.data.message);
        toast.error(result.error || result.data.message);
      }
    } catch (error) {
      setVoucherError('Failed to apply voucher. Please try again.');
      toast.error('Failed to apply voucher');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError(null);
    toast.info('Voucher removed');
  };

  const formatVoucherDisplay = () => {
    if (!appliedVoucher) return '';
    
    if (appliedVoucher.discountType === 'percent') {
      return `${appliedVoucher.voucherValue}%`;
    } else {
      return `₱${appliedVoucher.voucherValue.toLocaleString()}`;
    }
  };

  return (
    <div
      ref={containerAnim.ref}
      className={`p-5 border rounded-lg shadow-lg w-full bg-white transition-all duration-700 ${
        containerAnim.isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 -translate-x-8"
      }`}
    >
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
      
      {/* Display delivery type and order notes */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center text-sm">
          <span className="font-semibold mr-2">Delivery:</span>
          <span className="text-gray-700">
            {deliveryType === 'local_delivery' ? 'Local Delivery' : 
             deliveryType === 'store_pickup' ? 'Store Pickup' : 
             'Not selected'}
          </span>
        </div>
        {orderNotes && (
          <div className="text-sm">
            <span className="font-semibold">Order Notes:</span>
            <p className="text-gray-700 mt-1 italic">{orderNotes}</p>
          </div>
        )}
      </div>
      
      <hr className="my-4 stroke-black" />
      
      <div className="space-y-4">
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Your cart is empty</p>
        ) : (
          products.map((item, index) => (
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
                {item.variant && (
                  <p className="text-xs text-gray-600">Variant: {item.variant}</p>
                )}
                <p className="text-sm text-gray-800">
                  ₱{item.price.toLocaleString()} × {item.quantity}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  ₱{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter voucher code"
            className={`border rounded-md p-2 w-full ${voucherError ? 'border-red-500' : 'border-gray-300'}`}
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
            disabled={appliedVoucher || isValidating}
            maxLength={20}
          />
          {!appliedVoucher ? (
            <button 
              className="bg-green-500 text-white px-4 rounded-lg hover:bg-green-600 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-95 transition-transform duration-150"
              onClick={handleApplyVoucher}
              disabled={isValidating || !voucherCode.trim()}
            >
              {isValidating ? 'Validating...' : 'Apply'}
            </button>
          ) : (
            <button 
              className="bg-red-500 text-white px-4 rounded-lg hover:bg-red-600 cursor-pointer active:scale-95 transition-transform duration-150"
              onClick={handleRemoveVoucher}
            >
              Remove
            </button>
          )}
        </div>
        
        {voucherError && (
          <div className="text-sm text-red-600 mt-1">
            {voucherError}
          </div>
        )}
        
        {appliedVoucher && !voucherError && (
          <div className="text-sm text-green-600 mt-1 font-medium">
            ✓ Voucher "{appliedVoucher.code}" applied: {formatVoucherDisplay()} off
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₱{subtotal.toLocaleString()}</span>
        </div>
        
        {appliedVoucher && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Voucher Discount ({appliedVoucher.code})</span>
            <span>-₱{voucherDiscount.toLocaleString()}</span>
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
