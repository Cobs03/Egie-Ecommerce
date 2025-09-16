import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrders } from "./OrderContext";
import { MdLocationOn, MdMyLocation } from "react-icons/md";
import { BsClipboard, BsTruck, BsDownload, BsCheck2Circle, BsBox } from "react-icons/bs";
import { TfiPackage } from "react-icons/tfi";

const Tracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useOrders();
  
  // Find order from context using ID
  const order = orders.find((o) => o.id === Number(id));
  
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-md shadow-md">
          <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
          <p className="mb-4">Could not find order with ID: {id}</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Determine if pickup or delivery
  const isPickup = order.status === "Store Pick-up" || order.status === "To Pickup";
  
  // Get tracking statuses based on order status
  const getTrackingStatus = () => {
    const statuses = [
      { id: "placed", label: "ORDER PLACED", date: "06-22-2025 08:00", icon: BsClipboard, completed: true },
      { id: "shipped", label: "ORDER SHIP", date: "06-23-2025 09:00", icon: BsTruck, completed: false },
      { 
        id: isPickup ? "pickup" : "received", 
        label: isPickup ? "ORDER READY FOR PICK UP" : "ORDER RECEIVED", 
        date: "06-24-2025 10:00", 
        icon: isPickup ? TfiPackage : BsDownload, 
        completed: false 
      },
      { id: "completed", label: "ORDER COMPLETE", date: "06-25-2025 11:00", icon: BsCheck2Circle, completed: false }
    ];
    
    // Set status completed flags based on order status
    switch (order.status) {
      case "To Ship":
        statuses[0].completed = true;
        break;
      case "To Receive":
        statuses[0].completed = statuses[1].completed = true;
        break;
      case "Store Pick-up":
        statuses[0].completed = statuses[1].completed = true;
        break;
      case "Completed":
        statuses[0].completed = statuses[1].completed = statuses[2].completed = statuses[3].completed = true;
        break;
      default:
        break;
    }
    
    return statuses;
  };

  const trackingStatus = getTrackingStatus();
  const isOrderComplete = order.status === "Completed";
  
  // Address information
  const address = {
    name: "Mik ko",
    phone: "(+63) 9184549421",
    fullAddress: "Blk 69 LOT 96, Poblacion, Santa Maria, North Luzon, Bulacan 3022"
  };
  
  // The order ID from the order or a default
  const orderId = order.orderId || "12345678qwerty";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 font-['Bruno_Ace_SC']">
          Order Tracking
        </h1>

        <div className="bg-white rounded-md border border-gray-300 overflow-hidden">
          {/* Status Header */}
          <div className="flex border-b">
            <div className="w-1/2 bg-green-400 p-4 flex items-center justify-center">
              <span className="font-bold">
                {isOrderComplete
                  ? "ORDER COMPLETED"
                  : order.status.toUpperCase()}
              </span>
            </div>
            <div className="w-1/2 bg-green-200 p-4 flex items-center">
              <span>Order ID: {orderId}</span>
            </div>
          </div>

          {/* Live Map Tracking - New Section */}
          <div className="border-b border-gray-200">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">Live Tracking</h3>
                <div className="flex items-center text-sm text-green-600">
                  <MdMyLocation className="mr-1" />
                  <span>Updated 5 mins ago</span>
                </div>
              </div>

              {/* Map Container */}
              <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden">
                {!isOrderComplete &&
                order.status !== "To Ship" &&
                order.status !== "Cancelled" ? (
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61795.39407439568!2d120.98486606674455!3d14.81980389751281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397a9f659525117%3A0xdca571e7c0c59840!2sSanta%20Maria%2C%20Bulacan!5e0!3m2!1sen!2sph!4v1695098455826!5m2!1sen!2sph"
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
                    {order.status === "To Ship" ? (
                      <div className="text-center p-4">
                        <BsBox className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          Package is being prepared for shipment
                        </p>
                        <p className="text-sm text-gray-400">
                          Tracking will be available once shipped
                        </p>
                      </div>
                    ) : order.status === "Cancelled" ? (
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
          <div className="p-6 border-t border-gray-200">
            <p className="font-bold mb-2">
              {isPickup ? "Pick up Address" : "Delivery Address"}
            </p>
            <div className="flex items-start">
              <MdLocationOn className="text-gray-400 mt-1 mr-2" />
              <div>
                <p className="font-medium">{address.name}</p>
                <p className="text-sm text-gray-600">{address.phone}</p>
                <p className="text-sm text-gray-600">{address.fullAddress}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 flex justify-end space-x-4 border-t border-gray-200">
            <button
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
              onClick={() => navigate("/contactus")}
            >
              Contact Store
            </button>

            {isPickup && order.status === "Store Pick-up" && (
              <button
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
                onClick={() => {
                  updateOrderStatus(Number(id), "Completed");
                  // Force reload to show updated status
                  window.location.reload();
                }}
              >
                Order Picked up
              </button>
            )}

            {isOrderComplete && !isPickup && (
              <>
                <button
                  className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
                  onClick={() => navigate("/products")}
                >
                  Buy Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;