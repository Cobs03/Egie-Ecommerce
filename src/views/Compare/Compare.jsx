import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import ComparisonSelector from "./Compare Components/ComparisonSelector";

const Compare = () => {
  const location = useLocation();
  const [productsToCompare, setProductsToCompare] = useState([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Check if we have products from navigation state
  useEffect(() => {
    if (location.state?.products) {
      setProductsToCompare(location.state.products);
    }
  }, [location.state]);

  // Handle adding a component - open the modal instead of navigating
  const handleAddComponent = () => {
    setIsModalOpen(true);
  };

  // Handle adding selected products to comparison
  const handleAddToComparison = (products) => {
    setProductsToCompare([...productsToCompare, ...products]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Render the modal when isModalOpen is true */}
      {isModalOpen && (
        <ComparisonSelector
          addToComparison={handleAddToComparison}
          existingProducts={productsToCompare}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className=" py-4 text-center shadow-sm mb-6">
          <h1 className="text-2xl font-semibold font-['Bruno_Ace_SC']">
            Compare Product
          </h1>
        </div>

        {productsToCompare.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-lg shadow-md py-16 flex flex-col items-center justify-center">
            <p className="text-gray-600 mb-4">No Component Selected</p>
            <div className="text-6xl text-gray-800 mb-8">
              <FaCog className="inline-block animate-spin-slow" />
              <FaCog className="inline-block -ml-4 -mr-4 relative top-4" />
              <FaCog className="inline-block animate-spin-slow" />
            </div>
            <button
              onClick={handleAddComponent}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Add a Component
            </button>
          </div>
        ) : (
          /* Comparison table - show when products are selected */
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex">
              <div className="w-1/4 pr-4">
                <div className="font-semibold mb-12">Product</div>
                <div className="py-2 border-t">Brand</div>
                <div className="py-2 border-t">Model</div>
                <div className="py-2 border-t">Price</div>
                <div className="py-2 border-t">Rating</div>
                <div className="py-2 border-t">Availability</div>
                {/* Add more specifications as needed */}
              </div>

              {/* Product columns */}
              {productsToCompare.map((product) => (
                <div key={product.id} className="w-1/4 px-2">
                  <div className="mb-4 flex flex-col items-center">
                    <img
                      src={product.imageUrl || product.image}
                      alt={product.productName || product.name}
                      className="w-32 h-32 object-contain mb-2"
                    />
                    <h3 className="font-semibold text-center">
                      {product.productName || product.name}
                    </h3>
                    <button
                      onClick={() =>
                        setProductsToCompare(
                          productsToCompare.filter((p) => p.id !== product.id)
                        )
                      }
                      className="text-xs text-red-500 hover:text-red-700 mt-2"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="py-2 border-t">{product.brand}</div>
                  <div className="py-2 border-t">{product.model || product.subCategory}</div>
                  <div className="py-2 border-t">${product.price}</div>
                  <div className="py-2 border-t">{product.rating || "N/A"}/5</div>
                  <div className="py-2 border-t">
                    {product.inStock ? (
                      <span className="text-green-600">In Stock</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </div>
                  {/* Add more specifications as needed */}
                </div>
              ))}

              {/* Add more product button */}
              {productsToCompare.length < 3 && (
                <div className="w-1/4 px-2 flex items-center justify-center">
                  <button
                    onClick={handleAddComponent}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md p-8 flex flex-col items-center justify-center w-full"
                  >
                    <span className="text-3xl mb-2">+</span>
                    <span className="text-sm">Add Product</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;