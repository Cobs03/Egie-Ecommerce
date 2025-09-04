import React, { useState, useMemo } from "react";
import { components } from "../../Data/components";

const SearchFill = ({ filters, onChange }) => {
  // 🔍 Extract unique brands from components
  const allBrands = useMemo(() => {
    const brandSet = new Set();
    components.forEach((component) => {
      component.products.forEach((product) => {
        brandSet.add(product.brand);
      });
    });
    return Array.from(brandSet);
  }, []);

  const discounts = ["Christmas Sale", "Seasons", "Top", "Anniversary"];

  const [min, setMin] = useState("500");
  const [max, setMax] = useState("5500");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [showAllBrands, setShowAllBrands] = useState(false);

  const applyPrice = () => {
    onChange({
      minPrice: min ? Number(min) : null,
      maxPrice: max ? Number(max) : null,
    });
  };

  const toggleBrand = (brand) => {
    const updated = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(updated);
    onChange({ brands: updated });
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
    });
  };

  return (
    <div className=" text-white p-6 h-full">
      <h2 className="text-2xl font-bold mb-6 text-white">Search Filter</h2>

      {/* Price Range */}
      <div className="mb-8">
        <label className="block mb-4 font-semibold text-white">
          By Price Range
        </label>
        <div className="flex justify-between gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-300 mb-1">Min</label>
            <input
              type="number"
              placeholder="P 500"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="w-full p-3 rounded border border-gray-600 bg-black bg-opacity-50 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none backdrop-blur-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-300 mb-1">Max</label>
            <input
              type="number"
              placeholder="P 5,500"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="w-full p-3 rounded border border-gray-600 bg-black bg-opacity-50 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none backdrop-blur-sm"
            />
          </div>
        </div>
        <button
          className="w-full bg-green-500 text-white py-3 rounded font-semibold hover:bg-green-600 transition-colors"
          onClick={applyPrice}
        >
          APPLY
        </button>
      </div>

      {/* Brand Filter */}
      <div className="mb-8">
        <label className="block mb-4 font-semibold text-white">By Brand</label>
        <div className="space-y-3">
          {allBrands.slice(0, 4).map((brand) => (
            <label key={brand} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                value={brand}
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="w-4 h-4 text-green-500 bg-black bg-opacity-50 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
              />
              <span className="ml-3 text-gray-300">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-8">
        <label className="block mb-4 font-semibold text-white">By Rate</label>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              className={`flex items-center space-x-2 w-full p-2 rounded transition-colors ${
                selectedRating === rating
                  ? "bg-green-500 text-white"
                  : "text-yellow-400 hover:bg-black hover:bg-opacity-30"
              }`}
              onClick={() => applyRating(rating)}
            >
              <div className="flex">
                {Array.from({ length: rating }, (_, i) => (
                  <span key={i} className="text-yellow-400">
                    ★
                  </span>
                ))}
                {Array.from({ length: 5 - rating }, (_, i) => (
                  <span key={i + rating} className="text-gray-600">
                    ☆
                  </span>
                ))}
              </div>
              <span className="text-sm">and up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Discount Filter */}
      <div className="mb-8">
        <label className="block mb-4 font-semibold text-white">
          By Discounts & Promos
        </label>
        <div className="space-y-3">
          {discounts.map((discount) => (
            <label key={discount} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                value={discount}
                checked={selectedDiscounts.includes(discount)}
                onChange={() => toggleDiscount(discount)}
                className="w-4 h-4 text-green-500 bg-black bg-opacity-50 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
              />
              <span className="ml-3 text-gray-300">{discount}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear All Button */}
      <button
        className="w-full bg-green-500 text-white py-3 rounded font-semibold hover:bg-green-600 transition-colors mb-6"
        onClick={clearAll}
      >
        CLEAR ALL
      </button>
    </div>
  );
};

export default SearchFill;
