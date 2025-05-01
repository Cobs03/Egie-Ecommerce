import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProductModal from "./ProductModal/ProductModal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Badge } from "@/components/ui/badge";


const ProductGrid = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = Array.from({ length: 1220 }, (_, index) => ({
    id: index + 1,
    title: `Product ${index + 1}`,
    price: `P ${5999 + index * 100}`,
    rating: `${5 - (index % 3)} ⭐`,
    newArrival: index % 2 === 0,
  }));

  const itemsPerPage = 40;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedItems = products.slice(startIdx, startIdx + itemsPerPage);


  
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
      <div className="flex flex-col ml-[17.5rem]">
        <div className="grid grid-cols-5 gap-5">
          {paginatedItems.map((product, index) => (
            <div
              key={index}
              onClick={() => setSelectedProduct(product)}
              className="bg-white rounded shadow-md p-3 w-[200px] cursor-pointer hover:shadow-lg transition duration-200"
            >
              <div className="w-full h-[150px] bg-gray-300 rounded"></div>
              <div className="pt-3">
                <p className="text-sm font-medium">{product.title}</p>
                <p className="text-lg font-bold text-red-600">
                  {product.price}
                </p>
                <p className="text-gray-500 text-sm">{product.rating}</p>
                {product.newArrival && (
                  <Badge
                    variant="outline"
                    className="bg-green-500 text-white hover:bg-green-600"
                  >
                    New Arrivals
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              />
            </PaginationItem>

            {getPagination(totalPages, currentPage).map((page, index) => (
              <PaginationItem key={index}>
                {page === "..." ? (
                  <span className="px-2 text-gray-500">...</span>
                ) : (
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                    className={`${
                      currentPage === page ? "bg-green-400 text-white" : ""
                    }`}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
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
