// src/contexts/OrderContext.jsx
import React, { createContext, useState, useContext } from "react";

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);

  const updateOrderStatus = (orderId, newStatus, reason = "") => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            status: newStatus,
            subStatus:
              newStatus === "Completed"
                ? "Order Completed"
                : newStatus === "Cancelled"
                ? "Cancelled by you"
                : order.subStatus,
            cancelReason: newStatus === "Cancelled" ? reason : order.cancelReason,
          }
        : order
    );
    
    setOrders(updatedOrders);
  };

  return (
    <OrderContext.Provider value={{ orders, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}