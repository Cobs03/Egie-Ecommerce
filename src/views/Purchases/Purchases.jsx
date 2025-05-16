import React, { useState } from "react";
import OrderTabs from "./Purchase Components/OrderTabs";
import OrderCard from "./Purchase Components/OrdersCard";
import purchaseData from "../Data/purchaseData";

const Purchases = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [orders, setOrders] = useState(purchaseData);

  const handleStatusChange = (orderIndex, newStatus, reason = "") => {
    setOrders((prevOrders) => {
      const updatedOrders = [...prevOrders];
      updatedOrders[orderIndex] = {
        ...updatedOrders[orderIndex],
        status: newStatus,
        subStatus:
          newStatus === "Completed"
            ? "Order Completed"
            : newStatus === "Cancelled"
            ? "Cancelled by you"
            : updatedOrders[orderIndex].subStatus,
        cancelReason:
          newStatus === "Cancelled"
            ? reason
            : updatedOrders[orderIndex].cancelReason,
      };
      return updatedOrders;
    });
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

  const orderTotal = orders
    ? orders.reduce((sum, order) => {
        const orderSum = order.products.reduce(
          (productSum, product) =>
            productSum + Number(product.total.replace(/,/g, "")),
          0
        );
        return sum + orderSum;
      }, 0)
    : 0;

  return (
    <div className="w-full min-h-screen py-6">
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
