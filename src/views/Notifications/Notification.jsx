import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OrderUpdates from "./Components/OrderUpdates";
import Promotions from "./Components/Promotions";

const Notification = () => {
  const [activeTab, setActiveTab] = useState("Order Updates");
  const navigate = useNavigate();
  
  // Initial notification data
  const initialNotifications = [
    {
      id: 1,
      type: "Order placed",
      description: "Your package (GE#568333) was submitted. Thanks for shopping with EGIE GameShop!",
      time: "18m",
      products: [
        { id: 1, image: "/path/to/product1.jpg", alt: "Gaming Mouse" },
        { id: 2, image: "/path/to/product2.jpg", alt: "Gaming Headset" },
      ],
      orderId: 1
    },
    {
      id: 2,
      type: "Order Shipped",
      description: "Your package (GE#591889) was shipped and will be delivered by J&T. Thanks for shopping with EGIE GameShop!",
      time: "8hr",
      products: [
        { id: 3, image: "/path/to/product3.jpg", alt: "Gaming Keyboard" },
        { id: 4, image: "/path/to/product4.jpg", alt: "Gaming Monitor" },
      ],
      orderId: 2
    },
    {
      id: 3,
      type: "Order Shipped",
      description: "Your package (GE#591889) was shipped and will be delivered by J&T. Thanks for shopping with EGIE GameShop!",
      time: "8hr",
      products: [
        { id: 3, image: "/path/to/product3.jpg", alt: "Gaming Keyboard" },
        { id: 4, image: "/path/to/product4.jpg", alt: "Gaming Monitor" },
      ],
      isRead: false
    },
    {
      id: 4,
      type: "Package Delivered",
      description: "Your package (GE#591889) was shipped and will be delivered by J&T. Thanks for shopping with EGIE GameShop!",
      time: "04/28/25",
      products: [
        { id: 3, image: "/path/to/product3.jpg", alt: "Gaming Keyboard" },
        { id: 4, image: "/path/to/product4.jpg", alt: "Gaming Monitor" },
      ],
      isRead: false
    },
    {
      id: 5,
      type: "Package Delivered",
      description: "Your package (GE#591889) was shipped and will be delivered by J&T. Thanks for shopping with EGIE GameShop!",
      time: "04/28/25",
      products: [
        { id: 3, image: "/path/to/product3.jpg", alt: "Gaming Keyboard" },
        { id: 4, image: "/path/to/product4.jpg", alt: "Gaming Monitor" },
      ],
      isRead: true
    }
  ];
  
  // Initialize state from localStorage or default data
  const [notificationsState, setNotificationsState] = useState(() => {
    // Try to get read status from localStorage
    const readStatus = JSON.parse(localStorage.getItem('notificationReadStatus') || '{}');
    
    // Apply read status to notifications
    return initialNotifications.map(notification => ({
      ...notification,
      isRead: readStatus[notification.id] || notification.isRead || false
    }));
  });
  
  // Initial promotions data
  const initialPromotions = [
    {
      id: 1,
      type: "New Sale",
      description: "Check out our summer sale! Up to 50% off on gaming peripherals.",
      time: "1d",
      isRead: false
    },
    {
      id: 2,
      type: "Special Offer",
      description: "Buy one get one free on selected gaming chairs this weekend only!",
      time: "2d",
      isRead: false
    }
  ];
  
  // Initialize promotions state from localStorage
  const [promotionsState, setPromotionsState] = useState(() => {
    const readStatus = JSON.parse(localStorage.getItem('promotionReadStatus') || '{}');
    
    return initialPromotions.map(promotion => ({
      ...promotion,
      isRead: readStatus[promotion.id] || promotion.isRead || false
    }));
  });

  // Save read status to localStorage whenever notifications change
  useEffect(() => {
    const readStatus = {};
    notificationsState.forEach(notification => {
      readStatus[notification.id] = notification.isRead;
    });
    localStorage.setItem('notificationReadStatus', JSON.stringify(readStatus));
  }, [notificationsState]);
  
  // Save promotion read status to localStorage
  useEffect(() => {
    const readStatus = {};
    promotionsState.forEach(promotion => {
      readStatus[promotion.id] = promotion.isRead;
    });
    localStorage.setItem('promotionReadStatus', JSON.stringify(readStatus));
  }, [promotionsState]);

  // Handle notification click - mark as read and navigate
  const handleNotificationClick = (notification) => {
    // Mark this notification as read
    setNotificationsState(prevNotifications => 
      prevNotifications.map(n => 
        n.id === notification.id 
          ? { ...n, isRead: true }
          : n
      )
    );
    
    // Navigate to tracking page
    if (notification.orderId) {
      navigate(`/purchases/tracking/${notification.orderId}`);
    }
  };
  
  // Handle promotion click
  const handlePromotionClick = (promotion) => {
    setPromotionsState(prevPromotions => 
      prevPromotions.map(p => 
        p.id === promotion.id 
          ? { ...p, isRead: true }
          : p
      )
    );
  };
  
  // Mark all as read
  const handleMarkAllAsRead = () => {
    if (activeTab === "Order Updates") {
      setNotificationsState(prevNotifications => 
        prevNotifications.map(n => ({ ...n, isRead: true }))
      );
    } else {
      setPromotionsState(prevPromotions => 
        prevPromotions.map(p => ({ ...p, isRead: true }))
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-100 min-h-screen">
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6 font-['Bruno_Ace_SC']">
          Notifications
        </h1>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab("Order Updates")}
            className={`px-4 py-2 font-medium ${
              activeTab === "Order Updates"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-600"
            }`}
          >
            Order Updates
          </button>
          <button
            onClick={() => setActiveTab("Promotions")}
            className={`px-4 py-2 font-medium ${
              activeTab === "Promotions"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-600"
            }`}
          >
            Promotions
          </button>

          <button
            onClick={handleMarkAllAsRead}
            className="ml-auto text-sm text-gray-600 hover:text-green-600"
          >
            Mark all as Read
          </button>
        </div>

        {/* Notifications Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === "Order Updates" && (
            <OrderUpdates 
              notifications={notificationsState}
              onNotificationClick={handleNotificationClick}
            />
          )}

          {activeTab === "Promotions" && (
            <Promotions 
              promotions={promotionsState}
              onPromotionClick={handlePromotionClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
