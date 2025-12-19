import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useOrders } from "./OrderContext";

const OrderCard = ({
  status,
  subStatus,
  image,
  title,
  quantity,
  price,
  total,
  note,
  buttons = [],
  onStatusChange,
  cancelReason,
  id,
  products,
  rawData,
}) => {
  const navigate = useNavigate();
  const { updateOrderStatus } = useOrders();
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

  const orderTotal = products
    ? products.reduce(
        (sum, product) => sum + Number(product.total.replace(/,/g, "")),
        0
      )
    : 0;

  const handleButtonClick = (buttonLabel) => {
    switch (buttonLabel) {
      case "Contact Store":
        navigate("/contactus");
        break;
      case "Buy Again":
        navigate("/products");
        break;
      case "Cancel Order":
        setIsCancelOpen(true);
        break;
      case "Order Received":
        onStatusChange("Completed");
        break;
      default:
        break;
    }
  };

  return (
    <div className="border-b p-4 md:p-6 bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex justify-between text-xs font-semibold mb-2">
        <div className={`flex items-center gap-2 text-xs font-semibold ${
          status === "CANCELLED" || status === "Cancelled" 
            ? "text-red-600" 
            : "text-green-600"
        }`}>
          <div>{status.toUpperCase()}</div>

          {/* Divider */}
          <div className={`w-px h-3 ${
            status === "CANCELLED" || status === "Cancelled" 
              ? "bg-red-600" 
              : "bg-green-600"
          }`} />

          <div>{subStatus}</div>
        </div>

        <Link
          to={`/purchases/details/${id}`}
          className="block text-sm cursor-pointer bg-green-500 text-white px-3 py-1 rounded max-md:text-xs"
        >
          View Order Details
        </Link>
      </div>
      <hr className="my-4 border-t border-black" />

      {/* Product Details */}
      {products.map((product, idx) => (
        <div
          key={idx}
          className="flex justify-between items-center gap-3 flex-1 mb-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col text-sm text-gray-700">
              <span className="font-semibold">{product.title}</span>
            </div>
            <div className="text-xs">x{product.quantity}</div>
          </div>

          <div className="text-green-600 font-semibold text-sm whitespace-nowrap">
            ₱{product.price}
          </div>
        </div>
      ))}

      <hr className="my-4 border-t border-black" />

      {/* Total with Voucher Info */}
      <div className="flex justify-between items-center text-sm mb-3">
        {status === "Cancelled" && cancelReason ? (
          <p className="text-xs text-gray-500 text-right">
            Cancelation Reason: {cancelReason}
          </p>
        ) : status !== "Completed" && note ? (
          <div className="text-xs text-gray-500 mb-2">{note}</div>
        ) : (
          <div></div>
        )}
        
        <div className="ml-auto flex flex-col items-end gap-1">
          {/* Show voucher savings if applicable */}
          {rawData?.voucher_discount > 0 && (
            <div className="text-xs text-green-600">
              Voucher Savings: -₱{rawData.voucher_discount.toLocaleString()}
              {rawData?.voucher_code && ` (${rawData.voucher_code})`}
            </div>
          )}
          
          <div>
            <span className="mr-2">Order Total:</span>
            <span className="text-green-600 font-semibold">
              ₱{orderTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        {buttons
          .filter((label) => label !== "Rate") // 🚫 remove Rate button
          .map((label, index) => (
            <Button
              key={index}
              variant="outline"
              className="text-sm cursor-pointer hover:bg-green-500 hover:text-white"
              onClick={() => handleButtonClick(label)}
            >
              {label}
            </Button>
          ))}
      </div>

      {/* Cancel Order Dialog */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>Select Cancellation Reason</DialogTitle>
          </DialogHeader>
          <hr className="my-4 border-t border-black" />
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
                onStatusChange("Cancelled", selectedCancelReason);
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

export default OrderCard;
