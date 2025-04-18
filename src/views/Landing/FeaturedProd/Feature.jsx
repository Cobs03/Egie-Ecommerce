import React from "react";
import "./Feature.css";
import { Link } from "react-router-dom";

const Feature = () => {
  const products = [
    { name: "Cooling System", imageUrl: "path/to/cooling-system.png" },
    { name: "Processor", imageUrl: "path/to/processor.png" },
    { name: "Mother Board", imageUrl: "path/to/mother-board.png" },
    { name: "Memory (RAM)", imageUrl: "path/to/memory.png" },
    { name: "Storage (SSD)", imageUrl: "path/to/storage.png" },
    { name: "Graphics Card", imageUrl: "path/to/graphics-card.png" },
    { name: "Power Supply", imageUrl: "path/to/power-supply.png" },
    { name: "Cabinet (Case)", imageUrl: "path/to/cabinet.png" },
  ];

    return (
      <>
        <div className="featured-products">
          <h2>Featured Products</h2>
          <div className="product-list">
            {products.map((product, index) => (
              <div className="product" key={index}>
                <div className="category">
                  <img src={product.imageUrl} alt={product.name} />
                </div>

                <div className="details">
                  <p>{product.name}</p>
                  <Link to="/products" href="#">View More</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
}

export default Feature;

