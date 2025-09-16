import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrders } from "./OrderContext";
import { MdLocationOn, MdChevronRight } from "react-icons/md";
import { IoShieldCheckmark } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useOrders();
  const [orderStatus, setOrderStatus] = useState("preparing");
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState("");

  const cancelReasons = [
    "I ordered by mistake",
    "Item won't arrive on time",
    "Found a better price elsewhere",
    "Change of mind",
    "Ordered wrong item",
    "Others",
  ];

  // Find the order using the ID from URL params
  const order = orders.find((o) => o.id === Number(id));

  useEffect(() => {
    // Set status based on order data when it loads
    if (order) {
      switch (order.status) {
        case "To Ship":
          setOrderStatus("preparing");
          break;
        case "To Receive":
          setOrderStatus("on-the-way");
          break;
        case "Store Pick-up":
          setOrderStatus("ready-for-pickup");
          break;
        case "Completed":
          setOrderStatus("completed");
          break;
        case "Cancelled":
          setOrderStatus("cancelled");
          break;
        default:
          setOrderStatus("preparing");
      }
    }
  }, [order]);

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

  // Static address and payment info
  const address = {
    name: "Mik ko",
    phone: "(+63) 9184549421",
    address:
      "Blk 69 LOT 96, Poblacion, Santa Maria, North Luzon, Bulacan 3022",
  };
  const payment = {
    method: "Cash on Delivery (COD)",
    delivery: "Standard Shipping",
  };

  // Calculate order total
  const orderTotal = order.products.reduce(
    (sum, product) => sum + Number(product.total.replace(/,/g, "")),
    0
  );

  // Order ID for display
  const orderId = "12345678qwerty";

  // Status messages based on order state
  const getStatusMessage = () => {
    switch (orderStatus) {
      case "preparing":
        return "PREPARING YOUR ORDER!";
      case "on-the-way":
        return "YOUR ORDER IS COMING FOR YOU!";
      case "ready-for-pickup":
        return "YOUR ORDER IS READY FOR PICK UP!";
      case "cancelled":
        return "YOUR ORDER IS CANCELLED!";
      case "completed":
        return "YOUR ORDER IS COMPLETE!";
      default:
        return "PROCESSING YOUR ORDER!";
    }
  };

  // Shipping status based on order state
  const getShippingInfo = () => {
    switch (orderStatus) {
      case "preparing":
        return {
          title: "Parcel is preparing",
          subtitle: "Preparing for shipment",
          date: "06-17-2025 8:30",
        };
      case "on-the-way":
        return {
          title: "Order on the way",
          subtitle: "Package in transit",
          date: "06-17-2025 8:30",
        };
      case "ready-for-pickup":
        return {
          title: "Waiting for your arrival",
          subtitle: "Ready for pickup",
          date: "06-18-2025 9:00",
        };
      case "cancelled":
        return {
          title: "Parcel is Cancelled by you",
          subtitle: "Shipping cancelled",
          date: "06-17-2025 8:30",
        };
      case "completed":
        return {
          title: "Parcel is delivered",
          subtitle: "Shipping completed",
          date: "06-17-2025 8:30",
        };
      default:
        return {
          title: "Processing",
          subtitle: "Order received",
          date: "06-17-2025 8:30",
        };
    }
  };

  // Get the address label based on status
  const getAddressLabel = () => {
    return orderStatus === "ready-for-pickup"
      ? "Pick up Address"
      : "Delivery Address";
  };

  // Get appropriate action buttons based on order status
  const getActionButtons = () => {
    switch (orderStatus) {
      case "preparing":
        return (
          <>
            <Button
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
              onClick={() => navigate("/contactus")}
            >
              Contact Store
            </Button>
            <Button
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
              onClick={() => setIsCancelOpen(true)}
            >
              Cancel Order
            </Button>
          </>
        );
      case "on-the-way":
        return (
          <>
            <Button
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
              onClick={() => navigate("/contactus")}
            >
              Contact Store
            </Button>
            <Button
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
              onClick={() => {
                updateOrderStatus(Number(id), "Completed");
                setOrderStatus("completed");
              }}
            >
              Order Received
            </Button>
          </>
        );
      case "ready-for-pickup":
        return (
          <>
            <Button
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
              onClick={() => navigate("/contactus")}
            >
              Contact Store
            </Button>
            <Button
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
              onClick={() => {
                updateOrderStatus(Number(id), "Completed");
                setOrderStatus("completed");
              }}
            >
              Order Picked Up
            </Button>
          </>
        );
      case "cancelled":
        return (
          <>
            <Button
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
              onClick={() => navigate("/contactus")}
            >
              Contact Store
            </Button>
            <Button
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
              onClick={() => navigate("/products")}
            >
              Buy Again
            </Button>
          </>
        );
      case "completed":
        return (
          <>
            <Button
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
              onClick={() => navigate("/contactus")}
            >
              Contact Store
            </Button>
            <Button
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
              onClick={() => navigate("/products")}
            >
              Buy Again
            </Button>
          </>
        );
      default:
        return (
          <Button
            className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
            onClick={() => navigate("/contactus")}
          >
            Contact Store
          </Button>
        );
    }
  };

  // Get border color based on status
  const getBorderColor = () => {
    if (
      orderStatus === "ready-for-pickup" ||
      orderStatus === "cancelled" ||
      orderStatus === "completed"
    ) {
      return "border-blue-500";
    }
    return "border-gray-300";
  };

  const shippingInfo = getShippingInfo();

  // Handle status changes
  const handleCancelOrder = (reason) => {
    updateOrderStatus(Number(id), "Cancelled", reason);
    setIsCancelOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 font-['Bruno_Ace_SC']">
          Order Details
        </h1>

        {/* Main card */}
        <div
          className={`bg-white rounded-md border ${getBorderColor()} overflow-hidden`}
        >
          <div className="flex flex-row max-md:flex-col justify-between ">
            {/* Status box */}
            <div className="p-4 border-b border-gray-200 w-auto">
              <div className="bg-green-400 text-black p-4 rounded-md">
                <p className="font-medium">{getStatusMessage()}</p>
              </div>
            </div>

            {/* Shipping info - Clickable to view tracking */}
            <div className="p-4 border-b border-gray-200">
              <div
                className="flex items-center justify-between bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/purchases/tracking/${id}`)}
                role="button"
                tabIndex={0}
                aria-label="View order tracking"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/purchases/tracking/${id}`);
                  }
                }}
              >
                <div className="p-4">
                  <p className="font-bold">Shipping Information</p>
                  <p className="text-sm text-gray-500">
                    {shippingInfo.subtitle}
                  </p>
                </div>
                <div className="p-4 flex items-center">
                  <div className="flex items-center">
                    {orderStatus === "completed" && (
                      <IoShieldCheckmark className="mr-2 text-xl text-green-500" />
                    )}
                    <div>
                      <p className="font-medium text-green-600">
                        {shippingInfo.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {shippingInfo.date}
                      </p>
                    </div>
                  </div>
                  <MdChevronRight className="ml-2 text-xl text-green-500" />{" "}
                  {/* Changed to green for better visibility */}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-4 border-b border-gray-200">
            <p className="font-bold mb-2">{getAddressLabel()}</p>
            <div className="flex items-start">
              <MdLocationOn className="text-gray-400 mt-1 mr-2" />
              <div>
                <p className="font-medium">
                  {address.name} {address.phone}
                </p>
                <p className="text-sm text-gray-600">{address.address}</p>
              </div>
            </div>
          </div>

          {/* Products */}
          {order.products.map((product, idx) => (
            <div
              key={idx}
              className="p-4 border-b border-gray-200 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="w-20 h-20 bg-gray-200 rounded mr-4 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{product.title}</p>
                  <p className="text-xs text-gray-500">Laptop</p>
                </div>
              </div>
              <div className="flex items-center">
                <p className="mr-8">x {product.quantity}</p>
                <p className="font-bold text-green-600">₱ {product.price}</p>
              </div>
            </div>
          ))}

          {/* Order Info */}
          <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between">
            <div>
              <p className="font-bold mb-1">Order ID:</p>
              <p className="text-green-600">{orderId}</p>
            </div>
            <div className="text-right">
              <p className="font-bold mb-1">Order Total:</p>
              <p className="text-green-600 font-bold">
                ₱ {orderTotal.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-4 border-b border-gray-200">
            <p className="font-bold mb-1">Payment Method:</p>
            <p>{payment.method}</p>
          </div>

          {/* Cancellation Reason - Only show when cancelled */}
          {orderStatus === "cancelled" && (
            <div className="p-4 border-b border-gray-200 bg-red-50">
              <p className="font-bold mb-1 text-red-600">Cancellation Reason:</p>
              <div className="flex items-start mt-2">
                <svg
                  className="w-5 h-5 text-red-500 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <p className="text-gray-700">
                  {order.cancelReason || "No reason provided"}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-4 flex justify-end space-x-4">
            {getActionButtons()}
          </div>
        </div>
      </div>

      {/* Status Controls for Demo - You would remove this in production */}
      {/* <div className="max-w-4xl mx-auto mt-8 p-4 bg-white rounded-md border border-gray-300">
        <p className="font-bold mb-4">Change Order Status (Demo Controls):</p>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setOrderStatus("preparing")}
            className={`${
              orderStatus === "preparing" ? "bg-blue-600" : "bg-gray-500"
            } text-white`}
          >
            Preparing
          </Button>
          <Button
            onClick={() => setOrderStatus("on-the-way")}
            className={`${
              orderStatus === "on-the-way" ? "bg-blue-600" : "bg-gray-500"
            } text-white`}
          >
            On the Way
          </Button>
          <Button
            onClick={() => setOrderStatus("ready-for-pickup")}
            className={`${
              orderStatus === "ready-for-pickup" ? "bg-blue-600" : "bg-gray-500"
            } text-white`}
          >
            Ready for Pickup
          </Button>
          <Button
            onClick={() => setOrderStatus("cancelled")}
            className={`${
              orderStatus === "cancelled" ? "bg-blue-600" : "bg-gray-500"
            } text-white`}
          >
            Cancelled
          </Button>
          <Button
            onClick={() => setOrderStatus("completed")}
            className={`${
              orderStatus === "completed" ? "bg-blue-600" : "bg-gray-500"
            } text-white`}
          >
            Completed
          </Button>
        </div>
      </div> */}

      {/* Cancel Order Dialog */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Cancellation Reason</DialogTitle>
          </DialogHeader>
          <RadioGroup
            value={selectedCancelReason}
            onValueChange={setSelectedCancelReason}
            className="space-y-2"
          >
            {cancelReasons.map((reason, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem id={`cancel-reason-${idx}`} value={reason} />
                <label
                  htmlFor={`cancel-reason-${idx}`}
                  className="text-sm cursor-pointer"
                >
                  {reason}
                </label>
              </div>
            ))}
          </RadioGroup>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelOpen(false);
                setSelectedCancelReason("");
              }}
              className="cursor-pointer"
            >
              Not Now
            </Button>
            <Button
              onClick={() => {
                handleCancelOrder(selectedCancelReason);
              }}
              disabled={!selectedCancelReason}
              className="bg-red-500 text-white hover:bg-red-600 cursor-pointer"
            >
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetails;
