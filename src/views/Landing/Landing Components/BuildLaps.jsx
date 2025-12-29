import React, { useState, useEffect } from "react";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";
import { Link } from "react-router-dom";
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
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

const BuildLaps = ({ set }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  // Helper function to determine stock status based on quantity
  const getStockStatus = (stockQuantity) => {
    if (stockQuantity === 0) return "Out of Stock";
    if (stockQuantity <= 10) return "Low Stock";
    return "In Stock";
  };

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

  // Fetch products from database based on set type
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch all active products
        const { data: allProducts, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active');

        if (error) throw error;

        let filteredProducts = [];

        if (set === "two") {
          // For custom builds, show all products (or you can filter by PC components category)
          filteredProducts = allProducts;
        } else {
          // For laptops, filter by laptop category
          const { data: categories } = await supabase
            .from('product_categories')
            .select('id, name')
            .ilike('name', '%laptop%')
            .limit(1);
          
          if (categories && categories.length > 0) {
            const laptopCategoryId = categories[0].id;
            filteredProducts = allProducts.filter(product => {
              const components = product.selected_components || [];
              return components.some(comp => comp.id === laptopCategoryId);
            });
          }
        }

        // Fetch review counts for each product
        const productsWithReviews = await Promise.all(
          filteredProducts.map(async (product) => {
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
            };
          })
        );

        setProducts(productsWithReviews);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [set]);

  // Use the same products array for both sections (now dynamically filtered)
  const displayProducts = products;

  const title = set === "two" ? "Custom Builds" : "Laptops";

  const background =
    set === "two"
      ? "https://i.ibb.co/WWcLwGxH/4257d09c69455402fc76c66a9313ee5f.jpg"
      : "https://i.ibb.co/R4YSKSL4/b310a539380948d9611d50da5dae969b.jpg";

  return (
    <div 
      ref={ref}
      className={`product-display flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8 transition-all duration-1000 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Custom Build Section */}
      <div
        className="mb-6 lg:mb-0 lg:mr-8 w-full lg:w-64 h-48 lg:h-auto mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center bg-amber-800 rounded-lg p-4 sm:p-6 bg-cover bg-center flex-shrink-0"
        style={{ backgroundImage: `url(${background})` }}
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-100 mb-2 mt-4 lg:mt-30">
          {title}
        </h2>
        <Link
          to="/products"
          className="text-green-400 hover:underline text-base sm:text-lg transition-colors"
        >
          See All Products
        </Link>
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">
              Loading {set === "two" ? "products" : "laptops"}...
            </p>
          </div>
        ) : (
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {displayProducts.map((product, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col p-3 sm:p-4 active:scale-95 active:shadow-sm"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="rounded-md object-contain bg-gray-100 mb-3 sm:mb-4 h-32 sm:h-36 md:h-40 w-full"
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
                          <h4 className="select-none font-medium text-gray-800 overflow-hidden text-ellipsis line-clamp-2 text-sm sm:text-base mb-1">
                            {product.title}
                          </h4>
                          <span className="text-gray-500 select-none text-xs sm:text-sm mb-2">
                            Reviews ({product.reviews})
                          </span>
                          <div className="mt-auto">
                            <div className="flex flex-wrap items-baseline gap-1">
                              <span className="text-indigo-600 font-bold text-sm sm:text-base select-none">
                                {product.displayPrice}
                              </span>
                              {product.displayOldPrice && (
                                <span className="line-through text-gray-400 text-[10px] sm:text-xs select-none">
                                  {product.displayOldPrice}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      sideOffset={6}
                      className="z-50 overflow-hidden rounded-md bg-gray-800 px-3 py-1 text-xs text-white shadow-md"
                    >
                      {product.title}
                    </TooltipContent>
                  </Tooltip>
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
    </div>
  );
};

export default BuildLaps;
