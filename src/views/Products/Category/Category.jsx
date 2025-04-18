import Reach from "react";

import "./Category.css";


const Category = () => {

    return (
      <div className="categories-container">
        <h2 className="categories-title">All Categories</h2>
        <div className="category-list">
          {Array(5)
            .fill()
            .map((_, index) => (
              <button className="category-item" key={index}>
                <div className="category-image">
                  <img src="placeholder.png" alt={`Category ${index + 1}`} />
                </div>
                <span>Monitor</span>
              </button>
            ))}
        </div>
      </div>
    );
}

export default Category;    