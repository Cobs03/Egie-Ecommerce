import React from "react";
import SearchFill from "./Product Components/SearchFill";
import Category from "./Product Components/Category";
import ProductGrid from "./ProductGrid/ProductGrid";

const Products = () => {

    return (
      <>
        <div className="flex flex-row gap-4">
          <SearchFill />
          <div className="flex flex-col gap-4 w-[97%]">
            <Category />
            <ProductGrid />
          </div>
        </div>
      </>
    );
}

export default Products;