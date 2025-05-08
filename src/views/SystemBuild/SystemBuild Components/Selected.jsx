import React, { useState, useEffect } from "react";
import { components } from "../../Data/components";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Selected = ({ selectedType, onAddProduct }) => {
  const selectedComponent = components.find((c) => c.type === selectedType);
  const products = selectedComponent ? selectedComponent.products : [];

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const [searchTerm, setSearchTerm] = useState("");


  // ⬇️ Reset filters when selectedType changes
  useEffect(() => {
    setSelectedBrand("");
    setSelectedSubCategory("");
    setSelectedProduct(null);
  }, [selectedType]);

  const brands = [...new Set(products.map((p) => p.brand))];
  const subCategories = [...new Set(products.map((p) => p.subCategory))];

const filteredProducts = products.filter((p) => {
  const matchesBrand = selectedBrand === "" || p.brand === selectedBrand;
  const matchesSub =
    selectedSubCategory === "" || p.subCategory === selectedSubCategory;
  const matchesSearch = p.productName
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  return matchesBrand && matchesSub && matchesSearch;
});

  return (
    <div className="p-4 max-w-md border border-gray-300 mx-auto bg-gray-50 h-[500px] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">
        Selected Components: {selectedType}
      </h2>
      <input
        type="text"
        placeholder="Search by product name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full px-3 py-2 border border-gray-300 rounded text-sm"
      />

      <div className="flex gap-4 mb-4">
        <Select onValueChange={setSelectedBrand} value={selectedBrand}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand, index) => (
              <SelectItem key={index} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={setSelectedSubCategory}
          value={selectedSubCategory}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {subCategories.map((sub, index) => (
              <SelectItem key={index} value={sub}>
                {sub}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-gray-500 text-sm">No products match your filters.</p>
      ) : (
        filteredProducts.map((product, index) => (
          <div key={index} className="mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-xs">📷</span>
              </div>

              <div>
                <p className="font-semibold text-sm">{product.productName}</p>
                <p className="text-xs text-gray-600">
                  {product.brand} - {product.subCategory}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="cursor-pointer bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onAddProduct(selectedType, product)}
                    className="cursor-pointer bg-lime-400 text-black text-sm px-3 py-1 rounded hover:bg-lime-500"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <hr className="my-4 border-gray-400" />
          </div>
        ))
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
