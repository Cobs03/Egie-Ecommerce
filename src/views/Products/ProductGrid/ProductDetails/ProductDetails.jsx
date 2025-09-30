import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import TopDetails from "./DetailsComponents/TopDetails";
import TopDetailsBundle from "./DetailsComponents/TopDetailsBundle";
import Description from "./DetailsComponents/Description";
import Reviews from "./DetailsComponents/Reviews";
import CompComponents from "./DetailsComponents/CompComponents";
import Warranty from "./DetailsComponents/Warranty";
import Bundles from "./DetailsComponents/Bundles";

// Import the placeholder data
import { getItemById } from "../../../../data/placeholderData";

const ProductDetails = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type") || "product"; 
  const id = queryParams.get("id") || "product-1"; // Default to first product if no ID

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch with a small delay
    setLoading(true);
    setTimeout(() => {
      const fetchedProduct = getItemById(id);
      setProduct(fetchedProduct);
      setLoading(false);
    }, 300);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Product not found</div>
      </div>
    );
  }

  const isBundle = id.startsWith('bundle-');

  return (
    <div className="mt-10">
      {/* Render different top details component based on type */}
      {isBundle ? (
        <TopDetailsBundle product={product} />
      ) : (
        <TopDetails product={product} />
      )}

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 py-4 sm:py-6 md:py-8 w-full gap-4 sm:gap-6 md:gap-10">
        {/* Details Left - 75% width on desktop */}
        <div className="flex flex-col mb-4 bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md w-full lg:w-3/4">
          <Description product={product} />

          <Reviews product={product} />

          {/* Only show CompComponents for products, not for bundles */}
          {!isBundle && <CompComponents product={product} />}
        </div>

        {/* Details Right - 25% width on desktop */}
        <div className="w-full lg:w-1/4">
          <Warranty product={product} />
          
          {/* Show Bundles component for both products and bundles */}
          <Bundles />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
