import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductModal from "./ProductModal/ProductModal";
import { useProducts } from "../../../hooks/useProducts";
import { useCart } from "../../../context/CartContext";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import ReviewService from "../../../services/ReviewService";
import StarRating from "../../../components/StarRating";
import { SectionLoader } from "../../../components/ui/LoadingIndicator";
import ProductSearchService from "../../../services/ProductSearchService";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Badge } from "@/components/ui/badge";

const ProductGrid = ({ selectedCategory, filters }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [addingToCart, setAddingToCart] = useState(null);
  const [productRatings, setProductRatings] = useState({});
  const [cardsVisible, setCardsVisible] = useState(false);
  
  const { addToCart, user } = useCart();

  // Handle Add to Cart from grid
  const handleAddToCart = async (e, product) => {
    e.stopPropagation(); // Prevent opening the modal
    
    // Check if user is logged in
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    // Auto-select first variant if product has variants
    let selectedVariant = null;
    if (product.variants && product.variants.length > 0) {
      // Get first variant's SKU or name
      selectedVariant = product.variants[0].sku || product.variants[0].name || null;
    }

    // Add to cart with first variant (or null if no variants)
    setAddingToCart(product.id);
    await addToCart({
      product_id: product.id,
      product_name: product.title,
      variant_name: selectedVariant,
      price: product.price,
      quantity: 1
    });
    setAddingToCart(null);
  };

  // Prepare filters for Supabase
  const supabaseFilters = {
    category: selectedCategory,
    brands: filters.brands, // Pass brand IDs array
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    inStock: true // Only show products with stock
  };

  // Use Supabase hook for products
  const { 
    products, 
    loading, 
    error, 
    setFilters 
  } = useProducts(supabaseFilters);

  // Update filters when they change
  useEffect(() => {
    setFilters(supabaseFilters);
  }, [selectedCategory, filters.brands, filters.minPrice, filters.maxPrice, setFilters]);

  // Load ratings for all products
  useEffect(() => {
    const loadRatings = async () => {
      if (!products || products.length === 0) return;
      
      const ratings = {};
      for (const product of products) {
        const { data } = await ReviewService.getProductRatingSummary(product.id);
        if (data) {
          ratings[product.id] = data;
        }
      }
      setProductRatings(ratings);
    };
    
    loadRatings();
  }, [products]);

  // Trigger card animations when products load
  useEffect(() => {
    if (products && products.length > 0) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => setCardsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [products]);

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

  // Use products from database (already filtered by Supabase)
  const allProducts = products || [];
  let filteredProducts = allProducts;

  // Apply search filtering using ProductSearchService
  if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
    filteredProducts = ProductSearchService.searchProducts(
      filteredProducts,
      filters.searchQuery,
      {
        threshold: 0.4,
        minScore: 0.3,
        includeScore: true,
      }
    );
  }

  // Apply additional client-side filters if needed (for filters not handled by Supabase)
  if (filters.rating != null) {
    filteredProducts = filteredProducts.filter(
      (p) => p.rating >= filters.rating
    );
  }

  const itemsPerPage = 20; // Match the 4x5 grid from the image
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredProducts.slice(startIdx, startIdx + itemsPerPage);

  // 🟡 Reset page when filter changes (optional UX boost)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, products]);

  const getPagination = (total, current, delta = 1) => {
    const range = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    range.push(1);
    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < total - 1) range.push("...");
    if (total > 1) range.push(total);

    return range;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col w-full">
        <SectionLoader message="Loading products..." />
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="flex flex-col w-full">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500 text-center">
            <p>Error loading products: {error}</p>
            <p className="text-sm text-gray-500 mt-2">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full">
        {/* No Results Message for Search */}
        {filters.searchQuery && filteredProducts.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-gray-50 rounded-full p-6 mb-6">
              <svg 
                className="w-20 h-20 text-gray-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              We couldn't find any products matching <strong>"{filters.searchQuery}"</strong>. 
              Try adjusting your search or browse our categories.
            </p>
            <button
              onClick={() => window.location.href = '/products'}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
            >
              Browse All Products
            </button>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {paginatedItems.map((product, index) => (
            <div
              key={index}
              onClick={() => setSelectedProduct(product)}
              className={`w-full bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-500 cursor-pointer overflow-hidden group active:scale-95 ${ 
                cardsVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
              style={{
                transitionDelay: cardsVisible ? `${index * 50}ms` : '0ms'
              }}
            >
              <div className="w-full h-32 bg-gray-50 relative overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200 max-w-full"
                  draggable="false"
                />
                {/* Add to Cart Icon Button - Shows on hover */}
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={addingToCart === product.id}
                  className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-green-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Add to Cart"
                >
                  {addingToCart === product.id ? (
                    <div className="animate-spin h-[18px] w-[18px] border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <ShoppingCart size={18} />
                  )}
                </button>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 select-none line-clamp-2 mb-2 break-words">
                  {product.title}
                </p>
                {/* Real ratings from database */}
                <div className="flex items-center gap-1 mb-2">
                  <StarRating 
                    rating={productRatings[product.id]?.average_rating || 0} 
                    size={14} 
                  />
                  <span className="text-xs text-gray-500">
                    {productRatings[product.id]?.total_reviews > 0 
                      ? `(${productRatings[product.id].total_reviews})`
                      : '(0)'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-lg font-bold text-green-600 select-none">
                    ₱{(product.metadata?.officialPrice || product.price)?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {product.metadata?.initialPrice && product.metadata.initialPrice > (product.metadata?.officialPrice || product.price) && (
                    <p className="text-sm text-gray-400 line-through select-none">
                      ₱{product.metadata.initialPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
                {/* Stock Status Display */}
                <p
                  className={`text-xs font-semibold select-none break-words ${getStockStatusColor(
                    product.stockStatus
                  )}`}
                >
                  {product.stockStatus}
                </p>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && filteredProducts.length > 0 && (
          <div className="mt-8 mb-6 flex justify-center">
            <Pagination className="flex flex-wrap justify-center gap-1 sm:gap-2">
              <PaginationContent className="flex flex-wrap justify-center">
                <PaginationItem>
                  <PaginationPrevious
                    className="cursor-pointer text-sm sm:text-base"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  />
                </PaginationItem>

                {getPagination(totalPages, currentPage).map((page, index) => (
                  <PaginationItem key={index} className="cursor-pointer">
                    {page === "..." ? (
                      <span className="px-2 text-gray-500 text-sm sm:text-base">
                        ...
                      </span>
                    ) : (
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => setCurrentPage(page)}
                        className={`text-sm sm:text-base ${
                          currentPage === page ? "bg-green-500 text-white" : ""
                        }`}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    className="cursor-pointer text-sm sm:text-base"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
};

export default ProductGrid;
