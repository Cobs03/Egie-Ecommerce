import React from "react";
import SearchFill from "./SearchFill/SearchFill";
import Category from "./Category/Category";
import ProductGrid from "./ProductGrid/ProductGrid";

const Products = () => {

    return(
        <>
            <SearchFill />
            <Category />
            <ProductGrid />
        </>
    )
}

export default Products;