import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProductModal from "./ProductModal/ProductModal";

import {components} from "../../Data/components";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Badge } from "@/components/ui/badge";


const ProductGrid = ({selectedCategory, filters}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = components.flatMap((comp) =>
    comp.products.map((p, index) => ({
      ...p,
      id: `${comp.type}-${index}`, // Unique ID
      type: comp.type,
      title: p.productName,
      price: `₱ ${p.price}`,
      rating: `${p.ratings} ⭐`, // You can customize or calculate this
      newArrival: Math.random() < 0.5, // Example random flag
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
    (p) => p.price.replace(/[₱, ]/g, "") >= filters.minPrice
  );
}

if (filters.maxPrice != null) {
  filteredProducts = filteredProducts.filter(
    (p) => p.price.replace(/[₱, ]/g, "") <= filters.maxPrice
  );
}

if (filters.brands.length > 0) {
  filteredProducts = filteredProducts.filter((p) =>
    filters.brands.includes(p.brand)
  );
}

if (filters.rating != null) {
  filteredProducts = filteredProducts.filter(
    (p) => p.ratings >= filters.rating
  );
}

if (filters.discounts.length > 0) {
  // Optional: apply based on a property like `discount` in your data
}



  const itemsPerPage = 40;
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
      <div className="flex flex-col w-[97%] mt-4">
        <div className="grid grid-cols-5 gap-5">
          {paginatedItems.map((product, index) => (
            <div
              key={index}
              onClick={() => setSelectedProduct(product)}
              className="bg-white rounded shadow-md p-3 w-[200px] cursor-pointer hover:shadow-lg transition duration-200"
            >
              <div className="w-full h-[150px] bg-gray-300 rounded">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="max-w-full h-full select-none"
                  draggable="false"
                />
              </div>
              <div className="pt-3">
                <p className="text-sm font-medium select-none">
                  {product.title}
                </p>
                <p className="text-lg font-bold text-red-600 select-none">
                  {product.price}
                </p>
                <p className="text-gray-500 text-sm select-none">
                  {product.rating}
                </p>
                {product.newArrival && (
                  <Badge
                    variant="outline"
                    className="bg-green-500 text-white hover:bg-green-600 select-none"
                  >
                    New Arrivals
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <Pagination className="mt-6 mb-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              />
            </PaginationItem>

            {getPagination(totalPages, currentPage).map((page, index) => (
              <PaginationItem key={index} className="cursor-pointer">
                {page === "..." ? (
                  <span className="px-2 text-gray-500">...</span>
                ) : (
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                    className={`${
                      currentPage === page ? "bg-green-400 text-white " : ""
                    }`}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                className="cursor-pointer"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
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
