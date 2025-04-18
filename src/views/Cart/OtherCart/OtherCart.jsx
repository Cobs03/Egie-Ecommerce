import React from "react";
import "./OtherCart.css";

const OtherCart = () => {


    const products = Array(12).fill({
      image: "https://via.placeholder.com/150",
      description: "Lorem ipsum dolor sit amet, consectetur",
      price: "P 5,999",
    });

    return (
      <div className="recommended-products">
        <h2>You May Also Like</h2>
        <div className="product-grid-container">
          {products.map((product, index) => (
            <div className="product-card" key={index}>
              <img
                src={product.image}
                alt="Product"
                className="product-image"
              />
              <p className="product-description">{product.description}</p>
              <p className="product-price">{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    );
}

export default OtherCart;