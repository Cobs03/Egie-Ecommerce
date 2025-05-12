import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import OrderDetails from "./OrderDetails";

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
}) => {
  const navigate = useNavigate();
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    author: "",
    rating: 0,
    comment: "",
  });
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

  const handleReviewSubmit = () => {
    // Handle review submission logic here
    console.log("Review submitted:", newReview);
    setIsRatingOpen(false);
    setNewReview({ author: "", rating: 0, comment: "" });
  };

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
      case "Rate":
        setIsRatingOpen(true);
        break;
      case "Order Received":
        // Update order status to Completed
        onStatusChange("Completed");
        break;
      default:
        break;
    }
  };

  return (
    <div className="border-b p-4 md:p-6 bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex justify-between text-xs text-green-600 font-semibold mb-2">
        <div className="flex items-center gap-2 text-xs text-green-600 font-semibold">
          <div>{status.toUpperCase()}</div>

          {/* Divider */}
          <div className="w-px h-3 bg-green-600" />

          <div>{subStatus}</div>
        </div>

        <Link
          to={`/purchases/details/${id}`}
          className="block text-sm cursor-pointer bg-green-500 text-white px-3 py-1 rounded"
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
            <div className="w-15 h-15 bg-gray-200 rounded overflow-hidden">
              {/* <img src={product.image} alt="Product" /> */}
            </div>
            <div className="flex flex-col text-sm text-gray-700">
              <span className="font-semibold">{product.title}</span>
              <span className="text-xs text-gray-400">
                Product details here
              </span>
            </div>
            <div className="text-xs">x{product.quantity}</div>
          </div>

          <div className="text-green-600 font-semibold text-sm whitespace-nowrap">
            ₱{product.price}
          </div>
        </div>
      ))}

      <hr className="my-4 border-t border-black" />

      {/* Total */}
      <div className="flex justify-between items-center text-sm mb-3">
        {/* Optional Note or Cancelation Reason */}
        {status === "Cancelled" && cancelReason ? (
          <p className="text-xs text-gray-500 text-right">
            Cancelation Reason: {cancelReason}
          </p>
        ) : status !== "Completed" && note ? (
          <div className="text-xs text-gray-500 mb-2">{note}</div>
        ) : (
          <div></div>
        )}
        <div className="ml-auto">
          <span className="mr-2">Order Total:</span>
          <span className="text-green-600 font-semibold">
            ₱{orderTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        {buttons.map((label, index) => (
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

      {/* Rating Dialog */}
      <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Your name"
              value={newReview.author}
              onChange={(e) =>
                setNewReview({ ...newReview, author: e.target.value })
              }
            />

            <div>
              <p className="mb-1">Rating</p>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className={`cursor-pointer text-2xl ${
                      star <= newReview.rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="What did you like or dislike?"
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button
              onClick={handleReviewSubmit}
              className="cursor-pointer hover:bg-green-500 hover:text-white"
            >
              Post Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-[500px]">
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
                // Change order status to Cancelled and store reason
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
