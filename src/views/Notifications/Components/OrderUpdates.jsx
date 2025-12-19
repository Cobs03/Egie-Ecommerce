import React from "react";
import { FiPackage } from "react-icons/fi";
import { supabase } from "../../../lib/supabase";

const OrderUpdates = ({ notifications, onNotificationClick }) => {
  // Helper to get full image URL from Supabase storage
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/40";
    
    // If it's already a full URL, return it
    if (imagePath.startsWith('http')) return imagePath;
    
    // If it's a storage path, get the public URL
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(imagePath);
    
    return data?.publicUrl || "https://via.placeholder.com/40";
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Order placed":
      case "Order Placed":
        return "text-green-600";
      case "Order Shipped":
        return "text-blue-600";
      case "Package Delivered":
        return "text-purple-600";
      case "Order Confirmed":
        return "text-green-700";
      case "Order Processing":
        return "text-yellow-600";
      case "Ready for Pickup":
        return "text-orange-600";
      case "Order Cancelled":
        return "text-red-600";
      default:
        return "text-gray-800";
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No order updates at this time
      </div>
    );
  }

  return (
    <>
      {notifications.map((notification, index) => (
        <div 
          key={notification.id}
          onClick={() => onNotificationClick(notification)}
          className="cursor-pointer hover:bg-gray-50 transition-colors relative"
        >
          <div className="p-4 flex">
            {/* Icon */}
            <div className="bg-gray-200 rounded-full p-3 mr-4 h-cover flex items-center justify-center">
              <FiPackage className="h-5 w-5 text-gray-500" />
            </div>
            
            {/* Content with bold/regular styling based on isRead */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className={`${notification.isRead ? 'font-medium' : 'font-bold'} ${getTypeColor(notification.type)}`}>
                  {notification.type}
                </h3>
                <span className="text-sm text-gray-500">
                  {notification.time}
                </span>
              </div>
              <p className={`text-sm text-gray-600 mb-2 ${notification.isRead ? '' : 'font-bold'}`}>
                {notification.description}
              </p>
              
              {/* Product Thumbnails - Show all products from order */}
              {notification.products && notification.products.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {notification.products.map((product, idx) => (
                    <div 
                      key={`${notification.id}-product-${idx}`} 
                      className="w-12 h-12 bg-gray-200 rounded border border-gray-300 overflow-hidden flex-shrink-0"
                      title={product.alt}
                    >
                      <img 
                        src={getImageUrl(product.image)} 
                        alt={product.alt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/48?text=Product";
                        }}
                      />
                    </div>
                  ))}
                  {/* Show count if more than 4 products */}
                  {notification.products.length > 4 && (
                    <div className="w-12 h-12 bg-gray-300 rounded border border-gray-400 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">
                        +{notification.products.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Read/Unread indicator */}
          {!notification.isRead && (
            <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-green-500"></div>
          )}
          
          {/* Divider - don't show after last item */}
          {index < notifications.length - 1 && (
            <div className="border-t border-green-200 mx-4"></div>
          )}
        </div>
      ))}
    </>
  );
};

export default OrderUpdates;