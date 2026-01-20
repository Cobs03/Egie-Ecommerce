import React, { useState, useEffect } from "react";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { getCompatibilityLevel } from "../utils/compatibilityCheck";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Selected = ({ 
  selectedType, 
  selectedProducts, 
  onAddProduct, 
  onRemoveProduct, 
  componentProducts = {}, 
  isLoadingProducts = false,
  darkMode = false 
}) => {
  // Get products from database for selected component type
  const products = selectedType && componentProducts[selectedType] ? componentProducts[selectedType] : [];

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Scroll animations
  const headerAnim = useScrollAnimation({ threshold: 0.1 });
  const listAnim = useScrollAnimation({ threshold: 0.1 });

  // Reset filters when selectedType changes
  useEffect(() => {
    setSelectedBrand("all");
    setSelectedSubCategory("all");
    setSelectedProduct(null);
    setSearchTerm("");
  }, [selectedType]);

  // Extract unique brands and subcategories from database products
  const brands = [...new Set(products.map((p) => p.brand))].sort();
  const subCategories = [...new Set(products.map((p) => p.subcategory))].sort();

  const filteredProducts = products.filter((p) => {
    const matchesBrand = selectedBrand === "all" || p.brand === selectedBrand;
    const matchesSub = selectedSubCategory === "all" || p.subcategory === selectedSubCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBrand && matchesSub && matchesSearch;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[900px] flex flex-col">
      <h2 
        ref={headerAnim.ref}
        className={`text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2 flex-shrink-0 transition-all duration-700 ${
          headerAnim.isVisible 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 translate-x-4'
        }`}
      >
        Select Products
      </h2>

      {/* Motherboard-First Warning */}
      {selectedType && selectedType !== 'Motherboard' && !selectedProducts['Motherboard'] && (
        <div className="mb-3 p-3 bg-orange-50 border-2 border-orange-300 rounded-lg animate-pulse flex-shrink-0">
          <p className="text-sm font-semibold text-orange-800 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>Select Motherboard First!</span>
          </p>
          <p className="text-xs text-orange-700 mt-1">
            The motherboard determines CPU socket, RAM type, and case size. Start there for best compatibility.
          </p>
        </div>
      )}

      {/* Compatibility Legend */}
      {selectedType && Object.keys(selectedProducts).length > 0 && (
        <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded-lg flex-shrink-0">
          <p className="text-xs font-semibold text-gray-700 mb-1">Compatibility Guide:</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-100 border border-green-300 rounded"></span>
              <span className="text-gray-600">Perfect Match</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></span>
              <span className="text-gray-600">Compatible</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></span>
              <span className="text-gray-600">Check Specs</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-100 border border-red-300 rounded"></span>
              <span className="text-gray-600">Not Compatible</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Products Summary - NEW SECTION */}
      {Object.keys(selectedProducts).length > 0 && (
        <div className="mb-3 pb-3 border-b border-gray-200 flex-shrink-0">
          <h4 className="text-md font-semibold text-gray-700 mb-2">Selected ({Object.keys(selectedProducts).length})</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {Object.entries(selectedProducts).map(([type, product]) => (
              <div key={type} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-600">{type}:</span>
                  <span className="ml-1 text-gray-800 truncate">{product.name}</span>
                </div>
                {onRemoveProduct && (
                  <button
                    onClick={() => onRemoveProduct(type)}
                    className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0 transition-all duration-200 active:scale-90 hover:scale-125"
                    title={`Remove ${type}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header - Fixed */}
      <div className="mb-3 flex-shrink-0">
        <h3 className="text-base font-semibold mb-3 text-gray-800">
          {selectedType || "Select a Component"}
        </h3>
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3 w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
        />

        <div className="flex gap-2 mb-3">
          <Select onValueChange={setSelectedBrand} value={selectedBrand}>
            <SelectTrigger className="flex-1 bg-white text-sm h-9">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all" className="hover:bg-gray-100">
                All Brands
              </SelectItem>
              {brands.map((brand, index) => (
                <SelectItem 
                  key={index} 
                  value={brand} 
                  className="hover:bg-gray-100"
                >
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedSubCategory} value={selectedSubCategory}>
            <SelectTrigger className="flex-1 bg-white text-sm h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all" className="hover:bg-gray-100">
                All Categories
              </SelectItem>
              {subCategories.map((sub, index) => (
                <SelectItem 
                  key={index} 
                  value={sub} 
                  className="hover:bg-gray-100"
                >
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scrollable Products List */}
      <div 
        ref={listAnim.ref}
        className={`overflow-y-auto flex-1 min-h-0 pr-1 transition-all duration-700 delay-200 ${
          listAnim.isVisible 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 translate-x-4'
        }`}
      >
        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500 mb-2"></div>
            <p className="text-sm">Loading products...</p>
          </div>
        ) : !selectedType ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-sm text-center">
              Click on a component row to view available products
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No products match your filters.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product, index) => {
              const isSelected = selectedProducts[selectedType]?.id === product.id;
              
              // Calculate compatibility level if other components are selected
              const hasOtherComponents = Object.keys(selectedProducts).length > 0;
              const compatibility = hasOtherComponents 
                ? getCompatibilityLevel(selectedType, product, selectedProducts)
                : null;
              
              // Define compatibility badge styles
              const compatibilityBadges = {
                perfect: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', label: '✓ Perfect Match', icon: '✓' },
                good: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', label: '○ Compatible', icon: '○' },
                warning: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', label: '⚠ Check Specs', icon: '⚠' },
                incompatible: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', label: '✕ Not Compatible', icon: '✕' }
              };
              
              const badge = compatibility ? compatibilityBadges[compatibility.level] : null;
              
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded border transition-all ${
                    isSelected 
                      ? 'bg-lime-50 border-lime-400' 
                      : badge
                      ? `${badge.bg} ${badge.border} border-2`
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Product Image */}
                    <div className="w-14 h-14 bg-gray-200 flex items-center justify-center rounded flex-shrink-0 overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">📷</span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      {/* Compatibility Badge */}
                      {badge && !isSelected && (
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold mb-1 ${badge.bg} ${badge.text}`}>
                          <span>{badge.icon}</span>
                          <span>{compatibility.message}</span>
                        </div>
                      )}
                      
                      <p className="font-semibold text-sm text-gray-800 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {product.brand} • {product.subcategory}
                      </p>
                      
                      {/* Compatibility Issues Warning */}
                      {compatibility && compatibility.issues.length > 0 && (
                        <div className="mt-1 text-xs text-red-600 bg-red-50 p-1.5 rounded">
                          <p className="font-semibold">⚠ Issues:</p>
                          {compatibility.issues.slice(0, 2).map((issue, idx) => (
                            <p key={idx} className="truncate">• {issue.message}</p>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-sm font-bold text-gray-700 mt-1">
                        ₱{product.price?.toLocaleString() || '0'}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="cursor-pointer bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600 transition-all duration-200 active:scale-90 hover:scale-105"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onAddProduct(selectedType, product)}
                          disabled={isSelected}
                          className={`cursor-pointer text-xs px-3 py-1 rounded transition-all duration-200 active:scale-90 hover:scale-105 ${
                            isSelected
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-lime-400 text-black hover:bg-lime-500'
                          }`}
                        >
                          {isSelected ? 'Added ✓' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Count Footer */}
      {selectedType && filteredProducts.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-200 flex-shrink-0">
          <p className="text-xs text-gray-500 text-center">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default Selected;
