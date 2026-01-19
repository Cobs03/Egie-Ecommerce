import React, { useState, useRef, useEffect } from "react";
import SearchFill from "./Product Components/SearchFill";
import ProductGrid from "./ProductGrid/ProductGrid";
import Category from "./Product Components/Category";

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [brandNames, setBrandNames] = useState({});
  const sidebarRef = useRef(null);

  const [filters, setFilters] = useState({
    minPrice: null,
    maxPrice: null,
    brands: [],
    rating: null,
    discounts: [],
  });

  const [tempFilters, setTempFilters] = useState({
    minPrice: null,
    maxPrice: null,
    brands: [],
    rating: null,
    discounts: [],
  });

  const handleFilterChange = (updatedFilters, brandData) => {
    setTempFilters((prev) => ({
      ...prev,
      ...updatedFilters,
    }));
    
    // Store brand names for display
    if (brandData) {
      setBrandNames((prev) => ({ ...prev, ...brandData }));
    }
    
    // On desktop (lg and up), apply filters immediately
    if (window.innerWidth >= 1024) {
      setFilters((prev) => ({
        ...prev,
        ...updatedFilters,
      }));
    }
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setIsSidebarOpen(false);
  };

  const cancelFilters = () => {
    setTempFilters(filters);
    setIsSidebarOpen(false);
  };

  const removeFilter = (filterType, value) => {
    let updated = { ...filters };
    
    if (filterType === 'price') {
      updated.minPrice = null;
      updated.maxPrice = null;
    } else if (filterType === 'brand') {
      updated.brands = updated.brands.filter(b => b !== value);
    } else if (filterType === 'rating') {
      updated.rating = null;
    } else if (filterType === 'discount') {
      updated.discounts = updated.discounts.filter(d => d !== value);
    }
    
    setFilters(updated);
    setTempFilters(updated);
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

  // Calculate active filters count
  const activeFiltersCount = 
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    filters.brands.length +
    (filters.rating ? 1 : 0) +
    filters.discounts.length;

  return (
    <div className="relative bg-slate-300" >
      {/* Mobile Sidebar Toggle Button - Sticky */}
      <div className="lg:hidden fixed top-28 left-4 z-[200] transition-all duration-300">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-green-500 text-white p-3 rounded-lg shadow-lg hover:bg-green-600 transition-colors cursor-pointer relative"
          aria-label="Toggle filters sidebar"
        >
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
              {activeFiltersCount}
            </span>
          )}
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

      {/* Desktop Sidebar Collapse Toggle */}
      <div className={`hidden lg:block fixed top-28 z-[301] transition-all duration-300 ${
        isSidebarCollapsed ? 'left-4' : 'left-[312px]'
      }`}>
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="bg-green-500 text-white p-2 rounded-lg shadow-lg hover:bg-green-600 transition-all cursor-pointer"
          aria-label="Toggle sidebar"
          title={isSidebarCollapsed ? "Expand filters" : "Collapse filters"}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isSidebarCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[250] transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex z-[300] overflow-hidden">
        {/* Sidebar - Dark theme */}
        <div
          ref={sidebarRef}
          className={`fixed lg:relative lg:block z-[300] h-full lg:h-auto transition-all duration-300 ease-in-out ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          } ${isSidebarCollapsed ? 'lg:w-0' : 'lg:w-80'}`}
        >
          <div className={`w-[70vw] lg:w-80 bg-gray-900 h-screen lg:h-auto overflow-y-auto lg:overflow-visible flex-shrink-0 transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:opacity-0 lg:invisible' : 'lg:opacity-100 lg:visible'
          }`}>
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
              filters={tempFilters} 
              onChange={handleFilterChange} 
              selectedCategory={selectedCategory}
            />
            
            {/* Apply/Cancel Buttons - Mobile Only */}
            <div className="lg:hidden sticky bottom-0 bg-gray-900 p-4 border-t border-gray-700 flex gap-3">
              <button
                onClick={cancelFilters}
                className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-all active:scale-95"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - White background */}
        <div className="w-full lg:flex-1 bg-white min-w-0 overflow-x-hidden">
          <div className="p-6 max-w-full">
            <Category
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              className="mb-4 z-20"
            />
            
            {/* Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {(filters.minPrice || filters.maxPrice) && (
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
                    <span>₱{filters.minPrice || 0} - ₱{filters.maxPrice || '∞'}</span>
                    <button
                      onClick={() => removeFilter('price')}
                      className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {filters.brands.map((brandId) => (
                  <div key={brandId} className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                    <span>{brandNames[brandId] || `Brand ${brandId}`}</span>
                    <button
                      onClick={() => removeFilter('brand', brandId)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {filters.rating && (
                  <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-sm font-medium">
                    <span>⭐ {filters.rating}+ Stars</span>
                    <button
                      onClick={() => removeFilter('rating')}
                      className="hover:bg-yellow-200 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {filters.discounts.map((discount) => (
                  <div key={discount} className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium">
                    <span>{discount}</span>
                    <button
                      onClick={() => removeFilter('discount', discount)}
                      className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={() => {
                    setFilters({
                      minPrice: null,
                      maxPrice: null,
                      brands: [],
                      rating: null,
                      discounts: [],
                    });
                    setTempFilters({
                      minPrice: null,
                      maxPrice: null,
                      brands: [],
                      rating: null,
                      discounts: [],
                    });
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-medium underline"
                >
                  Clear All
                </button>
              </div>
            )}
            
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
