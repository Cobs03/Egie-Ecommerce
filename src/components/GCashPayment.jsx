import React, { useState } from 'react';
import { toast } from 'sonner';
import PayMongoService from '../services/PayMongoService';
import { FaMobileAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const GCashPayment = ({ amount, orderData, onSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);

  const handleGCashPayment = async () => {
    setIsProcessing(true);

    try {
      // Create billing details from order data
      const billing = {
        name: orderData.customerName,
        email: orderData.customerEmail,
        phone: orderData.customerPhone || '09000000000',
        address: {
          line1: orderData.shippingAddress,
          city: orderData.city || 'Manila',
          state: orderData.province || 'Metro Manila',
          country: 'PH',
          postal_code: orderData.postalCode || '1000'
        }
      };

      // Create redirect URLs
      const redirectUrl = {
        success: `${window.location.origin}/payment-success?order_id=${orderData.orderId}`,
        failed: `${window.location.origin}/payment-failed?order_id=${orderData.orderId}`
      };

      // Create GCash source
      const sourceResult = await PayMongoService.createGCashSource(
        amount,
        billing,
        redirectUrl
      );

      if (!sourceResult.success) {
        throw new Error(sourceResult.error || 'Failed to create GCash payment');
      }

      const source = sourceResult.source;
      
      // Get checkout URL
      const checkoutUrl = source.attributes.redirect.checkout_url;
      
      if (!checkoutUrl) {
        throw new Error('No checkout URL received from PayMongo');
      }

      // Store source ID in order metadata for later verification
      if (onSuccess) {
        await onSuccess({
          sourceId: source.id,
          paymentMethod: 'gcash',
          status: 'pending'
        });
      }

      // Redirect to GCash payment page
      window.location.href = checkoutUrl;

    } catch (error) {
      console.error('GCash payment error:', error);
      toast.error(error.message || 'Failed to process GCash payment');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <div className="bg-blue-500 text-white p-3 rounded-full mr-4">
          <FaMobileAlt size={24} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Pay with GCash</h3>
          <p className="text-sm text-gray-600">Fast and secure mobile payment</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <FaCheckCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">How it works:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Click "Pay with GCash" button</li>
              <li>You'll be redirected to GCash payment page</li>
              <li>Enter your GCash mobile number</li>
              <li>Approve payment in your GCash app</li>
              <li>You'll be redirected back after payment</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Order Amount:</span>
          <span className="text-xl font-bold text-gray-800">
            ₱{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          <FaExclamationCircle className="inline mr-1" />
          Payment is processed securely through PayMongo
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleGCashPayment}
          disabled={isProcessing}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
            isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            'Pay with GCash'
          )}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="mt-4 text-xs text-center text-gray-500">
        <p>🔒 Your payment information is encrypted and secure</p>
        <p className="mt-1">Powered by PayMongo</p>
      </div>
    </div>
  );
};

export default GCashPayment;
