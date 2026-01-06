import React, { useState, useEffect } from "react";
import OrderTabs from "./Purchase Components/OrderTabs";
import OrderCard from "./Purchase Components/OrdersCard";
import { UserOrderService } from "../../services/UserOrderService";
import { getImageUrl } from "../../lib/supabase";
import { OrderProvider } from './Purchase Components/OrderContext';
import { toast } from "sonner";
import { useWebsiteSettings } from "../../hooks/useWebsiteSettings";

const Purchases = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useWebsiteSettings();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await UserOrderService.getUserOrders();
      
      if (error) {
        toast.error('Failed to load orders', {
          description: error
        });
        setOrders([]);
        return;
      }

      if (data && Array.isArray(data)) {
        // Transform database orders to match component format
        const transformedOrders = data.map(order => {
          // Map status to purchase page statuses
          let displayStatus = order.status;
          let subStatus = '';
          
          const isPickup = order.delivery_type?.toLowerCase() === 'pickup';
          
          if (order.status === 'pending') {
            displayStatus = isPickup ? 'To Pickup' : 'To Ship';
            subStatus = 'Preparing Parts';
          } else if (order.status === 'confirmed' || order.status === 'processing') {
            displayStatus = isPickup ? 'To Pickup' : 'To Ship';
            subStatus = 'Preparing Your Order';
          } else if (order.status === 'ready_for_pickup') {
            displayStatus = 'Ready for Pickup';
            subStatus = 'Your order is ready! Come pick it up at our store';
          } else if (order.status === 'shipped') {
            displayStatus = 'To Receive';
            subStatus = 'Parcel is on the way';
          } else if (order.status === 'delivered' || order.status === 'completed') {
            displayStatus = 'Completed';
            subStatus = isPickup ? 'Store Pick-up Complete' : 'Order Completed';
          } else if (order.status === 'cancelled') {
            displayStatus = 'Cancelled';
            subStatus = 'Cancelled by you';
          }

          // Process order items with images
          const products = (order.order_items || []).map(item => {
            // Get image URL using helper function
            const imageUrl = getImageUrl(item.product_image);
            
            // Safely handle price (use unit_price from order_items table)
            const itemPrice = Number(item.unit_price) || 0;
            const itemQuantity = Number(item.quantity) || 1;

            return {
              image: imageUrl,
              title: item.product_name || 'Product',
              quantity: itemQuantity,
              price: itemPrice.toLocaleString(),
              total: (item.total || (itemPrice * itemQuantity)).toLocaleString()
            };
          });

          const totalAmount = order.total_amount || (order.subtotal || 0) - (order.discount || 0) + (order.shipping_fee || 0);

          return {
            id: order.id,
            orderId: order.order_number,
            status: displayStatus,
            subStatus: subStatus,
            products: products,
            total: totalAmount,
            note: order.order_notes || '',
            cancelReason: order.order_notes || '',
            deliveryType: order.delivery_type,
            shippingAddress: order.shipping_addresses,
            payment: order.payments?.[0],
            courierName: order.courier_name,
            trackingNumber: order.tracking_number,
            createdAt: order.created_at,
            rawData: order
          };
        });

        setOrders(transformedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      toast.error('Failed to load orders', {
        description: error.message
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (orderId, newStatus, reason = "") => {
    if (newStatus === "Cancelled") {
      const { error } = await UserOrderService.cancelOrder(orderId, reason);
      if (error) {
        toast.error('Failed to cancel order', {
          description: error
        });
        return;
      }
      toast.success('Order cancelled successfully!', {
        description: 'Your order has been cancelled'
      });
    } else if (newStatus === "Completed") {
      const { error } = await UserOrderService.markOrderReceived(orderId);
      if (error) {
        toast.error('Failed to update order', {
          description: error
        });
        return;
      }
      toast.success('Order marked as received!', {
        description: 'Thank you for your purchase'
      });
    }
    
    // Reload orders to get fresh data
    loadOrders();
  };

  const filteredOrders =
    activeTab === "All"
      ? orders
      : activeTab === "Store Pick-up"
      ? orders.filter((order) => {
          const isPickupType = order.deliveryType?.toLowerCase().includes('pickup');
          const isReadyStatus = order.status === "Ready for Pickup";
          return isPickupType || isReadyStatus;
        })
      : orders.filter((order) => order.status === activeTab);

  console.log('🔍 Filter Debug:', {
    activeTab,
    totalOrders: orders.length,
    orderStatuses: orders.map(o => o.status),
    filteredCount: filteredOrders.length,
    filteredOrders: filteredOrders.map(o => ({ id: o.orderId, status: o.status }))
  });

  const getButtons = (status) => {
    switch (status) {
      case "To Ship":
        return ["Contact Store", "Cancel Order"];
      case "Completed":
        return ["Contact Store", "Rate", "Buy Again"];
      case "Cancelled":
        return ["Contact Store", "Buy Again"];
      case "Store Pick-up":
        return ["Contact Store", "Buy Again"];
      case "To Receive":
        return ["Contact Store", "Order Received"];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="w-full py-6 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <div className="text-xl text-gray-600">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <OrderTabs activeTab={activeTab} onChange={setActiveTab} />
      <div className="mt-6 space-y-6 px-4 md:px-10">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, i) => (
            <OrderCard
              key={order.id}
              {...order}
              buttons={getButtons(order.status)}
              onStatusChange={(newStatus, reason) =>
                handleStatusChange(order.id, newStatus, reason)
              }
              cancelReason={order.cancelReason}
            />
          ))
        ) : (
          <p className="text-center text-gray-400 mt-12">
            No orders in this category.
          </p>
        )}
      </div>
    </div>
  );
};

export default Purchases;
