import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OrderUpdates from "./Components/OrderUpdates";
import Promotions from "./Components/Promotions";
import NotificationService from "../../services/NotificationService";

const Notification = () => {
  const [activeTab, setActiveTab] = useState("Order Updates");
  const [loading, setLoading] = useState(true);
  const [notificationsState, setNotificationsState] = useState([]);
  const [promotionsState, setPromotionsState] = useState([]);
  const navigate = useNavigate();

  // Fetch notifications from database
  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to real-time updates
    const subscription = NotificationService.subscribeToNotifications((payload) => {
      console.log('Notification update:', payload);
      fetchNotifications(); // Refetch when notifications change
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch notifications based on active tab
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Fetch order updates
      const { data: orderData, error: orderError } = await NotificationService.getUserNotifications('order_update', null, 50);
      console.log('Order notifications fetched:', { data: orderData, error: orderError });
      
      if (!orderError && orderData) {
        // Transform data to match component format
        const transformedOrders = orderData.map(notification => ({
          id: notification.id,
          type: notification.title,
          description: notification.message,
          time: NotificationService.formatNotificationTime(notification.created_at),
          products: (notification.product_images || []).map((img, idx) => ({
            id: idx,
            image: img,
            alt: `Product ${idx + 1}`
          })),
          orderId: notification.order_id,
          orderNumber: notification.order_number,
          isRead: notification.is_read,
          actionType: notification.action_type,
          actionData: notification.action_data
        }));
        setNotificationsState(transformedOrders);
      }

      // Fetch promotions
      const { data: promoData, error: promoError } = await NotificationService.getUserNotifications('promotion', null, 50);
      console.log('Promotion notifications fetched:', { data: promoData, error: promoError });
      
      if (!promoError && promoData) {
        // Transform data to match component format
        const transformedPromos = promoData.map(notification => ({
          id: notification.id,
          type: notification.title,
          description: notification.message,
          time: NotificationService.formatNotificationTime(notification.created_at),
          isRead: notification.is_read,
          actionType: notification.action_type,
          actionData: notification.action_data,
          voucherId: notification.voucher_id,
          discountId: notification.discount_id
        }));
        console.log('Transformed promotions:', transformedPromos);
        setPromotionsState(transformedPromos);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle notification click - mark as read and navigate
  const handleNotificationClick = async (notification) => {
    // Mark as read in database
    await NotificationService.markAsRead(notification.id);
    
    // Update local state
    setNotificationsState(prevNotifications => 
      prevNotifications.map(n => 
        n.id === notification.id 
          ? { ...n, isRead: true }
          : n
      )
    );
    
    // Force refresh notification count in navbar
    window.dispatchEvent(new CustomEvent('notificationRead'));
    
    // Navigate based on action type
    if (notification.actionType === 'view_order' && notification.orderId) {
      navigate(`/purchases/tracking/${notification.orderId}`);
    }
  };
  
  // Handle promotion click
  const handlePromotionClick = async (promotion) => {
    // Mark as read in database
    await NotificationService.markAsRead(promotion.id);
    
    // Update local state
    setPromotionsState(prevPromotions => 
      prevPromotions.map(p => 
        p.id === promotion.id 
          ? { ...p, isRead: true }
          : p
      )
    );

    // Force refresh notification count in navbar
    window.dispatchEvent(new CustomEvent('notificationRead'));

    // Handle action if exists
    if (promotion.actionType === 'view_products' && promotion.actionData?.category) {
      navigate(`/products?category=${promotion.actionData.category}`);
    }
  };
  
  // Mark all as read
  const handleMarkAllAsRead = async () => {
    const category = activeTab === "Order Updates" ? "order_update" : "promotion";
    
    // Mark all as read in database
    const { count } = await NotificationService.markAllAsRead(category);
    
    if (count > 0) {
      // Update local state
      if (activeTab === "Order Updates") {
        setNotificationsState(prevNotifications => 
          prevNotifications.map(n => ({ ...n, isRead: true }))
        );
      } else {
        setPromotionsState(prevPromotions => 
          prevPromotions.map(p => ({ ...p, isRead: true }))
        );
      }
      
      // Force refresh notification count in navbar
      window.dispatchEvent(new CustomEvent('notificationRead'));
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
            disabled={loading}
          >
            Mark all as Read
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : (
          /* Notifications Content */
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
        )}
      </div>
    </div>
  );
};

export default Notification;
