import React, { useState, useEffect } from "react";
import { FaMinus, FaPlus, FaTrash, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";

// Define component types matching database categories
const COMPONENT_TYPES = [
  "Case",
  "Motherboard", 
  "Processor",
  "GPU",
  "RAM",
  "SSD",
  "HDD",
  "PSU",
  "Cooling",
  "Monitor",
  "Keyboard",
  "Mouse",
  "Headset",
  "Speaker",
  "Webcam"
];

const BuildComponents = ({
  selectedType,
  setSelectedType,
  selectedProducts,
  setSelectedProducts,
  selectedVariants,
  setSelectedVariants,
  onOpenDrawer,
  onAddToCart,
}) => {
  const [quantities, setQuantities] = useState(
    COMPONENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: 0 }), {})
  );
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null);

  // Scroll animation
  const tableAnim = useScrollAnimation({ threshold: 0.1 });
  const summaryAnim = useScrollAnimation({ threshold: 0.1 });

  // Auto-set quantity to 1 when a product is added
  useEffect(() => {
    const newQuantities = { ...quantities };
    let updated = false;

    // Check each selected product
    Object.keys(selectedProducts).forEach(type => {
      // If product exists but quantity is 0, set it to 1
      if (selectedProducts[type] && quantities[type] === 0) {
        newQuantities[type] = 1;
        updated = true;
      }
    });

    if (updated) {
      setQuantities(newQuantities);
    }
  }, [selectedProducts]);

  const handleDecrease = (compType) => {
    if (!selectedProducts[compType]) return;
    setQuantities((prev) => ({
      ...prev,
      [compType]: Math.max(0, prev[compType] - 1),
    }));
  };

  const handleIncrease = (compType) => {
    if (!selectedProducts[compType]) return;
    setQuantities((prev) => ({
      ...prev,
      [compType]: prev[compType] + 1,
    }));
  };

  const handleDelete = (compType) => {
    setSelectedProducts((prev) => {
      const updated = { ...prev };
      delete updated[compType];
      return updated;
    });

    setQuantities((prev) => ({
      ...prev,
      [compType]: 0,
    }));
  };

  const subtotal = COMPONENT_TYPES.reduce((acc, type) => {
    const selectedProduct = selectedProducts[type];
    const price = selectedProduct?.price || 0;
    const total = price * (quantities[type] || 0);
    return acc + total;
  }, 0);

  return (
    <div className="w-full mb-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div 
          ref={tableAnim.ref}
          className={`flex-1 border rounded shadow-sm bg-gray-50 p-4 transition-all duration-700 ${
            tableAnim.isVisible 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-8'
          }`}
        >
          <table className="min-w-full text-sm border border-gray-300 mb-4">
            <thead className="bg-blue-100 text-gray-700 text-left">
              <tr>
                <th className="p-2 border">Components</th>
                <th className="p-2 border">Product</th>
                <th className="p-2 border text-center">Quantity</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {COMPONENT_TYPES.map((type) => {
                const selectedProduct = selectedProducts[type];
                const price = selectedProduct?.price || 0;
                const quantity = quantities[type] || 0;
                const total = price * quantity;

                if (!selectedProduct) {
                  return (
                    <tr key={type} className="bg-white hover:bg-gray-100">
                      <td className="p-2 border font-medium text-gray-700">
                        {type}
                      </td>
                      <td colSpan="5" className="p-4 border text-center">
                        <button
                          onClick={() => onOpenDrawer ? onOpenDrawer(type) : setSelectedType(type)}
                          className="bg-transparent border-2 border-dashed border-green-500 text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 font-semibold transition-all duration-200 active:scale-95 hover:scale-105 w-full max-w-md"
                        >
                          + Add a {type} Component
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={type} className="bg-white hover:bg-gray-100">
                    <td className="p-2 border font-medium text-gray-700">
                      {type}
                    </td>
                    <td className="p-2 border">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">
                            {selectedProduct.name}
                          </span>
                          <button
                            onClick={() => setSelectedProductForDetails(selectedProduct)}
                            className="text-blue-500 hover:text-blue-700 transition-colors text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded"
                            title="View Details"
                          >
                            Details
                          </button>
                        </div>
                        {/* Show variant dropdown if product has variants OR selected_components */}
                        {((selectedProduct.variants && selectedProduct.variants.length > 0) ||
                          (selectedProduct.selected_components && selectedProduct.selected_components.length > 0)) && (
                          <select
                            value={selectedVariants?.[type] || ''}
                            onChange={(e) => {
                              setSelectedVariants(prev => ({ ...prev, [type]: e.target.value }));
                            }}
                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                          >
                            <option value="">Select Variant</option>
                            {/* Check if product has variants array */}
                            {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                              selectedProduct.variants.map((variant, idx) => {
                                const variantLabel = variant.sku || variant.name || variant;
                                const variantPrice = variant.price || selectedProduct.price;
                                return (
                                  <option key={idx} value={variantLabel}>
                                    {variantLabel} - ₱{variantPrice?.toLocaleString()}
                                  </option>
                                );
                              })
                            ) : (
                              /* Fallback to selected_components if no variants */
                              selectedProduct.selected_components?.map((component, idx) => {
                                const componentName = typeof component === 'object' && component !== null ? component.name : component;
                                return (
                                  <option key={idx} value={componentName}>
                                    {componentName}
                                  </option>
                                );
                              })
                            )}
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="p-2 border text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <button
                          onClick={() => handleDecrease(type)}
                          className="cursor-pointer bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all duration-200 active:scale-90 hover:scale-110"
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleIncrease(type)}
                          className="cursor-pointer bg-green-500 text-white p-1 rounded-full hover:bg-green-600 transition-all duration-200 active:scale-90 hover:scale-110"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="p-2 border">₱{price.toFixed(2)}</td>
                    <td className="p-2 border font-semibold">
                      ₱{total.toFixed(2)}
                    </td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => handleDelete(type)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 cursor-pointer transition-all duration-200 active:scale-90 hover:scale-110"
                        title="Remove component"
                      >
                        <FaTrash size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div 
            ref={summaryAnim.ref}
            className={`bg-black text-white flex justify-between items-center p-4 rounded-md transition-all duration-700 ${
              summaryAnim.isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="text-lg font-semibold">
              Subtotal: ₱{subtotal.toFixed(2)}
            </span>
            <button
              onClick={onAddToCart}
              disabled={Object.keys(selectedProducts).length === 0}
              className="bg-lime-400 text-black px-6 py-2 rounded hover:bg-lime-500 font-semibold transition-all duration-200 active:scale-95 hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaShoppingCart size={16} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProductForDetails && (
        <ProductModal
          product={selectedProductForDetails}
          onClose={() => setSelectedProductForDetails(null)}
        />
      )}
    </div>
  );
};

export default BuildComponents;
