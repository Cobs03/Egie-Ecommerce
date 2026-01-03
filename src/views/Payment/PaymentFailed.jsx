import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaExclamationCircle } from 'react-icons/fa';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { useWebsiteSettings } from '../../hooks/useWebsiteSettings';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { settings } = useWebsiteSettings();
  
  const containerAnim = useScrollAnimation({ threshold: 0.1 });
  
  const orderId = searchParams.get('order_id');

  const handleRetry = () => {
    if (orderId) {
      navigate(`/checkout?order_id=${orderId}`);
    } else {
      navigate('/cart');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div 
        ref={containerAnim.ref}
        className={`bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center transition-all duration-700 ${
          containerAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="mb-6">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <FaExclamationCircle className="text-red-500 text-5xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Payment Failed
          </h2>
          <p className="text-gray-600">
            We couldn't process your payment. This could be due to:
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Insufficient GCash balance</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Payment was cancelled</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Transaction timeout</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Network connection issues</span>
            </li>
          </ul>
        </div>

        {orderId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Don't worry!</span><br />
              Your order (#{orderId}) is still saved. You can try paying again.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors active:scale-95 transition-transform duration-150"
          >
            Try Again
          </button>
          <button
            onClick={handleBackToHome}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors active:scale-95 transition-transform duration-150"
          >
            Back to Home
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Need help? Contact our support team at {settings?.contactEmail || 'support@egiegameshop.com'}
        </p>
      </div>
    </div>
  );
};

export default PaymentFailed;
