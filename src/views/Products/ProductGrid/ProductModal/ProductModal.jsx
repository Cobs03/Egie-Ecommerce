import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ProductModal.css";


const ProductModal = ({ product, onClose }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    "image1.jpg", // Replace with actual image URLs
    "image2.jpg",
    "image3.jpg",
    "image4.jpg",
  ];

  console.log("Product ID:", product?.id); // ✅ Add this line here

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>
            X
          </button>
        </div>
        <div className="modal-body">
          <div className="product-display-top">
            <div className="imageDisplay">
              <div className="main-image-container">
                <img
                  src={images[currentImage]}
                  alt="Product"
                  className="main-image"
                />
              </div>
              <div className="carousel">
                <button className="arrow left-arrow" onClick={prevImage}>
                  ←
                </button>
                <div className="thumbnail-container">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Thumbnail ${index}`}
                      className={`thumbnail ${
                        currentImage === index ? "active" : ""
                      }`}
                      onClick={() => setCurrentImage(index)}
                    />
                  ))}
                </div>
                <button className="arrow right-arrow" onClick={nextImage}>
                  →
                </button>
              </div>
            </div>
            <div className="product-details">
              <h1>Computer Monitor</h1>
              <div className="product-info">
                <div className="price">
                  <span className="price-range">₱15,009 - ₱21,741</span>
                </div>

                <button className="wishlist-button">Add to Wishlist</button>

                <div className="share-section">
                  <span className="share-label">Share:</span>
                  <div className="social-icons">
                    {/* Include your social media icons here */}
                  </div>
                </div>

                <div className="variation-section">
                  <label>Variation:</label>
                  <select>
                    <option value="a8 7680 8G/120ssd">a8 7680 8G/120ssd</option>
                    <option value="a8 7680 8G/256ssd">a8 7680 8G/256ssd</option>
                  </select>
                </div>

                <div className="monitor-section">
                  <label>Monitor:</label>
                  <select>
                    <option value="18.5">18.5 inches</option>
                    <option value="23.8">23.8 inches</option>
                    <option value="21.5">21.5 inches</option>
                  </select>
                </div>

                <div className="quantity-section">
                  <label>Quantity:</label>
                  <input type="number" min="1" max="1404" defaultValue="1" />
                  <span className="available-pieces">
                    1404 pieces available
                  </span>
                </div>
              </div>

              <Link to={`/products/details/${product.id}`}>
                View More Details
              </Link>
              <button className="wishlist">Add to Wishlist</button>
              <Link to="/cart" className="Buy">
                Buy Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;