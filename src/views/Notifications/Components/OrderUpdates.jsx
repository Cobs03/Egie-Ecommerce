import React from "react";
import { FiPackage } from "react-icons/fi";

const OrderUpdates = ({ notifications, onNotificationClick }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case "Order placed":
        return "text-green-600";
      case "Order Shipped":
        return "text-blue-600";
      case "Package Delivered":
        return "text-purple-600";
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
              
              {/* Product Thumbnails */}
              <div className="flex space-x-2">
                {notification.products?.map(product => (
                  <div 
                    key={product.id} 
                    className="w-10 h-10 bg-gray-200 rounded overflow-hidden"
                  >
                    <img 
                      src="https://via.placeholder.com/40" 
                      alt={product.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
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