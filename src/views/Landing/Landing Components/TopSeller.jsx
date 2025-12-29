import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";
import { supabase } from "../../../lib/supabase";
import ReviewService from "../../../services/ReviewService";
import { ProductService } from "../../../services/ProductService";
import { useScrollAnimation } from "../../../hooks/useScrollAnimation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const TopSeller = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  // Helper function to get stock status color
  const getStockStatusColor = (stockStatus) => {
    switch (stockStatus) {
      case "In Stock":
        return "text-green-500";
      case "Low Stock":
        return "text-orange-500";
      case "Out of Stock":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  // Fetch top sellers from database based on order counts (same algorithm as admin dashboard)
  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        setLoading(true);
        
        // Use database function to get top sellers (bypasses RLS)
        const { data: topSellersData, error: sellersError } = await supabase
          .rpc('get_top_selling_products', { limit_count: 5 });

        if (sellersError) {
          console.error('Error fetching top sellers:', sellersError);
          throw sellersError;
        }
        
        console.log('Top Sellers data:', topSellersData);
        
        const topProductIds = (topSellersData || []).map(item => item.product_id);
        
        if (topProductIds.length === 0) {
          console.log('No order data found. Using fallback: newest products');
          // Fallback to newest products if no orders
          const { data: fallbackProducts, error: fallbackError } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(5);

          if (fallbackError) throw fallbackError;
          
          const transformed = await Promise.all(
            fallbackProducts.map(async (product) => {
              // Transform product data using ProductService
              const transformedProduct = ProductService.transformProductData(product);
              
              // Get review summary
              const { data: summary } = await ReviewService.getProductRatingSummary(product.id);
              
              return {
                ...transformedProduct,
                reviews: summary?.total_reviews || 0,
                averageRating: summary?.average_rating || 0,
                displayPrice: `₱${transformedProduct.price.toLocaleString()}`,
                displayOldPrice: transformedProduct.oldPrice ? `₱${transformedProduct.oldPrice.toLocaleString()}` : null,
                image: transformedProduct.imageUrl,
              };
            })
          );
          setProducts(transformed);
          setLoading(false);
          return;
        }

        // Fetch product details for top sellers
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', topProductIds)
          .eq('status', 'active');

        if (productsError) throw productsError;

        // IMPORTANT: Maintain the sort order from topProductIds
        // Map products in the exact order they were ranked
        const sortedProducts = await Promise.all(
          topProductIds
            .map(id => productsData.find(p => p.id === id))
            .filter(Boolean)
            .map(async (product) => {
              // Transform product data using ProductService
              const transformedProduct = ProductService.transformProductData(product);
              
              // Get review summary
              const { data: summary } = await ReviewService.getProductRatingSummary(product.id);
              
              return {
                ...transformedProduct,
                reviews: summary?.total_reviews || 0,
                averageRating: summary?.average_rating || 0,
                displayPrice: `₱${transformedProduct.price.toLocaleString()}`,
                displayOldPrice: transformedProduct.oldPrice ? `₱${transformedProduct.oldPrice.toLocaleString()}` : null,
                image: transformedProduct.imageUrl,
              };
            })
        );

        setProducts(sortedProducts);
      } catch (error) {
        console.error('Error fetching top sellers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSellers();
  }, []);

  return (
    <div 
      ref={ref}
      className={`mb-4 p-10 relative transition-all duration-1000 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-2xl font-semibold">TOP SELLERS</h2>
        <Link
          to="/products"
          className="text-green-600 hover:underline font-medium text-sm"
        >
          See all Products
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading top sellers...</p>
        </div>
      ) : (
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product, index) => (
            <CarouselItem
              key={index}
              className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/4 xl:basis-1/5"
            >
              <div
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-3 sm:p-4 cursor-pointer flex flex-col h-full"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="rounded-md mb-3 sm:mb-4 object-contain h-32 sm:h-36 md:h-40 w-full bg-gray-100"
                />
                <div className="flex flex-col flex-grow justify-between">
                  <span
                    className={`text-xs sm:text-sm font-semibold mb-2 select-none ${getStockStatusColor(
                      product.stockStatus
                    )}`}
                  >
                    {product.stockStatus}
                    {product.stock > 0 && ` (${product.stock})`}
                  </span>
                  <h4 className="select-none text-sm sm:text-base lg:text-lg font-medium text-gray-800 mb-1 overflow-hidden text-ellipsis line-clamp-2">
                    {product.title}
                  </h4>
                  <span className="text-gray-500 text-xs sm:text-sm mb-2 select-none">
                    Reviews ({product.reviews})
                  </span>
                  <div className="mt-auto">
                    <div className="flex items-center space-x-2">
                      {product.displayOldPrice && (
                      <span className="line-through text-gray-400 text-xs sm:text-sm select-none">
                        {product.displayOldPrice}
                      </span>
                      )}
                      <span className="text-indigo-600 font-bold text-sm sm:text-base lg:text-lg select-none">
                        {product.displayPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="flex" />
        <CarouselNext className="flex" />
      </Carousel>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default TopSeller;
