import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import { components } from "../../Data/components";

const ComparisonSelector = ({ addToComparison, existingProducts = [], onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const navigate = useNavigate();

  // Extract unique component types from your data
  const componentTypes = [...new Set(components.map((component) => component.type))];

  // Filter products based on search and category
  const filteredProducts = components
    .filter((category) => !selectedCategory || category.type === selectedCategory)
    .flatMap((category) =>
      category.products.filter(
        (product) =>
          product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.subCategory.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

  // Handle product selection
  const handleAddProduct = (product) => {
    // Check if product is already selected
    if (selectedProducts.find((p) => p.id === product.id) || existingProducts.find((p) => p.id === product.id)) {
      toast.error("This product is already in your comparison");
      return;
    }

    // Check if we've reached the max of 3 products
    if (selectedProducts.length + existingProducts.length >= 3) {
      toast.error("You can only compare up to 3 products");
      return;
    }

    setSelectedProducts([...selectedProducts, product]);
    toast.success(`${product.productName} added to comparison`);
  };

  // Handle comparison button click
  const handleCompare = () => {
    if (selectedProducts.length > 0) {
      addToComparison(selectedProducts);
      onClose && onClose();
      navigate("/compare");
    }
  };

  // Close modal if escape key is pressed
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto ">
      <div className="bg-white text-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[70vh] overflow-y-auto m-4 mt-32.5 max-md:mt-22.5">
        <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Select Products to Compare</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <FaTimes className="text-gray-500" />
            </button>
          )}
        </div>

        <div className="p-4 max-w-6xl mx-auto">
          {/* Selected products preview */}
          <div className="flex justify-center items-center mb-8 gap-4">
            {selectedProducts.length > 0 ? (
              selectedProducts.map((product) => (
                <div key={product.id} className="text-center">
                  <div className="bg-gray-100 p-2 rounded-lg mb-2">
                    <img
                      src={product.imageUrl || "https://via.placeholder.com/80"}
                      alt={product.productName}
                      className="w-20 h-20 object-contain mx-auto"
                    />
                  </div>
                  <p className="text-sm font-medium truncate max-w-[120px]">
                    {product.productName}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">
                <p className="mb-2">No products selected</p>
                <p className="text-xs">
                  Select up to {3 - existingProducts.length} products
                </p>
              </div>
            )}
          </div>

          {/* Compare button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={handleCompare}
              className={`bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-8 rounded-md transition-colors ${
                selectedProducts.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={selectedProducts.length === 0}
            >
              Add to Comparison
            </button>
          </div>

          {/* Filter controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
            {/* Component dropdown */}
            <div className="relative w-full md:w-48">
              <select
                className="bg-white border border-gray-300 rounded px-3 py-2 w-full appearance-none cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Components</option>
                {componentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products..."
                className="bg-white border border-gray-300 rounded pl-10 pr-3 py-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaSearch className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="h-28 flex items-center justify-center mb-3">
                  <img
                    src={product.imageUrl || "https://via.placeholder.com/100"}
                    alt={product.productName}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="mb-3">
                  <p className="font-medium text-sm line-clamp-2 h-10">
                    {product.productName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {product.brand} - {product.subCategory}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-bold">
                    ${product.price}
                  </span>
                  <button
                    onClick={() => handleAddProduct(product)}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-3 rounded transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products found matching your criteria
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCompare}
            className={`bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-8 rounded-md transition-colors ${
              selectedProducts.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={selectedProducts.length === 0}
          >
            Add to Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSelector;
