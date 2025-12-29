import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserOrderService } from "../../../services/UserOrderService";
import { getImageUrl } from "../../../lib/supabase";
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
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const { data, error } = await UserOrderService.getOrderById(id);
      
      if (error || !data) {
        console.error('Error loading order:', error);
        setOrder(null);
        setLoading(false);
        return;
      }

      // Transform the order data
      let displayStatus = data.status;
      let subStatus = '';
      
      if (data.status === 'pending') {
        displayStatus = 'To Ship';
        subStatus = 'Preparing Parts';
      } else if (data.status === 'confirmed' || data.status === 'processing') {
        displayStatus = 'To Ship';
        subStatus = 'Preparing Your Order';
      } else if (data.status === 'shipped') {
        displayStatus = 'To Receive';
        subStatus = 'Parcel is on the way';
      } else if (data.status === 'ready_for_pickup') {
        displayStatus = 'Store Pick-up';
        subStatus = 'Ready for Pickup';
      } else if (data.status === 'delivered') {
        displayStatus = 'Completed';
        subStatus = data.delivery_type === 'pickup' ? 'Store Pick-up Complete' : 'Order Completed';
      } else if (data.status === 'cancelled') {
        displayStatus = 'Cancelled';
        subStatus = 'Cancelled by you';
      }

      const products = (data.order_items || []).map(item => {
        console.log('Processing order item:', {
          product_name: item.product_name,
          raw_image: item.product_image
        });
        
        const imageUrl = getImageUrl(item.product_image);
        console.log('Processed image URL:', imageUrl);
        
        const itemPrice = Number(item.unit_price) || 0;
        const itemQuantity = Number(item.quantity) || 1;

        return {
          image: imageUrl,
          title: item.product_name || 'Product',
          variant: item.variant_name || null,
          quantity: itemQuantity,
          price: itemPrice.toLocaleString(),
          total: (item.total || (itemPrice * itemQuantity)).toLocaleString()
        };
      });

      const transformedOrder = {
        id: data.id,
        orderId: data.order_number,
        status: displayStatus,
        subStatus: subStatus,
        products: products,
        total: data.total_amount || 0,
        note: data.order_notes || '',
        shippingAddress: data.shipping_addresses,
        payment: data.payments?.[0],
        courierName: data.courier_name,
        trackingNumber: data.tracking_number,
        createdAt: data.created_at,
        rawData: data
      };

      setOrder(transformedOrder);
    } catch (error) {
      console.error('Error in loadOrder:', error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/EGIE LOGO.png"
            alt="Loading"
            className="w-20 h-15 object-contain"
          />
          <div className="w-24 h-24 border-8 border-gray-200 border-t-green-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

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

  // Get address and payment info from order
  const address = order.shippingAddress ? {
    name: order.shippingAddress.full_name || "N/A",
    phone: order.shippingAddress.phone || "N/A",
    address: `${order.shippingAddress.street_address || ''}, ${order.shippingAddress.barangay || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.province || ''} ${order.shippingAddress.postal_code || ''}`.trim(),
  } : null;

  const payment = order.payment ? {
    method: order.payment.payment_method === 'cod' ? 'Cash on Delivery (COD)' : order.payment.payment_method,
    delivery: order.rawData.delivery_type === 'pickup' ? 'Store Pick-up' : 'Local Delivery',
  } : null;

  // Calculate order total
  const orderTotal = order.products.reduce(
    (sum, product) => sum + Number(product.total.toString().replace(/,/g, "")),
    0
  );

  // Order ID for display
  const orderId = order.orderId || order.id;

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
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-all duration-200 active:scale-95 hover:scale-105"
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
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-all duration-200 active:scale-95 hover:scale-105"
              onClick={() => navigate("/contactus")}
            >
              Contact Store
            </Button>
            <Button
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-all duration-200 active:scale-95 hover:scale-105"
              onClick={handleOrderReceived}
            >
              Order Received
            </Button>
          </>
        );
      case "ready-for-pickup":
        return (
          <>
            <Button
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-all duration-200 active:scale-95 hover:scale-105"
              onClick={() => navigate("/contactus")}
            >
              Contact Store
            </Button>
            <Button
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-all duration-200 active:scale-95 hover:scale-105"
              onClick={handleOrderReceived}
            >
              Order Picked Up
            </Button>
          </>
        );
      case "cancelled":
        return (
          <>
            <Button
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-all duration-200 active:scale-95 hover:scale-105"
              onClick={() => navigate("/contactus")}
            >
              Contact Store
            </Button>
            <Button
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-all duration-200 active:scale-95 hover:scale-105"
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
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-all duration-200 active:scale-95 hover:scale-105"
              onClick={() => navigate("/contactus")}
            >
              Contact Store
            </Button>
            <Button
              className="cursor-pointer bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-all duration-200 active:scale-95 hover:scale-105"
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
  const handleCancelOrder = async (reason) => {
    const { error } = await UserOrderService.cancelOrder(order.id, reason);
    if (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order. Please try again.');
      return;
    }
    setIsCancelOpen(false);
    // Reload the order
    loadOrder();
  };

  const handleOrderReceived = async () => {
    const { error } = await UserOrderService.markOrderReceived(order.id);
    if (error) {
      console.error('Failed to mark order as received:', error);
      alert('Failed to update order. Please try again.');
      return;
    }
    // Reload the order
    loadOrder();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/purchases')}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to My Purchases</span>
          </button>
        </div>
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

            {/* Shipping info - Clickable if shipped or delivered (only for delivery orders) */}
            {order.rawData.delivery_type !== 'pickup' && order.rawData.delivery_type !== 'store_pickup' && (
              <div className="p-4 border-b border-gray-200">
                <div 
                  className={`flex items-center justify-between bg-gray-50 rounded-md border border-gray-200 ${
                    (order.rawData.status === 'shipped' || order.rawData.status === 'delivered') 
                      ? 'hover:bg-gray-100 transition-colors cursor-pointer' 
                      : ''
                  }`}
                  onClick={() => {
                    if (order.rawData.status === 'shipped' || order.rawData.status === 'delivered') {
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
                  {(order.rawData.status === 'shipped' || order.rawData.status === 'delivered') && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Delivery/Pickup Address */}
          {address && (
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
          )}

          {/* Store Pickup Message */}
          {(!address && (order.rawData.delivery_type === 'pickup' || order.rawData.delivery_type === 'store_pickup')) && (
          <div className="p-4 border-b border-gray-200">
            <p className="font-bold mb-2">Pick Up Location</p>
            <div className="flex items-start">
              <MdLocationOn className="text-gray-400 mt-1 mr-2" />
              <div>
                <p className="font-medium">Egie Store</p>
                <p className="text-sm text-gray-600">Pick up your order at our store location. You'll be notified when it's ready.</p>
              </div>
            </div>
          </div>
          )}

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
                  {product.variant && (
                    <p className="text-xs text-gray-500">{product.variant}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <p className="mr-8">x {product.quantity}</p>
                <p className="font-bold text-green-600">₱ {product.price}</p>
              </div>
            </div>
          ))}

          {/* Order Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-bold mb-1">Order ID:</p>
                <p className="text-green-600">{orderId}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-4 space-y-2 bg-gray-50 p-4 rounded-lg">
              <p className="font-bold text-sm mb-3">Order Summary</p>
              
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span>₱ {(orderTotal - (order?.rawData?.shipping_fee || 0) + (order?.rawData?.voucher_discount || 0)).toLocaleString()}</span>
              </div>

              {/* Voucher Discount - Only show if voucher was used */}
              {order?.rawData?.voucher_discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">
                    Voucher Discount {order?.rawData?.voucher_code && `(${order.rawData.voucher_code})`}:
                  </span>
                  <span className="text-green-600 font-semibold">
                    -₱ {order.rawData.voucher_discount.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Shipping Fee */}
              {order?.rawData?.shipping_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping Fee:</span>
                  <span>₱ {order.rawData.shipping_fee.toLocaleString()}</span>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-300 my-2"></div>

              {/* Total */}
              <div className="flex justify-between font-bold text-base">
                <span>Order Total:</span>
                <span className="text-green-600">
                  ₱ {orderTotal.toLocaleString()}
                </span>
              </div>
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
        <DialogContent className="sm:max-w-[500px] bg-white">
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
