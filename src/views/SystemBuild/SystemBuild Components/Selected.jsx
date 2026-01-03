import React, { useState, useEffect } from "react";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

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
              
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded border transition-all ${
                    isSelected 
                      ? 'bg-lime-50 border-lime-400' 
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
                      <p className="font-semibold text-sm text-gray-800 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {product.brand} • {product.subcategory}
                      </p>
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
