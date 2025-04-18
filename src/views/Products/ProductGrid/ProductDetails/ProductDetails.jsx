import React, {useState} from "react";
import {Link} from "react-router-dom";


const ProductDetails = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    "image1.jpg", // Replace with actual image URLs
    "image2.jpg",
    "image3.jpg",
    "image4.jpg",
  ];

    const nextImage = () => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
      setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
    };

      const bundles = [
        {
          title: "ASROCK BUILD AMD RYZEN 5 5600G / ASROCK B450 STEEL...",
          price: 11795.0,
          reviews: "No reviews",
          rating: 5,
        },
        {
          title: "Onikuma TZ5006 5 in 1 Combo Gaming Set --",
          price: 1050.0,
          reviews: "No reviews",
          rating: 0,
        },
        {
          title: "ASROCK BUILD AMD RYZEN 5 4600G / ASROCK B450 STEEL...",
          price: 11380.0,
          reviews: "No reviews",
          rating: 0,
        },
        {
          title: "GIGABYTE BUILD Intel Core I3-10100 / GIGABYTE H510M-K...",
          price: 9750.0,
          reviews: "No reviews",
          rating: 0,
        },
      ];

    return (
      <>
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
                <span className="available-pieces">1404 pieces available</span>
              </div>
            </div>
            <button className="wishlist">Add to Wishlist</button>
            <Link to="/cart" className="Buy">
              Buy Now
            </Link>
          </div>
        </div>
        <div className="product-description">
          <div className="product-detail-container">
            <div className="tabs">
              <button className="tab-button">Overview</button>
              <button className="tab-button">Reviews</button>
              <button className="tab-button">Compatible Parts</button>
            </div>
            <div className="product-info-desc">
              <h1>
                Coolermaster MWE850 V2 ATX 3.1 FM MPE-8501-AFAG-3EU2 850watts
                Fully Modular 80+ Gold Power Supply
              </h1>
              <h2>Brand</h2>
              <span>Coolermaster</span>
              <h3>Product Description</h3>
              <p>
                Power your rig with the Cooler Master MWE850 V2 ATX 1 FM Power
                Supply. Offering 850W of reliable energy with 80+ Gold
                efficiency, it ensures optimal performance and low heat
                output...
              </p>
              <h3>Product Specifications</h3>
              <ul>
                <li>Model: MPE-8501-AFAG-3E</li>
                <li>ATX Version: ATX 12V v3.1</li>
                <li>PFC: Active PFC</li>
                <li>Input Voltage: 100-240V</li>
                <li>Input Current: 13A</li>
                <li>Input Frequency: 50-60Hz</li>
                <li>Dimensions (L x W x H): 160 x 150 x 86 mm</li>
                <li>Fan Size: 120mm</li>
                <li>Fan Bearing: HDB</li>
              </ul>
              <div className="reviews-section">
                <h3>Customer Reviews</h3>
                <button className="write-review-button">
                  Be the first to write a review
                </button>
              </div>
            </div>
            <div className="compatible-builds">
              <h2>Compatible Builds</h2>
              <div className="builds">
                <div className="build-item">
                  <img src="keyboard.jpg" alt="Keyboard" />
                  <p>Lorem ipsum dolor sit amet, consectetur</p>
                  <p>P 5,999</p>
                </div>
                <div className="build-item">
                  <img src="keyboard.jpg" alt="Keyboard" />
                  <p>Lorem ipsum dolor sit amet, consectetur</p>
                  <p>P 5,999</p>
                </div>
                <div className="build-item">
                  <img src="keyboard.jpg" alt="Keyboard" />
                  <p>Lorem ipsum dolor sit amet, consectetur</p>
                  <p>P 5,999</p>
                </div>
              </div>
            </div>
          </div>
          <div className="other-desc">
            <div className="warranty-container">
              <h2 className="warranty-title">Warranty</h2>
              <ul className="warranty-list">
                <li className="warranty-item">
                  <span className="warranty-icon">🛡️</span> 1 Year Warranty
                </li>
                <li className="warranty-item">
                  <span className="warranty-icon">🛡️</span> EasyFix Warranty
                </li>
              </ul>
            </div>
            <div className="best-bundles">
              <h2>BEST BUNDLES</h2>
              <div className="bundles-list">
                {bundles.map((bundle, index) => (
                  <div key={index} className="bundle-item">
                    <h3>{bundle.title}</h3>
                    <p className="price">₱{bundle.price.toLocaleString()}</p>
                    <p>{bundle.reviews}</p>
                    <div className="rating">
                      {"⭐".repeat(bundle.rating)}
                      {"⭐"
                        .repeat(5 - bundle.rating)
                        .split("")
                        .map((_, i) => (
                          <span key={i} className="empty-star">
                            ☆
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
}

export default ProductDetails;
