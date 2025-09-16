import React from "react";
import { toast } from "sonner";
import { BiSolidCoupon } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const Promotions = ({ promotions, onPromotionClick }) => {
  const navigate = useNavigate();
  
  // Discount codes for promotions
  const discounts = [
    {
      id: "disc1",
      title: "New Discounts",
      description: "Use the code 11111 for a 20% discount",
      code: "11111",
      time: "1d"
    },
    {
      id: "disc2", 
      title: "Summer Sale",
      description: "Use the code SUMMER25 for a 25% discount on all accessories",
      code: "SUMMER25",
      time: "3d"
    },
    {
      id: "disc3",
      title: "Back to School",
      description: "Use the code BTS30 for 30% off on laptops and tablets",
      code: "BTS30",
      time: "5d"
    }
  ];

  // Handle copy code button click
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        toast.success(`Code ${code} has been copied to clipboard`);
      })
      .catch(() => {
        toast.error("Failed to copy code");
      });
  };
  
  // Handle promotion click for navigation
  const handlePromotionNavigation = (promotion) => {
    // Mark as read first
    onPromotionClick(promotion);
    // Navigate to products page
    navigate("/products");
  };

  if (promotions.length === 0 && discounts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No promotions at this time
      </div>
    );
  }

  return (
    <>
      {/* Discount Promotions */}
      {discounts.map((discount) => (
        <div 
          key={discount.id}
          className="border-b border-gray-200 hover:bg-gray-50"
        >
          <div className="p-4">
            {/* Header with time at top right */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-800">
                {discount.title}
              </h3>
              <span className="text-sm text-gray-500">
                {discount.time}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <BiSolidCoupon className="text-gray-500" />
                </div>
                
                {/* Content */}
                <div>
                  <p className="text-sm text-gray-600">
                    {discount.description}
                  </p>
                </div>
              </div>
              
              {/* Copy button */}
              <button
                onClick={() => handleCopyCode(discount.code)}
                className="ml-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Copy Code
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Regular Promotions - now with same design */}
      {promotions.map((promotion, index) => (
        <div 
          key={promotion.id}
          className="border-b border-gray-200 hover:bg-gray-50 relative"
        >
          <div className="p-4">
            {/* Header with time at top right */}
            <div className="flex justify-between items-start mb-2">
              <h3 className={`${promotion.isRead ? 'font-medium' : 'font-bold'} text-gray-800`}>
                {promotion.type}
              </h3>
              <span className="text-sm text-gray-500">
                {promotion.time}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <BiSolidCoupon className="text-gray-500" />
                </div>
                
                {/* Content */}
                <div>
                  <p className={`text-sm text-gray-600 ${promotion.isRead ? '' : 'font-bold'}`}>
                    {promotion.description}
                  </p>
                </div>
              </div>
              
              {/* View Products button for sales/offers */}
              {(promotion.type === "New Sale" || promotion.type === "Special Offer") && (
                <button
                  onClick={() => handlePromotionNavigation(promotion)}
                  className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  View Products
                </button>
              )}
            </div>
          </div>
          
          {/* Read/Unread indicator */}
          {!promotion.isRead && (
            <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-orange-500"></div>
          )}
        </div>
      ))}
    </>
  );
};

export default Promotions;