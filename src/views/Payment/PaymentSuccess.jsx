import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'sonner';
import PayMongoService from '../../services/PayMongoEdgeFunctionService';
import OrderService from '../../services/OrderService';
import { supabase } from '../../lib/supabase';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  
  const orderId = searchParams.get('order_id');
  const sourceId = searchParams.get('source_id');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      if (!orderId) {
        toast.error('Invalid order reference');
        navigate('/');
        return;
      }

      console.log('🔍 Verifying payment for order:', orderId);
      console.log('Source ID:', sourceId);

      // Get order details from database
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          payments (
            id,
            transaction_id,
            payment_status,
            payment_method,
            amount
          )
        `)
        .eq('order_number', orderId)
        .single();

      if (orderError || !orders) {
        console.error('Order not found:', orderError);
        toast.error('Order not found');
        navigate('/');
        return;
      }

      console.log('📦 Order found:', orders);
      const payment = orders.payments[0];

      if (!payment) {
        console.error('No payment record found for order');
        toast.error('Payment record not found');
        navigate('/');
        return;
      }

      // Check if payment is already confirmed
      if (payment.payment_status === 'paid' || payment.payment_status === 'completed') {
        console.log('✅ Payment already confirmed');
        setPaymentVerified(true);
        setIsVerifying(false);
        return;
      }

      // If we have a source ID, verify it with PayMongo
      if (sourceId) {
        console.log('🔍 Verifying PayMongo source:', sourceId);
        const sourceResult = await PayMongoService.getSource(sourceId);
        
        console.log('PayMongo source result:', sourceResult);

        if (sourceResult.success && sourceResult.source.attributes.status === 'chargeable') {
          console.log('✅ Source is chargeable, creating payment...');
          
          // Create payment with PayMongo
          const paymentResult = await PayMongoService.createPayment(
            orders.total_amount,
            sourceId,
            `Order #${orderId}`
          );

          console.log('PayMongo payment result:', paymentResult);

          if (paymentResult.success) {
            // ⭐ CRITICAL: Update payment status to 'paid'
            // This triggers the database trigger to deduct stock!
            const { error: updateError } = await supabase
              .from('payments')
              .update({
                payment_status: 'paid',  // ⭐ This triggers stock deduction!
                paid_at: new Date().toISOString(),
                paymongo_payment_id: paymentResult.payment.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', payment.id);

            if (updateError) {
              console.error('❌ Failed to update payment status:', updateError);
              toast.error('Failed to confirm payment');
              return;
            }

            console.log('✅ Payment status updated to paid - Stock will be deducted automatically');
            setPaymentVerified(true);
            toast.success('Payment confirmed successfully!');
          } else {
            console.error('❌ PayMongo payment creation failed');
            toast.error('Payment verification failed');
          }
        } else {
          console.warn('⚠️ Source is not chargeable:', sourceResult.source?.attributes?.status);
          toast.warning('Payment verification pending');
        }
      } else {
        // No source ID - might be COD or already processed
        console.log('ℹ️ No source ID, order exists');
        setPaymentVerified(true);
      }
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      toast.error('Failed to verify payment: ' + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleViewOrders = () => {
    navigate('/purchases');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <FaSpinner className="animate-spin text-blue-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Verifying Payment
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {orderId && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="text-lg font-semibold text-gray-800">{orderId}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">📧 Confirmation email sent!</span><br />
            Check your email for order details and tracking information.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleViewOrders}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            View My Orders
          </button>
          <button
            onClick={handleBackToHome}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
