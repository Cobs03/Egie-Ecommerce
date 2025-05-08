import React, { useState } from "react";
import SearchFill from "./Product Components/SearchFill";
import ProductGrid from "./ProductGrid/ProductGrid";
import Category from "./Product Components/Category";

const Products = () => {

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [filters, setFilters] = useState({
    minPrice: null,
    maxPrice: null,
    brands: [],
    rating: null,
    discounts: [],
  });

  const handleFilterChange = (updatedFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...updatedFilters,
    }));
  };

  return (
    <div className="flex gap-6 p4">
      <div className="w-1/5">
        <SearchFill filters={filters} onChange={handleFilterChange} className=""/>
      </div>
      <div className="w-4/5 gap-4">
        <Category
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          className="mb-4"
        />
        <ProductGrid selectedCategory={selectedCategory} filters={filters} />
      </div>
    </div>
  );
};

export default Products;
