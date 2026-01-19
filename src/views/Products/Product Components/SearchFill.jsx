import React, { useState, useEffect } from "react";
import { BrandService } from "../../../services/BrandService";

const SearchFill = ({ filters, onChange, selectedCategory }) => {
  // 🔍 Fetch brands dynamically from database
  const [allBrands, setAllBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  const discounts = ["Christmas Sale", "Seasons", "Top", "Anniversary"];

  const [min, setMin] = useState("500");
  const [max, setMax] = useState("5500");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // 🔄 Fetch brands when component mounts or category changes
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        let result;
        
        if (selectedCategory) {
          // If a category is selected, get brands for that category only
          result = await BrandService.getBrandsByCategory(selectedCategory);
        } else {
          // If no category selected (All Products), get all brands with products
          result = await BrandService.getBrandsWithProducts();
        }

        if (result.success) {
          setAllBrands(result.data);
        } else {
          setAllBrands([]);
        }
      } catch (error) {
        setAllBrands([]);
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
  }, [selectedCategory]); // Re-fetch when category changes

  // 🔄 Clear selected brands when category changes (optional UX improvement)
  useEffect(() => {
    setSelectedBrands([]);
    onChange({ brands: [] });
  }, [selectedCategory]);
  
  // 🔄 Sync with parent filters (for desktop immediate updates)
  useEffect(() => {
    if (filters) {
      setMin(filters.minPrice?.toString() || "500");
      setMax(filters.maxPrice?.toString() || "5500");
      setSelectedBrands(filters.brands || []);
      setSelectedRating(filters.rating || null);
      setSelectedDiscounts(filters.discounts || []);
    }
  }, [filters]);

  const applyPrice = () => {
    onChange({
      minPrice: min ? Number(min) : null,
      maxPrice: max ? Number(max) : null,
    });
  };

  const toggleBrand = (brand) => {
    const updated = selectedBrands.includes(brand.id)
      ? selectedBrands.filter((b) => b !== brand.id)
      : [...selectedBrands, brand.id];
    setSelectedBrands(updated);
    
    // Pass both the brand IDs and the brand name mapping
    const brandNamesMap = {};
    allBrands.forEach(b => {
      if (updated.includes(b.id)) {
        brandNamesMap[b.id] = b.name;
      }
    });
    
    onChange({ brands: updated }, brandNamesMap);
  };

  const toggleDiscount = (discount) => {
    const updated = selectedDiscounts.includes(discount)
      ? selectedDiscounts.filter((d) => d !== discount)
      : [...selectedDiscounts, discount];
    setSelectedDiscounts(updated);
    onChange({ discounts: updated });
  };

  const applyRating = (rating) => {
    setSelectedRating(rating);
    onChange({ rating });
  };

  const clearAll = () => {
    setMin("500");
    setMax("5500");
    setSelectedBrands([]);
    setSelectedDiscounts([]);
    setSelectedRating(null);
    onChange({
      minPrice: null,
      maxPrice: null,
      brands: [],
      rating: null,
      discounts: [],
    }, {});
  };

  return (
    <div className="text-white p-6 h-full bg-gradient-to-b from-gray-900 to-gray-950">
      {/* Header with Icon */}
      <div className="mb-6 pb-4 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-500 bg-opacity-20 p-2 rounded-lg">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            FILTERS
          </h2>
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <label className="block font-semibold text-white text-sm uppercase tracking-wider">
            Price Range
          </label>
        </div>
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Minimum</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₱</span>
              <input
                type="number"
                placeholder="500"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border-2 border-gray-700 bg-gray-800 bg-opacity-60 text-white placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-30 focus:outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Maximum</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₱</span>
              <input
                type="number"
                placeholder="5,500"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border-2 border-gray-700 bg-gray-800 bg-opacity-60 text-white placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-30 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>
        <button
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
          onClick={applyPrice}
        >
          Apply Price
        </button>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-6" />
      {/* Brand Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <label className="block font-semibold text-white text-sm uppercase tracking-wider">
            Brands
          </label>
        </div>
        {loadingBrands ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : allBrands.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-4 bg-gray-800 bg-opacity-40 rounded-lg">No brands available</div>
        ) : (
          <div className="space-y-2">
            {(showAllBrands ? allBrands : allBrands.slice(0, 5))
              .filter((brand) => brand && brand.id && brand.name)
              .map((brand) => (
                <label
                  key={brand.id}
                  className="flex items-center cursor-pointer group p-2.5 rounded-lg hover:bg-gray-800 hover:bg-opacity-50 transition-all duration-150"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      value={brand.id}
                      checked={selectedBrands.includes(brand.id)}
                      onChange={() => toggleBrand(brand)}
                      className="w-5 h-5 text-green-500 bg-gray-800 border-2 border-gray-600 rounded focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 cursor-pointer transition-all"
                    />
                  </div>
                  <span className="ml-3 text-gray-300 group-hover:text-white transition-colors text-sm font-medium">
                    {String(brand.name)}
                  </span>
                  {selectedBrands.includes(brand.id) && (
                    <svg className="w-4 h-4 ml-auto text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              ))}
            {allBrands.length > 5 && (
              <button
                onClick={() => setShowAllBrands(!showAllBrands)}
                className="text-green-500 hover:text-green-400 text-sm font-semibold transition-all mt-2 flex items-center gap-1 hover:gap-2 duration-200"
              >
                {showAllBrands ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Show Less
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Show All ({allBrands.length})
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-6" />
      {/* Rating Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <label className="block font-semibold text-white text-sm uppercase tracking-wider">
            Rating
          </label>
        </div>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              className={`flex items-center space-x-2 w-full p-3 rounded-lg transition-all duration-200 ${
                selectedRating === rating
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 scale-[1.02]"
                  : "bg-gray-800 bg-opacity-40 text-gray-300 hover:bg-opacity-60 hover:scale-[1.01]"
              }`}
              onClick={() => applyRating(rating)}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: rating }, (_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                {Array.from({ length: 5 - rating }, (_, i) => (
                  <svg key={i + rating} className="w-4 h-4 text-gray-600 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium">& up</span>
              {selectedRating === rating && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-6" />
      {/* Discount Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <label className="block font-semibold text-white text-sm uppercase tracking-wider">
            Discounts & Promos
          </label>
        </div>
        <div className="space-y-2">
          {discounts.map((discount) => (
            <label key={discount} className="flex items-center cursor-pointer group p-2.5 rounded-lg hover:bg-gray-800 hover:bg-opacity-50 transition-all duration-150">
              <div className="relative">
                <input
                  type="checkbox"
                  value={discount}
                  checked={selectedDiscounts.includes(discount)}
                  onChange={() => toggleDiscount(discount)}
                  className="w-5 h-5 text-green-500 bg-gray-800 border-2 border-gray-600 rounded focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 cursor-pointer transition-all"
                />
              </div>
              <span className="ml-3 text-gray-300 group-hover:text-white transition-colors text-sm font-medium">{discount}</span>
              {selectedDiscounts.includes(discount) && (
                <svg className="w-4 h-4 ml-auto text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Clear All Button */}
      <div className="sticky bottom-0 bg-gradient-to-t from-gray-950 via-gray-950 to-transparent pt-4 pb-2">
        <button
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-red-500/30 hover:shadow-red-500/50 flex items-center justify-center gap-2"
          onClick={clearAll}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default SearchFill;
