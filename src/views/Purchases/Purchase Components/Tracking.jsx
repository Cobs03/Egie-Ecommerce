import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserOrderService } from "../../../services/UserOrderService";
import { getImageUrl } from "../../../lib/supabase";
import { MdLocationOn } from "react-icons/md";
import { BsClipboard, BsTruck, BsBox, BsCheck2Circle } from "react-icons/bs";

const Tracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const { data, error } = await UserOrderService.getOrderById(id);
      
      if (error || !data) {
        console.error('Error loading order:', error);
        setOrder(null);
        setLoading(false);
        return;
      }

      setOrder(data);
    } catch (error) {
      console.error('Error in loadOrder:', error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/EGIE LOGO.png"
            alt="Loading"
            className="w-20 h-15 object-contain"
          />
          <div className="w-24 h-24 border-8 border-gray-200 border-t-green-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-md shadow-md">
          <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
          <p className="mb-4">Could not find order with ID: {id}</p>
          <button 
            onClick={() => navigate('/purchases')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Back to My Purchases
          </button>
        </div>
      </div>
    );
  }

  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Determine if pickup or delivery
  const isPickup = order.delivery_type === 'pickup';
  
  // Get tracking statuses based on order data
  const getTrackingStatus = () => {
    const statuses = [
      { 
        id: "placed", 
        label: "ORDER PLACED", 
        date: formatDate(order.created_at), 
        icon: BsClipboard, 
        completed: true 
      },
      { 
        id: "confirmed", 
        label: "ORDER CONFIRMED", 
        date: formatDate(order.confirmed_at), 
        icon: BsBox, 
        completed: !!order.confirmed_at 
      },
      { 
        id: "shipped", 
        label: isPickup ? "READY FOR PICKUP" : "ORDER SHIPPED", 
        date: formatDate(order.shipped_at), 
        icon: BsTruck, 
        completed: !!order.shipped_at 
      },
      { 
        id: "delivered", 
        label: isPickup ? "ORDER PICKED UP" : "ORDER DELIVERED", 
        date: formatDate(order.delivered_at), 
        icon: BsCheck2Circle, 
        completed: !!order.delivered_at 
      }
    ];
    
    return statuses;
  };

  const trackingStatus = getTrackingStatus();
  const isOrderComplete = order.status === "delivered";
  const isCancelled = order.status === "cancelled";
  
  // Address information
  const address = order.shipping_addresses ? {
    name: order.shipping_addresses.full_name || "N/A",
    phone: order.shipping_addresses.phone || "N/A",
    fullAddress: `${order.shipping_addresses.street_address || ''}, ${order.shipping_addresses.barangay || ''}, ${order.shipping_addresses.city || ''}, ${order.shipping_addresses.province || ''} ${order.shipping_addresses.postal_code || ''}`.trim()
  } : null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/purchases')}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to My Purchases</span>
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-4 font-['Bruno_Ace_SC']">
          Order Tracking
        </h1>

        <div className="bg-white rounded-md border border-gray-300 overflow-hidden">
          {/* Status Header */}
          <div className="flex border-b">
            <div className="w-1/2 bg-green-400 p-4 flex items-center justify-center">
              <span className="font-bold">
                {isCancelled ? "ORDER CANCELLED" : isOrderComplete
                  ? "ORDER COMPLETED"
                  : order.status.toUpperCase()}
              </span>
            </div>
            <div className="w-1/2 bg-green-200 p-4 flex items-center">
              <span>Order ID: {order.order_number}</span>
            </div>
          </div>

          {/* Courier Information */}
          {order.courier_name && order.tracking_number && (
            <div className="p-4 bg-blue-50 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Courier</p>
                  <p className="font-semibold">{order.courier_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-semibold">{order.tracking_number}</p>
                </div>
              </div>
            </div>
          )}

          {/* Live Map Tracking - New Section */}
          <div className="border-b border-gray-200">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">Live Tracking</h3>
                <div className="flex items-center text-sm text-green-600">
                  <MdLocationOn className="mr-1" />
                  <span>Updated 5 mins ago</span>
                </div>
              </div>

              {/* Map Container */}
              <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden">
                {order.status === "shipped" && !isCancelled && !isOrderComplete ? (
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61795.39407439568!2d120.98486606674455!3d14.81980389751281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397a9f659525117%3A0xdca571e7c0c59840!2sSanta%20Maria%2C%20Bulacan!5e0!3m2!1sen!2sph!4v1695098455826!5m2!1sen!2sph`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Order Location"
                    className="absolute inset-0"
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {(order.status === "pending" || order.status === "confirmed" || order.status === "processing") ? (
                      <div className="text-center p-4">
                        <BsBox className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          Package is being prepared for shipment
                        </p>
                        <p className="text-sm text-gray-400">
                          Tracking will be available once shipped
                        </p>
                      </div>
                    ) : isCancelled ? (
                      <div className="text-center p-4">
                        <svg
                          className="w-12 h-12 mx-auto text-red-500 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        <p className="text-gray-500">
                          Order has been cancelled
                        </p>
                        <p className="text-sm text-gray-400">
                          Tracking is no longer available
                        </p>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <BsCheck2Circle className="w-12 h-12 mx-auto text-green-500 mb-2" />
                        <p className="text-gray-500">
                          Order has been delivered successfully
                        </p>
                        <p className="text-sm text-gray-400">
                          Thank you for shopping with us!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Delivery ETA - Show only for active deliveries */}
                {order.status === "To Receive" && (
                  <div className="absolute bottom-3 left-3 bg-white p-3 rounded-md shadow-md">
                    <p className="text-xs font-bold">Estimated Delivery</p>
                    <p className="text-sm text-green-600 font-bold">
                      Today, 2:30 PM - 5:30 PM
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="p-8">
            <div className="flex justify-between items-center">
              {trackingStatus.map((status, index) => (
                <React.Fragment key={status.id}>
                  {/* Status Node */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`rounded-full w-12 h-12 flex items-center justify-center 
                      ${
                        status.completed
                          ? "bg-green-500 text-white"
                          : "bg-gray-400 text-white"
                      }`}
                    >
                      <status.icon className="w-6 h-6" />
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-xs font-bold">{status.label}</p>
                      <p className="text-xs text-gray-500">{status.date}</p>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {index < trackingStatus.length - 1 && (
                    <div
                      className={`flex-grow h-1 mx-2 
                      ${
                        trackingStatus[index].completed &&
                        trackingStatus[index + 1].completed
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Address Information */}
          {address && (
            <div className="p-6 border-t border-gray-200">
              <p className="font-bold mb-2">
                {isPickup ? "Pick up Address" : "Delivery Address"}
              </p>
              <div className="flex items-start">
                <MdLocationOn className="text-gray-400 mt-1 mr-2" />
                <div>
                  <p className="font-medium">{address.name} | {address.phone}</p>
                  <p className="text-sm text-gray-600">{address.fullAddress}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-4 flex justify-end space-x-4 border-t border-gray-200">
            <button
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
              onClick={() => navigate("/contactus")}
            >
              Contact Store
            </button>

            {!isCancelled && !isOrderComplete && (
              <button
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
                onClick={() => navigate(`/purchases/details/${id}`)}
              >
                View Order Details
              </button>
            )}

            {isOrderComplete && (
              <button
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
                onClick={() => navigate("/products")}
              >
                Buy Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;