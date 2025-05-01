import React from "react";

const SearchFill = () => {
  const brands = ["Intel", "AMD", "NVIDIA", "Corsair"];
  const discounts = ["10% Off", "20% Off", "30% Off", "50% Off"];

  return (
    <div className="bg-gray-100 p-5 w-64 border border-gray-300 rounded-md shadow-md absolute top-40">
      <h2 className="text-3xl mb-4">Search Filter</h2>
      <hr className="border-t-2 border-black my-4" />

      {/* Price Range */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">By Price Range</label>
        <div className="flex justify-between gap-2">
          <input
            type="number"
            placeholder="Min"
            className="w-1/2 p-2 rounded border border-gray-300 flex-1/3"
          />
          <input
            type="number"
            placeholder="Max"
            className="w-1/2 p-2 rounded border border-gray-300 flex-1/3"
          />
        </div>
        <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-800">
          APPLY
        </button>
      </div>
      <hr className="border-t-2 border-black my-4" />

      {/* Brand Filter */}
      <div className="mb-6 w-full">
        <label className="block mb-2 font-medium">Brand</label>
        <ul className="">
          {brands.map((brand) => (
            <li key={brand} className="flex items-center">
              <input
                type="checkbox"
                id={`brand-${brand}`}
                name="brand"
                value={brand}
                className=" text-blue-600 accent-blue-600 flex-1/6"
              />
              <label
                htmlFor={`brand-${brand}`}
                className="text-sm text-gray-700 flex-5/6 ml-2"
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
              className="flex items-center space-x-1 text-yellow-400 hover:text-yellow-900 hover:bg-yellow-400 cursor-pointer p-2 transition duration-200 rounded-2xl"
              onClick={() => console.log(`Filter by ${rating} stars`)} // Replace this with actual logic
            >
              {Array.from({ length: rating }, (_, i) => (
                <span key={i}>&#9733;</span> // Filled star
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
                name="discount"
                value={discount}
                className=" text-blue-600 accent-blue-600 flex-1/6"
              />
              <label
                htmlFor={`discount-${discount}`}
                className="text-sm text-gray-700 flex-5/6 ml-2"
              >
                {discount}
              </label>
            </li>
          ))}
        </ul>
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-800">
          CLEAR ALL
        </button>
      </div>
    </div>
  );
};

export default SearchFill;
