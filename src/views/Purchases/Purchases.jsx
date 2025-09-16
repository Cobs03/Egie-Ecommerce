import React, { useState } from "react";
import OrderTabs from "./Purchase Components/OrderTabs";
import OrderCard from "./Purchase Components/OrdersCard";
import purchaseData from "../Data/purchaseData";
// Change this line in Purchases.jsx
import { OrderProvider, useOrders } from './Purchase Components/OrderContext';

const Purchases = ({ orders, setOrders }) => {
  const [activeTab, setActiveTab] = useState("All");
  
  const handleStatusChange = (orderIndex, newStatus, reason = "") => {
    const updatedOrders = [...orders];
    updatedOrders[orderIndex].status = newStatus;

    if (newStatus === "Cancelled") {
      updatedOrders[orderIndex].cancelReason = reason;
      updatedOrders[orderIndex].subStatus = "Cancelled by you";
    } else if (newStatus === "Completed") {
      updatedOrders[orderIndex].subStatus = "Order Completed";
    }

    setOrders(updatedOrders);
  };

  const filteredOrders =
    activeTab === "All"
      ? orders
      : orders.filter((order) => order.status === activeTab);

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

  return (
    <div className="w-full py-6">
      <OrderTabs activeTab={activeTab} onChange={setActiveTab} />
      <div className="mt-6 space-y-6 px-4 md:px-10">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, i) => (
            <OrderCard
              key={i}
              {...order}
              buttons={getButtons(order.status)}
              onStatusChange={(newStatus, reason) =>
                handleStatusChange(i, newStatus, reason)
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
