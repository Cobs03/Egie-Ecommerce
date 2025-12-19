import React from "react";
import { toast } from "sonner";
import { BiSolidCoupon } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const Promotions = ({ promotions, onPromotionClick }) => {
  const navigate = useNavigate();

  // Handle copy code button click
  const handleCopyCode = (code, promotionId) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        toast.success(`Code ${code} has been copied to clipboard`);
        // Mark as read when code is copied
        if (promotionId) {
          onPromotionClick({ id: promotionId });
        }
      })
      .catch(() => {
        toast.error("Failed to copy code");
      });
  };
  
  // Handle promotion click for navigation
  const handlePromotionNavigation = (promotion) => {
    // Mark as read first
    onPromotionClick(promotion);
    // Navigate based on action type
    if (promotion.actionType === 'view_products') {
      navigate("/products");
    }
  };

  if (!promotions || promotions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No promotions at this time
      </div>
    );
  }

  return (
    <>
      {/* Dynamic Promotions from Database */}
      {promotions.map((promotion) => {
        // Extract code from action_data if it's a copy_code action
        const code = promotion.actionType === 'copy_code' ? promotion.actionData?.code : null;
        
        return (
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
                
                {/* Action button - Copy Code or View Products */}
                {code ? (
                  <button
                    onClick={() => handleCopyCode(code, promotion.id)}
                    className="ml-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                  >
                    Copy Code
                  </button>
                ) : promotion.actionType === 'view_products' ? (
                  <button
                    onClick={() => handlePromotionNavigation(promotion)}
                    className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    View Products
                  </button>
                ) : null}
              </div>
            </div>
            
            {/* Read/Unread indicator */}
            {!promotion.isRead && (
              <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-orange-500"></div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default Promotions;