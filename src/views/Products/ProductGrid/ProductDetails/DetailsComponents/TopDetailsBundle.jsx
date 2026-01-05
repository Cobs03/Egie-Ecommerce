import { Link, useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import { useScrollAnimation } from "../../../../../hooks/useScrollAnimation";

import {
  FaArrowLeft,
  FaArrowRight,
  FaFacebook,
  FaFacebookMessenger,
  FaHeart,
  FaShareAlt,
} from "react-icons/fa";

import { AiFillInstagram } from "react-icons/ai";
import { FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";

const TopDetailsBundle = ({ product }) => {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [quantity, setQuantity] = useState(1);

  // Bundle and product-specific images
  const bundleImages = [
    "/images/bundle.png",
    "/images/bundle.png",
    "/images/bundle.png",
    "/images/bundle.png",
  ];



  // Get current images based on selected filter
  const getCurrentImages = () => {
    switch (selectedFilter) {
      case "Mouse":
        return mouseImages;
      case "Keyboard":
        return keyboardImages;
      case "CPU":
        return cpuImages;
      default:
        return bundleImages;
    }
  };

  // Get background color based on selected filter
  const getContainerBackgroundColor = () => {
    switch (selectedFilter) {
      case "Mouse":
        return "bg-blue-100";
      case "Keyboard":
        return "bg-green-100";
      case "CPU":
        return "bg-purple-100";
      default:
        return "bg-white";
    }
  };

  // Get thumbnail background color based on selected filter
  const getThumbnailBackgroundColor = () => {
    switch (selectedFilter) {
      case "Mouse":
        return "bg-blue-50";
      case "Keyboard":
        return "bg-green-50";
      case "CPU":
        return "bg-purple-50";
      default:
        return "bg-white";
    }
  };

  const filterOptions = ["All", "Mouse", "Keyboard", "CPU"];

  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  let sliderRef1 = useRef(null);
  let sliderRef2 = useRef(null);

  useEffect(() => {
    setNav1(sliderRef1.current);
    setNav2(sliderRef2.current);
  }, []);

  // Reset currentImage when filter changes
  useEffect(() => {
    setCurrentImage(0);
    // If sliders are initialized, go to first slide
    if (sliderRef1.current) {
      sliderRef1.current.slickGoTo(0);
    }
    if (sliderRef2.current) {
      sliderRef2.current.slickGoTo(0);
    }
  }, [selectedFilter]);

  // Function to handle viewing selected product
  const handleViewSelectedProduct = () => {
    // Make sure selectedFilter is not empty
    const category = selectedFilter || "All";

    // Create the target URL with the query parameter
    const targetUrl = `/products/details?category=${encodeURIComponent(
      category
    )}`;

    // Navigate to the product details page
    navigate(targetUrl);
  };

  const CustomNextArrow = ({ onClick }) => (
    <div
      className="absolute top-1/2 right-[-20px] transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-200 transition z-10"
      onClick={onClick}
    >
      <FaArrowRight className="text-gray-600" />
    </div>
  );

  const CustomPrevArrow = ({ onClick }) => (
    <div
      className="absolute top-1/2 left-[-20px] transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-200 transition z-10"
      onClick={onClick}
    >
      <FaArrowLeft className="text-gray-600" />
    </div>
  );

  // Helper function to get stock status color
  const getStockStatusColor = (stockStatus) => {
    switch (stockStatus) {
      case "In Stock":
        return "text-green-500";
      case "Low Stock":
        return "text-orange-500";
      case "Out of Stock":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  // Use product stock data if available, otherwise fallback to default
  const stock = product?.stock || 1404;
  const stockStatus = product?.stockStatus || "In Stock";

  // Get current images based on the filter
  const currentImages = getCurrentImages();
  const containerBgColor = getContainerBackgroundColor();
  const thumbnailBgColor = getThumbnailBackgroundColor();

  return (
    <div
      ref={ref}
      className={`max-w-7xl mx-auto px-4 py-8 w-full lg:w-[90%] transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="flex flex-col lg:flex-row gap-8 bg-white rounded-lg shadow-md p-6">
        {/* Image Slider */}
        <div className="w-full lg:w-1/2">
          {/* Main Image */}
          <div className="mb-4">
            <Slider
              asNavFor={nav2}
              ref={(slider) => (sliderRef1.current = slider)}
              arrows={false}
              dots={false}
              infinite={true}
              speed={500}
              slidesToShow={1}
              slidesToScroll={1}
            >
              {currentImages.map((image, index) => (
                <div
                  key={index}
                  className={`${containerBgColor} rounded-lg p-4 h-[400px] flex items-center justify-center`}
                >
                  <img
                    src={image}
                    alt={`${selectedFilter} ${index + 1}`}
                    className="object-contain max-h-full max-w-full"
                  />
                </div>
              ))}
            </Slider>
          </div>

          {/* Thumbnail Carousel */}
          <div className="relative">
            <Slider
              asNavFor={nav1}
              ref={(slider) => (sliderRef2.current = slider)}
              slidesToShow={4}
              swipeToSlide
              focusOnSelect
              arrows={true}
              nextArrow={<CustomNextArrow />}
              prevArrow={<CustomPrevArrow />}
              infinite={true}
              speed={500}
              className="thumbnail-slider"
            >
              {currentImages.map((image, index) => (
                <div key={index} className="px-1">
                  <div
                    className={`${thumbnailBgColor} rounded-lg p-2 h-20 flex items-center justify-center cursor-pointer hover:opacity-80 transition`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="object-contain max-h-full max-w-full"
                    />
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>

        {/* Bundle Details */}
        <div className="w-full lg:w-1/2">
          <h1 className="text-2xl font-bold mb-2">
            {product?.title || "CHRISTMAS BUNDLE"}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span>{product?.reviews || "No Ratings Yet"}</span>
            <span>•</span>
            <span>{product?.sku || "XMAS-BUNDLE-2023"}</span>
          </div>

          <div className="text-3xl font-bold text-green-600 mb-4">
            {product?.priceRange || "₱29,495.00 - ₱39,920.00"}
          </div>

          <div className="mb-4">
            <span className="font-semibold">
              Available:{" "}
              <span className={getStockStatusColor(stockStatus)}>
                {stockStatus}
              </span>
            </span>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-all cursor-pointer active:scale-95"
                disabled={stock === 0}
              >
                −
              </button>
              <input
                type="text"
                readOnly
                value={quantity}
                className="w-16 text-center border border-gray-300 rounded py-2"
              />
              <button
                onClick={() => setQuantity((prev) => Math.min(prev + 1, stock))}
                className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-all cursor-pointer active:scale-95"
                disabled={stock === 0}
              >
                +
              </button>
              <span className="text-sm text-gray-500">
                {stock} pieces available
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                toast.success("Added to cart!", {
                  description: "Your bundle has been successfully added.",
                });
              }}
              className="flex-1 bg-green-600 text-white font-medium py-3 rounded hover:bg-green-700 transition-all cursor-pointer active:scale-95 active:shadow-inner"
            >
              Add to Cart
            </button>

            <Link
              to="/cart"
              className="flex-1 bg-blue-500 text-white font-medium py-3 rounded hover:bg-green-700 transition-all text-center cursor-pointer active:scale-95 active:shadow-inner"
            >
              Buy Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopDetailsBundle;
