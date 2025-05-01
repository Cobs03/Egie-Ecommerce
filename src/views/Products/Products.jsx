import React from "react";
import SearchFill from "./SearchFill/SearchFill";
import Category from "./Category/Category";
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