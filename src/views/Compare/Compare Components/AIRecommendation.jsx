import React, { useState, useEffect } from "react";

const AIRecommendation = ({ products, onViewDetails }) => {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Generate AI recommendation when products change
  useEffect(() => {
    if (products.length <= 1) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Simulate AI analysis with a short delay
    const timer = setTimeout(() => {
      // Generate a recommendation based on product specs
      const recommendedProduct = generateRecommendation(products);
      setRecommendation(recommendedProduct);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [products]);

  // Logic to determine which product to recommend
  const generateRecommendation = (productList) => {
    // If we don't have multiple products, don't make a recommendation
    if (!productList || productList.length <= 1) {
      return null;
    }

    // Find the highest rated product or most expensive as a fallback
    const highestRated = productList.reduce((best, current) => {
      const currentRating = parseFloat(current.rating) || 0;
      const bestRating = parseFloat(best.rating) || 0;
      
      if (currentRating > bestRating) {
        return current;
      } else if (currentRating === bestRating) {
        // If ratings are tied, choose the one with better price/performance
        return (current.price / (current.performance || 100)) < 
               (best.price / (best.performance || 100)) ? current : best;
      }
      return best;
    }, productList[0]);

    // Generate explanation based on product type and specs
    const productType = getProductType(productList[0]);
    const index = productList.findIndex(p => p.id === highestRated.id);
    let position = "first";
    if (index === 1) position = "second";
    if (index === 2) position = "third";

    let explanation = `I would recommend the ${position} product because`;

    switch (productType) {
      case "cpu":
        explanation += ` it offers the best balance of core count, clock speed, and power efficiency.`;
        break;
      case "gpu":
        explanation += ` it provides superior graphics performance and value for the price.`;
        break;
      case "ram":
        explanation += ` it has the optimal combination of capacity, speed, and latency.`;
        break;
      case "motherboard":
        explanation += ` it offers the best feature set and expansion capabilities.`;
        break;
      case "storage":
        explanation += ` it delivers the best balance of speed, capacity, and reliability.`;
        break;
      case "psu":
        explanation += ` it provides the most reliable power delivery with good efficiency rating.`;
        break;
      case "case":
        explanation += ` it offers the best cooling potential and component compatibility.`;
        break;
      case "cooling":
        explanation += ` it delivers the best thermal performance with acceptable noise levels.`;
        break;
      default:
        explanation += ` it offers the best overall value based on its specifications.`;
    }

    return {
      product: highestRated,
      explanation,
      index
    };
  };

  // Helper to determine product type
  const getProductType = (product) => {
    if (!product) return "unknown";
    
    const name = (product.productName || product.name || "").toLowerCase();
    
    if (name.includes("cpu") || name.includes("processor")) return "cpu";
    if (name.includes("gpu") || name.includes("graphics")) return "gpu";
    if (name.includes("ram") || name.includes("memory")) return "ram";
    if (name.includes("motherboard")) return "motherboard";
    if (name.includes("ssd") || name.includes("hdd") || name.includes("storage")) return "storage";
    if (name.includes("psu") || name.includes("power")) return "psu";
    if (name.includes("case")) return "case";
    if (name.includes("cooler") || name.includes("fan")) return "cooling";
    
    return "unknown";
  };

  // Don't render anything if we only have 0-1 products
  if (products.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-start mb-4 sm:mb-8 px-3 sm:px-0">
      {/* AI Avatar - responsive sizing */}
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-medium mb-2 sm:mb-0 sm:mr-3">
        AI
      </div>
      
      {/* Recommendation Bubble - adjusts to full width on mobile */}
      <div className="flex-1 bg-white rounded-lg shadow-md p-3 sm:p-4 relative w-full">
        {/* Speech bubble pointer - hidden on mobile, visible on larger screens */}
        <div className="hidden sm:block absolute -left-2 top-4 w-4 h-4 bg-white transform rotate-45"></div>
        
        {loading ? (
          <div className="flex items-center">
            <div className="text-sm sm:text-base mr-2">Analyzing products</div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
            </div>
          </div>
        ) : recommendation ? (
          <div>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base">{recommendation.explanation}</p>
            
            {/* Clickable Product Card - responsive width and padding */}
            <button 
              className="border border-gray-200 rounded-lg p-3 sm:p-4 w-full sm:max-w-xs text-left hover:bg-gray-50 hover:border-green-300 transition-colors group focus:outline-none"
              onClick={() => onViewDetails && onViewDetails(recommendation.product)}
            >
              <div className="font-medium border-b pb-2 mb-2 flex justify-between items-center text-sm sm:text-base">
                <span className="line-clamp-1 mr-2">
                  {recommendation.product.productName || recommendation.product.name}
                </span>
                <span className="text-green-500 whitespace-nowrap text-xs sm:text-sm opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  View details →
                </span>
              </div>
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <img 
                  src={recommendation.product.imageUrl || recommendation.product.image} 
                  alt={recommendation.product.productName || recommendation.product.name}
                  className="h-16 sm:h-24 object-contain"
                />
              </div>
            </button>
          </div>
        ) : (
          <div className="text-sm sm:text-base">
            I need more product information to make a recommendation.
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendation;