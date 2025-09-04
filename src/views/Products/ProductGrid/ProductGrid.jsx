import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProductModal from "./ProductModal/ProductModal";

import { components } from "../../Data/components";

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

  const products = components.flatMap((comp) =>
    comp.products.map((p, index) => ({
      ...p,
      id: `${comp.type}-${index}`, // Unique ID
      type: comp.type,
      title: p.productName,
      price: p.price,
      oldPrice: Math.floor(p.price * 0.8), // 20% discount for demo
      rating: p.ratings || Math.floor(Math.random() * 5) + 1,
      reviews: Math.floor(Math.random() * 50) + 1,
      newArrival: Math.random() < 0.3, // Example random flag
      // Add stock information - you can replace this with actual data
      stock: p.stock || Math.floor(Math.random() * 50), // Random stock for demo
      stockStatus: getStockStatus(p.stock || Math.floor(Math.random() * 50)),
    }))
  );

  let filteredProducts = products;

  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      (p) => p.type === selectedCategory
    );
  }

  if (filters.minPrice != null) {
    filteredProducts = filteredProducts.filter(
      (p) => p.price >= filters.minPrice
    );
  }

  if (filters.maxPrice != null) {
    filteredProducts = filteredProducts.filter(
      (p) => p.price <= filters.maxPrice
    );
  }

  if (filters.brands.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      filters.brands.includes(p.brand)
    );
  }

  if (filters.rating != null) {
    filteredProducts = filteredProducts.filter(
      (p) => p.rating >= filters.rating
    );
  }

  if (filters.discounts.length > 0) {
    // Optional: apply based on a property like `discount` in your data
  }

  const itemsPerPage = 20; // Match the 4x5 grid from the image
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredProducts.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  // 🟡 Reset page when filter changes (optional UX boost)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

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

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {paginatedItems.map((product, index) => (
            <div
              key={index}
              onClick={() => setSelectedProduct(product)}
              className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
            >
              <div className="w-full h-32 bg-gray-50 relative overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                  draggable="false"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 select-none line-clamp-2 mb-2">
                  {product.title}
                </p>
                <p className="text-xs text-gray-500 select-none mb-2">
                  Reviews ({product.reviews})
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-lg font-bold text-green-600 select-none">
                    ₱{product.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400 line-through select-none">
                    ₱{product.oldPrice.toLocaleString()}
                  </p>
                </div>
                {/* Stock Status Display */}
                <p
                  className={`text-xs font-semibold select-none ${getStockStatusColor(
                    product.stockStatus
                  )}`}
                >
                  {product.stockStatus}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
