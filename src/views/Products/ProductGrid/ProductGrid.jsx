import React, { useState } from "react";
import "./ProductGrid.css";
import {Link} from "react-router-dom";
import ProductModal from "./ProductModal/ProductModal";


const ProductGrid = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

const products = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  title: `Product ${index + 1}`,
  price: `P ${5999 + index * 100}`,
  rating: `${5 - (index % 3)} ⭐`,
  newArrival: index % 2 === 0,
}));


  return (
    <>
      <div className="product-grid">
        {products.map((product, index) => (
          <div
            className="product-card"
            key={index}
            onClick={() => setSelectedProduct(product)}
          >
            <div className="image-placeholder"></div>
            <div className="product-info">
              <p className="product-title">{product.title}</p>
              <p className="product-price">{product.price}</p>
              <p className="product-rating">{product.rating}</p>
              {product.newArrival && (
                <span className="new-arrival">New Arrival</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <span className="page-number">1</span>
        <span className="page-number">2</span>
        <span className="page-number">3</span>
        <span className="page-number">4</span>
        <span className="page-number">5</span>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
};

export default ProductGrid;
