import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCcVisa } from "react-icons/fa";
import { RiMastercardFill } from "react-icons/ri";
import { useCart } from "../../../context/CartContext";
import OrderService from "../../../services/OrderService";
import PayMongoEdgeFunctionService from '../../../services/PayMongoEdgeFunctionService';
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Payment = ({ selectedAddress, onShowGCashModal }) => {
  const navigate = useNavigate();
  const { deliveryType, orderNotes, cartItems, clearSelectedItems, appliedVoucher, loadCart, checkoutItems } = useCart();
  
  // Scroll animations
  const containerAnim = useScrollAnimation({ threshold: 0.1 });
  const paymentOptionsAnim = useScrollAnimation({ threshold: 0.1 });
  
  // Payment state
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Card details (only shown for credit card)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  // Handle form submission
  const handlePayment = async () => {
    // Clear any previous errors
    setError(false);

    // Validate payment method selection
    if (!selectedPayment) {
      setError(true);
      toast.error('Please select a payment method');
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    // Validate cart
    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }
    
    // Validate delivery type
    if (!deliveryType) {
      toast.error('Please select a delivery type in your cart');
      navigate('/cart');
      return;
    }
    
    // Validate address for local delivery
    if (deliveryType === 'local_delivery' && !selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    // Validate card details if credit card is selected
    if (selectedPayment === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardName) {
        toast.error('Please fill in all card details');
        return;
      }
      
      // Validate card number length
      const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, '');
      if (cleanCardNumber.length < 15 || cleanCardNumber.length > 16) {
        toast.error('Invalid card number');
        return;
      }
      
      // Validate expiry date format (MM/YY)
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
        toast.error('Invalid expiry date (use MM/YY format)');
        return;
      }
      
      // Validate CVV
      if (cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4) {
        toast.error('Invalid CVV');
        return;
      }
    }

    setLoading(true);

    try {
      // For Card payments, process through PayMongo
      if (selectedPayment === 'card') {
        await handleCardPayment();
        return;
      }
      
      // For GCash, show billing modal first
      if (selectedPayment === 'gcash') {
        // Get user info to pre-fill the form
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user?.id)
          .single();
        
        const userInfo = {
          email: profile?.email || user?.email || '',
          name: profile?.full_name || ''
        };
        
        // Show modal via parent component with callback
        onShowGCashModal(userInfo, handleGCashPayment);
        setLoading(false);
        return; // Important: return here to prevent further execution
      }

      // For COD and Card, proceed with regular order creation
      // Extract cart_item_ids from checkoutItems
      const cart_item_ids = checkoutItems.map(item => item.id);
      
      const orderData = {
        delivery_type: deliveryType,
        shipping_address_id: deliveryType === 'local_delivery' ? selectedAddress?.id : null,
        customer_notes: orderNotes || null,
        payment_method: selectedPayment === 'card' ? 'credit_card' : selectedPayment,
        voucher: appliedVoucher,
        cart_item_ids: cart_item_ids // Pass selected cart item IDs
      };

      const { data, error: orderError } = await OrderService.createOrder(orderData);

      if (orderError) {
        toast.error('Failed to create order', {
          description: orderError
        });
        setLoading(false);
        return;
      }

      // Cart items are automatically removed by the database function
      // Reload cart to get updated state
      await loadCart();

      navigate("/thankyou", { 
        state: { 
          orderId: data.order_id,
          orderNumber: data.order_number,
          transactionId: data.transaction_id,
          total: data.total,
          paymentMethod: selectedPayment
        } 
      });

      toast.success('Order placed successfully!', {
        description: `Order #${data.order_number}`
      });

    } catch (error) {
      toast.error('Failed to process order', {
        description: 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle GCash payment through PayMongo (called after billing form submission)
  const handleGCashPayment = async (billingInfo) => {
    setLoading(true);
    
    try {
      // First, create the order
      // Extract cart_item_ids from checkoutItems
      const cart_item_ids = checkoutItems.map(item => item.id);
      
      const orderData = {
        delivery_type: deliveryType,
        shipping_address_id: deliveryType === 'local_delivery' ? selectedAddress?.id : null,
        customer_notes: orderNotes || null,
        payment_method: 'gcash',
        voucher: appliedVoucher,
        cart_item_ids: cart_item_ids // Pass selected cart item IDs
      };

      const { data: orderResponse, error: orderError } = await OrderService.createOrder(orderData);

      if (orderError) {
        throw new Error(orderError);
      }

      // Get user information and address for billing
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Use the billing info from the modal
      const billing = {
        name: billingInfo.name,
        email: billingInfo.email,
        phone: billingInfo.phone,
        address: {
          line1: deliveryType === 'local_delivery' && selectedAddress?.address 
            ? selectedAddress.address 
            : 'Store Pickup - No Delivery',
          line2: deliveryType === 'local_delivery' && selectedAddress?.barangay 
            ? selectedAddress.barangay 
            : '',
          city: selectedAddress?.city || 'Manila',
          state: selectedAddress?.province || 'Metro Manila',
          country: 'PH',
          postal_code: selectedAddress?.postal_code || '1000'
        }
      };

      // Prepare redirect URLs with order ID
      const redirectUrl = {
        success: `${window.location.origin}/payment-success?order_id=${orderResponse.order_number}`,
        failed: `${window.location.origin}/payment-failed?order_id=${orderResponse.order_number}`
      };

      // Create GCash payment source
      const sourceResult = await PayMongoEdgeFunctionService.createGCashSource(
        orderResponse.total,
        billing,
        redirectUrl
      );

      if (!sourceResult.success) {
        throw new Error(sourceResult.error || 'Failed to create GCash payment');
      }

      const checkoutUrl = sourceResult.source.attributes.redirect.checkout_url;
      
      if (!checkoutUrl) {
        throw new Error('No checkout URL received from PayMongo');
      }

      // Store PayMongo source ID in order for verification later
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          paymongo_source_id: sourceResult.source.id,
          payment_status: 'pending'
        })
        .eq('id', orderResponse.order_id);

      if (updateError) {
      } else {
      }

      // Cart items are automatically removed by the database function
      // Reload cart to get updated state
      await loadCart();

      // Redirect to GCash payment page
      toast.info('Redirecting to GCash payment...');
      
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 500);

    } catch (error) {
      toast.error(error.message || 'Failed to process GCash payment');
      setLoading(false);
    }
  };

  // Handle Card payment through PayMongo
  const handleCardPayment = async () => {
    try {
      // Parse expiry date (MM/YY)
      const [expMonth, expYear] = cardDetails.expiryDate.split('/');
      
      // Convert 2-digit year to 4-digit year (YY -> YYYY)
      const currentYear = new Date().getFullYear();
      const currentYearShort = currentYear % 100;
      let fullYear;
      
      if (parseInt(expYear) < currentYearShort) {
        fullYear = `21${expYear}`;
      } else {
        fullYear = `20${expYear}`;
      }
      
      // Get user information for billing
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Clean card data before sending
      const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, '');
      const cleanCvv = cardDetails.cvv.substring(0, 3);
      
      console.log('Sending card data:', { 
        number: cleanCardNumber.substring(0, 4) + '****',
        exp_month: expMonth,
        exp_year: fullYear,
        cvc_length: cleanCvv.length
      });

      // Calculate subtotal from checkout items
      const subtotal = checkoutItems.reduce((sum, item) => {
        const price = item.price_at_add || item.price || 0;
        const quantity = item.quantity || 0;
        return sum + (price * quantity);
      }, 0);
      
      // Calculate shipping fee based on delivery type
      const shippingFee = deliveryType === 'store_pickup' ? 0 : 100;
      
      // Apply voucher discount if any
      const voucherDiscount = appliedVoucher ? appliedVoucher.discountAmount : 0;
      
      // Calculate final total
      const totalAmount = subtotal + shippingFee - voucherDiscount;
      
      // PayMongo requires amount in centavos (multiply by 100) and minimum 100 centavos (₱1.00)
      const amountInCentavos = Math.round(totalAmount * 100);
      
      // Validate minimum amount
      if (amountInCentavos < 100) {
        throw new Error('Order total must be at least ₱1.00 for card payment');
      }
      
      console.log('Payment Breakdown:', {
        subtotal: `₱${subtotal.toFixed(2)}`,
        shipping: `₱${shippingFee.toFixed(2)}`,
        discount: `₱${voucherDiscount.toFixed(2)}`,
        total: `₱${totalAmount.toFixed(2)}`,
        centavos: amountInCentavos
      });
      
      // Process card payment FIRST via Edge Function
      const returnUrl = `${window.location.origin}/payment-success`;
      
      const paymentResult = await PayMongoEdgeFunctionService.processCardPayment(
        {
          number: cleanCardNumber,
          exp_month: expMonth,
          exp_year: fullYear,
          cvc: cleanCvv
        },
        {
          name: cardDetails.cardName,
          email: profile?.email || user.email,
          phone: profile?.phone_number || '09000000000',
          address: {
            line1: deliveryType === 'local_delivery' && selectedAddress?.address 
              ? selectedAddress.address 
              : 'Store Pickup',
            line2: deliveryType === 'local_delivery' && selectedAddress?.barangay 
              ? selectedAddress.barangay 
              : '',
            city: selectedAddress?.city || 'Manila',
            state: selectedAddress?.province || 'Metro Manila',
            postal_code: selectedAddress?.postal_code || '1000',
            country: 'PH'
          }
        },
        amountInCentavos,
        'Order Payment',
        {
          order_type: 'ecommerce',
          customer_id: user.id,
          delivery_type: deliveryType
        },
        returnUrl,
        user.id
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Failed to process card payment');
      }

      // Check if 3DS authentication is required
      if (paymentResult.requires3DS && paymentResult.redirectUrl) {
        // Store payment intent and order details in session storage for after redirect
        sessionStorage.setItem('pending_card_payment', JSON.stringify({
          paymentIntentId: paymentResult.paymentIntent.id,
          deliveryType,
          shippingAddressId: deliveryType === 'local_delivery' ? selectedAddress?.id : null,
          customerNotes: orderNotes || null,
          appliedVoucher,
          cartItemIds: checkoutItems.map(item => item.id),
          amount: totalAmount
        }));
        
        toast.info('Redirecting to card authentication...');
        
        setTimeout(() => {
          window.location.href = paymentResult.redirectUrl;
        }, 500);
        return;
      }

      // Payment succeeded without 3DS - now create the order
      if (paymentResult.paymentIntent.status === 'succeeded') {
        const cart_item_ids = checkoutItems.map(item => item.id);
        
        const orderData = {
          delivery_type: deliveryType,
          shipping_address_id: deliveryType === 'local_delivery' ? selectedAddress?.id : null,
          customer_notes: orderNotes || null,
          payment_method: 'credit_card',
          voucher: appliedVoucher,
          cart_item_ids: cart_item_ids,
          paymongo_payment_intent_id: paymentResult.paymentIntent.id
        };

        const { data: orderResponse, error: orderError } = await OrderService.createOrder(orderData);

        if (orderError) {
          toast.error('Payment succeeded but order creation failed. Please contact support.');
          setLoading(false);
          return;
        }

        // Update payment record with order info (non-blocking)
        const { error: paymentUpdateError } = await supabase
          .from('payments')
          .update({ 
            payment_status: 'paid',
            paymongo_payment_intent_id: paymentResult.paymentIntent.id
          })
          .eq('order_id', orderResponse.order_id);
        
        if (paymentUpdateError) {
          console.warn('Failed to update payment record (non-critical):', paymentUpdateError);
        } else {
        }
        
        // Reload cart to reflect removed items
        await loadCart();
        
        toast.success('Payment successful!');
        
        // Small delay to ensure state updates, then navigate
        setTimeout(() => {
          navigate("/thankyou", { 
            state: { 
              orderId: orderResponse.order_id,
              orderNumber: orderResponse.order_number,
              transactionId: orderResponse.transaction_id,
              total: orderResponse.total,
              paymentMethod: 'card'
            } 
          });
        }, 500);
      } else {
        setLoading(false);
        toast.warning('Payment is being processed. Please check your order status.');
      }

    } catch (error) {
      toast.error(error.message || 'Failed to process card payment');
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerAnim.ref}
      className={`p-5 border rounded-lg shadow-md w-full max-w-2xl bg-white transition-all duration-700 ${
        containerAnim.isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-8"
      }`}
    >
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

      <div
        ref={paymentOptionsAnim.ref}
        className={`mb-4 space-y-3 transition-all duration-700 ${
          paymentOptionsAnim.isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
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
            placeholder="Card Number (e.g., 4343 4343 4343 4345)"
            value={cardDetails.cardNumber}
            onChange={(e) => {
              // Format card number with spaces
              let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
              let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
              if (formatted.replace(/\s/g, '').length <= 16) {
                setCardDetails({ ...cardDetails, cardNumber: formatted });
              }
            }}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="MM/YY"
              value={cardDetails.expiryDate}
              onChange={(e) => {
                let value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length >= 2) {
                  value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                setCardDetails({ ...cardDetails, expiryDate: value });
              }}
              className="w-1/2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              maxLength="5"
            />
            <input
              type="text"
              placeholder="CVV"
              value={cardDetails.cvv}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length <= 4) {
                  setCardDetails({ ...cardDetails, cvv: value });
                }
              }}
              className="w-1/2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              maxLength="4"
            />
          </div>
          <input
            type="text"
            placeholder="Name on Card (e.g., JUAN DELA CRUZ)"
            value={cardDetails.cardName}
            onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value.toUpperCase() })}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase text-gray-900 placeholder:text-gray-400"
          />
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
            🔒 Your card details are encrypted and processed securely through PayMongo
          </div>
        </div>
      )}

      {/* Changed from Link to button to handle validation */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`block text-center w-full ${
          loading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
        } text-white py-2 rounded-lg transition-all duration-150 active:scale-95`}
      >
        {loading ? 'Processing...' : 'Place Order'}
      </button>
      </div>
  );
};

export default Payment;
