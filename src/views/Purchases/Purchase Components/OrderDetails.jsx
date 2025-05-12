import React, { useState } from "react";
import { useParams } from "react-router-dom";
import purchaseData from "../../Data/purchaseData";
import { Link } from "react-router-dom";
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
  const order = purchaseData.find((order) => order.id === Number(id));

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

  if (!order) {
    return <div className="p-6">Order not found.</div>;
  }

  // Static address and payment info
  const address = {
    name: "Mik ko",
    phone: "(+63) 9184549421",
    address:
      "Blk 69 LOT 96, Dyan Lang Sa Gedli Ng Kanto, Poblacion, Santa Maria, North Luzon, Bulacan 3022",
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

  return (
    <div className=" min-h-screen p-6">
      <div className="bg-white rounded shadow p-6 max-w-4xl mx-auto">
        {/* Order Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-xs text-gray-500">Order ID: {order.id}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Order Placed</div>
            <div className="font-semibold">May 03, 2025</div>
          </div>
        </div>
        <hr className="my-4 border-t border-black" />
        <div className="flex items-center gap-4 flex-wrap flex-col w-full">
          {order.products.map((product, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center gap-2 mb-2 w-full"
            >
              <div className="flex items-center gap-2">
                <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                  {/* <img src={product.image} alt="Product" className="w-20 h-20 object-cover rounded" /> */}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="font-semibold">{product.title}</div>
                  <div className="text-xs">x {product.quantity}</div>
                </div>
              </div>

              <div className="text-xs">Price: ₱{product.price}</div>
            </div>
          ))}
        </div>
        <hr className="my-4 border-t border-black" />
        {/* Order Summary */}
        <div>
          <div className="text-2xl font-bold mt-2 text-right">
            Order Total:{" "}
            <span className="text-green-600">
              ₱{orderTotal.toLocaleString()}
            </span>
          </div>
        </div>
        <hr className="my-4 border-t border-black" />
        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Delivery Address */}
          <div>
            <div className="font-semibold mb-1">Delivery Address</div>
            <div className="text-xs">
              <div>
                <span className="font-bold">Name:</span> {address.name}
              </div>
              <div>
                <span className="font-bold">Phone:</span> {address.phone}
              </div>
              <div>
                <span className="font-bold">Address:</span> {address.address}
              </div>
            </div>
          </div>
          {/* Billing Address */}
          <div>
            <div className="font-semibold mb-1">Billing Address</div>
            <div className="text-xs">
              <div>
                <span className="font-bold">Name:</span> {address.name}
              </div>
              <div>
                <span className="font-bold">Phone:</span> {address.phone}
              </div>
              <div>
                <span className="font-bold">Address:</span> {address.address}
              </div>
            </div>
          </div>
          {/* Payment Method */}
          <div>
            <div className="font-semibold mb-1">Payment Method</div>
            <div className="text-xs mb-2">{payment.method}</div>
            <div className="font-semibold mb-1">Delivery Method</div>
            <div className="text-xs">{payment.delivery}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-4">
          <Button
            className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={() => setIsCancelOpen(true)}
          >
            Cancel order
          </Button>
          <Link
            to="/products"
            className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Continue shopping
          </Link>
        </div>
      </div>

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
                // Here you would update the order status in your state or backend
                setIsCancelOpen(false);
                setSelectedCancelReason("");
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
