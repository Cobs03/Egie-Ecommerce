import React from "react";
import "./SearchFill.css";

const SearchFill = () => {

    return (
      <div className="search-filter">
        <h2>Search Filter</h2>

        <div className="filter-section">
          <label>By Price Range</label>
          <div className="price-inputs">
            <input type="number" placeholder="Min" />
            <input type="number" placeholder="Max" />
          </div>
          <button className="apply-btn">APPLY</button>
        </div>

        <div className="filter-section">
          <label>Brand</label>
          <ul>
            <li>Lorem ipsum dolor</li>
            <li>Lorem ipsum dolor</li>
            <li>Lorem ipsum dolor</li>
            <li>Lorem ipsum dolor</li>
          </ul>
        </div>

        <div className="filter-section">
          <label>Rating</label>
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`star ${i < 3 ? "filled" : ""}`}>
                &#9733;
              </span>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label>Discount</label>
          <ul>
            <li>Lorem ipsum dolor</li>
          </ul>
          <button className="clear-btn">CLEAR ALL</button>
        </div>
      </div>
    );
}

export default SearchFill;