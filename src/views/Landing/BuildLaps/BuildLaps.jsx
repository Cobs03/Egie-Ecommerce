import React from "react";
import "./BuildLaps.css";
import { useState } from "react";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";
import {Link} from "react-router-dom";

const BuildLaps = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);

    const products = [
      {
        id: 1,
        title:
          "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
        price: "$499.00",
        oldPrice: "$499.00",
        reviews: 4,
        inStock: true,
        imageUrl: "https://via.placeholder.com/150", // Replace with actual image URL
      },
      // Repeat for other products as needed
    ];

    return (
      <div className="product-display">
        <div className="custom-build">
          <h2>Custom Builds</h2>
          <Link to="/products" href="/products" className="see-all">
            See All Products
          </Link>
        </div>
        <div className="product-list">
          {products.map((product) => (
            <div
              className="product-card"
              key={product.id}
              onClick={() => setSelectedProduct(product)}
            >
              <img src={product.imageUrl} alt={product.title} />
              <div className="product-info">
                {product.inStock && <span className="in-stock">In Stock</span>}
                <h4>{product.title}</h4>
                <span className="reviews">Reviews ({product.reviews})</span>
                <div className="pricing">
                  <span className="old-price">{product.oldPrice}</span>
                  <span className="current-price">{product.price}</span>
                </div>
              </div>
            </div>
          ))}

          {selectedProduct && (
            <ProductModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />
          )}
        </div>
      </div>
    );
}

export default BuildLaps;