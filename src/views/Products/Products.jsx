import React, { useState, useRef, useEffect } from "react";
import SearchFill from "./Product Components/SearchFill";
import ProductGrid from "./ProductGrid/ProductGrid";
import Category from "./Product Components/Category";

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const [filters, setFilters] = useState({
    minPrice: null,
    maxPrice: null,
    brands: [],
    rating: null,
    discounts: [],
  });

  const handleFilterChange = (updatedFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...updatedFilters,
    }));
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSidebarOpen]);

  return (
    <div className="relative bg-slate-300" >
      {/* Mobile Sidebar Toggle Button */}
      <div className="lg:hidden fixed top-28 left-4 z-[200]">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-green-500 text-white p-3 rounded-lg shadow-lg hover:bg-green-600 transition-colors cursor-pointer "
          aria-label="Toggle filters sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-opacity-50" />
      )}

      <div className="flex z-[300]">
        {/* Sidebar - Dark theme */}
        <div
          ref={sidebarRef}
          className={`fixed lg:relative lg:block z-[300] h-full lg:h-auto transition-transform duration-300 ease-in-out ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="w-[70vw] lg:w-80 bg-gray-900 h-screen lg:h-auto overflow-y-auto lg:overflow-visible">
            {/* Close button for mobile */}
            <div className="lg:hidden flex justify-end p-4">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="bg-green-500 hover:bg-gray-600 text-white p-2 rounded-md transition-colors absolute top-24 right-0"
                aria-label="Close filters sidebar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <SearchFill 
              filters={filters} 
              onChange={handleFilterChange} 
              selectedCategory={selectedCategory}
            />
          </div>
        </div>

        {/* Main Content - White background */}
        <div className="w-full lg:flex-1 bg-white">
          <div className="p-6">
            <Category
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              className="mb-4 z-20"
            />
            <ProductGrid
              className="z-10"
              selectedCategory={selectedCategory}
              filters={filters}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
