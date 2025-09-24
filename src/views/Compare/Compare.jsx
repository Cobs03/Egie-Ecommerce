import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import ComparisonSelector from "./Compare Components/ComparisonSelector";
import ComparisonTable from "./Compare Components/ComparisonTable";
import AIRecommendation from "./Compare Components/AIRecommendation";
import ProductModal from "../Products/ProductGrid/ProductModal/ProductModal";

const Compare = () => {
  const location = useLocation();
  const [productsToCompare, setProductsToCompare] = useState([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  
  // New state for product modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForModal, setProductForModal] = useState(null);
  
  // Check if we have products from navigation state
  useEffect(() => {
    if (location.state?.products) {
      setProductsToCompare(location.state.products);
    }
  }, [location.state]);

  // Handle adding a component - open the comparison selector modal
  const handleAddComponent = () => {
    setIsModalOpen(true);
  };
  
  // Handler for viewing product details - opens the product modal
  const handleViewProductDetails = (product) => {
    setProductForModal(product);
    setShowProductModal(true);
  };

  // Handle adding selected products to comparison
  const handleAddToComparison = (products) => {
    setProductsToCompare([...productsToCompare, ...products]);
    setIsModalOpen(false);
  };

  // Handle removing a product from comparison
  const handleRemoveProduct = (productId) => {
    setProductsToCompare(productsToCompare.filter((p) => p.id !== productId));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Render the comparison selector modal when isModalOpen is true */}
      {isModalOpen && (
        <ComparisonSelector
          addToComparison={handleAddToComparison}
          existingProducts={productsToCompare}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      
      {/* Product Modal - Show when a product is selected for detailed view */}
      {showProductModal && productForModal && (
        <ProductModal 
          product={productForModal}
          onClose={() => setShowProductModal(false)}
        />
      )}
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="py-4 text-center shadow-sm mb-6">
          <h1 className="text-2xl font-semibold font-['Bruno_Ace_SC']">
            Compare Products
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
          <>

            
            {/* Comparison Table */}
            <ComparisonTable 
              products={productsToCompare} 
              onRemoveProduct={handleRemoveProduct}
              onAddProduct={handleAddComponent} 
            />

            {/* AI Recommendation - show only when comparing multiple products */}
            {productsToCompare.length > 1 && (
              <AIRecommendation 
                products={productsToCompare} 
                onViewDetails={handleViewProductDetails} 
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Compare;