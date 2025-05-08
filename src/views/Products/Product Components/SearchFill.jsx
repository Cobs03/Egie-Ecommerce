import React, { useState } from "react";

const SearchFill = ({ filters, onChange }) => {
  const brands = ["Intel", "AMD", "NVIDIA", "Corsair"];
  const discounts = ["10% Off", "20% Off", "30% Off", "50% Off"];

  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);

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
    setMin("");
    setMax("");
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
    <div className="bg-gray-100 p-5 border border-gray-300 rounded-md shadow-md w-full mt-4 ml-4">
      <h2 className="text-2xl mb-4">Search Filter</h2>
      <hr className="border-t-2 border-black my-4" />

      {/* Price Range */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">By Price Range</label>
        <div className="flex justify-between gap-2">
          <input
            type="number"
            placeholder="Min"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="w-1/2 p-2 rounded border border-gray-300"
          />
          <input
            type="number"
            placeholder="Max"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="w-1/2 p-2 rounded border border-gray-300"
          />
        </div>
        <button
          className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-800"
          onClick={applyPrice}
        >
          APPLY
        </button>
      </div>
      <hr className="border-t-2 border-black my-4" />

      {/* Brand Filter */}
      <div className="mb-6 w-full">
        <label className="block mb-2 font-medium">Brand</label>
        <ul>
          {brands.map((brand) => (
            <li key={brand} className="flex items-center">
              <input
                type="checkbox"
                id={`brand-${brand}`}
                value={brand}
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="text-blue-600 accent-blue-600"
              />
              <label
                htmlFor={`brand-${brand}`}
                className="text-sm text-gray-700 ml-2"
              >
                {brand}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <hr className="border-t-2 border-black my-4" />

      {/* Rating Filter */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Rating</label>
        <div className="flex flex-col space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              className={`flex items-center space-x-1 ${
                selectedRating === rating
                  ? "bg-yellow-400 text-yellow-900"
                  : "text-yellow-400 hover:bg-yellow-400 hover:text-yellow-900"
              } cursor-pointer p-2 transition duration-200 rounded-2xl`}
              onClick={() => applyRating(rating)}
            >
              {Array.from({ length: rating }, (_, i) => (
                <span key={i}>&#9733;</span>
              ))}
              <span className="text-sm text-gray-700 ml-2">and up</span>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-t-2 border-black my-4" />

      {/* Discount Filter */}
      <div className="mb-2">
        <label className="block mb-2 font-medium">Discount</label>
        <ul className="space-y-2 mb-3">
          {discounts.map((discount) => (
            <li key={discount} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`discount-${discount}`}
                value={discount}
                checked={selectedDiscounts.includes(discount)}
                onChange={() => toggleDiscount(discount)}
                className="text-blue-600 accent-blue-600"
              />
              <label
                htmlFor={`discount-${discount}`}
                className="text-sm text-gray-700"
              >
                {discount}
              </label>
            </li>
          ))}
        </ul>
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-800"
          onClick={clearAll}
        >
          CLEAR ALL
        </button>
      </div>
    </div>
  );
};

export default SearchFill;
