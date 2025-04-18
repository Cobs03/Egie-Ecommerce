import React, {useState} from "react";
import "./TopSeller.css";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";
import {Link} from "react-router-dom";

const TopSeller = () => {

      const [selectedProduct, setSelectedProduct] = useState(null);

const products = [
  {
    id: 1,
    price: "P 5,999",
    description: "Lorem ipsum dolor sit amet, consectetur",
    rating: "⭐ 5 Star",
  },
  {
    id: 2,
    price: "P 5,999",
    description: "Lorem ipsum dolor sit amet, consectetur",
    rating: "⭐ 5 Star",
  },
  {
    id: 3,
    price: "P 5,999",
    description: "Lorem ipsum dolor sit amet, consectetur",
    rating: "⭐ 5 Star",
  },
  {
    id: 4,
    price: "P 5,999",
    description: "Lorem ipsum dolor sit amet, consectetur",
    rating: "⭐ 5 Star",
  },
];
    return (
      <div className="top-sellers">
        <h2>TOP SELLERS</h2>
        <div className="card-container">
          <button className="arrow left">❮</button>
          {products.map((product) => (
            <div
              className="card"
              key={product.id}
              onClick={() => setSelectedProduct(product)}
            >
              <div className="image-placeholder"></div>
              <p>{product.description}</p>
              <p>{product.rating}</p>
              <h3>{product.price}</h3>
              <div className="button-container">
                <button className="buy-button">Buy Now</button>
                <button className="cart-button">🛒</button>
              </div>
            </div>
          ))}
          {selectedProduct && (
            <ProductModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />
          )}
          <button className="arrow right">❯</button>
        </div>
        <Link to="/products" className="see-all">SEE ALL</Link>
      </div>
    );
}

export default TopSeller;