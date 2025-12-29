import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import TopDetails from "./DetailsComponents/TopDetails";
import TopDetailsBundle from "./DetailsComponents/TopDetailsBundle";
import Description from "./DetailsComponents/Description";
import Reviews from "./DetailsComponents/Reviews";
import CompComponents from "./DetailsComponents/CompComponents";
import Warranty from "./DetailsComponents/Warranty";
import Bundles from "./DetailsComponents/Bundles";

// Import Supabase service
import { ProductService } from "../../../../services/ProductService";
import ProductAnalyticsService from "../../../../services/ProductAnalyticsService";
import { supabase } from "../../../../lib/supabase";

const ProductDetails = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type") || "product"; 
  const id = queryParams.get("id"); // Get product ID from URL

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch product from database
        const result = await ProductService.getProductById(id);
        
        if (result.success && result.data) {
          setProduct(result.data);
          
          // Track product view for analytics
          const { data: { user } } = await supabase.auth.getUser();
          await ProductAnalyticsService.trackProductView(id, user?.id);
        } else {
          setError(result.error || "Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <div className="text-xl text-gray-600">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-2xl font-bold text-red-500 mb-2">Product not found</div>
          <p className="text-gray-600 mb-4">{error || "The product you're looking for doesn't exist."}</p>
          <a 
            href="/products" 
            className="inline-block bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
          >
            Back to Products
          </a>
        </div>
      </div>
    );
  }

  const isBundle = type === 'bundle';

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
