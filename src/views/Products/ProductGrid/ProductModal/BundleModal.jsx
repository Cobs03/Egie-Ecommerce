import { Link, useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";

import {
  FaArrowLeft,
  FaArrowRight,
  FaFacebook,
  FaFacebookMessenger,
} from "react-icons/fa";

import { IoBookmark, IoCloseCircleOutline } from "react-icons/io5";
import { AiFillInstagram } from "react-icons/ai";
import { FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";

const BundleModal = ({ product, onClose }) => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("All");
  
  // Bundle and product-specific images
  const bundleImages = [
    "/images/bundle.png",
    "/images/bundle.png",
    "/images/bundle.png",
    "/images/bundle.png",
  ];
  
  const mouseImages = [
    "/images/products/mouse1.png",
    "/images/products/mouse2.png",
    "/images/products/mouse3.png",
    "/images/products/mouse4.png",
  ];
  
  const keyboardImages = [
    "/images/products/keyboard1.png",
    "/images/products/keyboard2.png",
    "/images/products/keyboard3.png",
    "/images/products/keyboard4.png",
  ];
  
  const cpuImages = [
    "/images/products/cpu1.png",
    "/images/products/cpu2.png",
    "/images/products/cpu3.png",
    "/images/products/cpu4.png",
  ];

  // Get current images based on selected filter
  const getCurrentImages = () => {
    switch(selectedFilter) {
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
    switch(selectedFilter) {
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
    switch(selectedFilter) {
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
    const targetUrl = `/products/details?category=${encodeURIComponent(category)}`;

    // Close the modal first
    onClose();

    // Use a slight delay to ensure the modal closing doesn't interfere
    setTimeout(() => {
      navigate(targetUrl);
    }, 100);
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
  const [quantity, setQuantity] = useState(1);

  // Get current images based on the filter
  const currentImages = getCurrentImages();
  const containerBgColor = getContainerBackgroundColor();
  const thumbnailBgColor = getThumbnailBackgroundColor();

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999]"
      onClick={onClose}
    >
      <div
        className="bg-black text-white p-6 rounded-lg w-[90%] max-h-[90vh] overflow-y-auto shadow-lg relative animate-fadeIn modal-scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button and Report */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          <button
            className="cursor-pointer text-2xl text-white hover:text-gray-300 transition"
            onClick={onClose}
          >
            <IoCloseCircleOutline />
          </button>
          <span className="text-red-500 text-sm cursor-pointer hover:underline">
            Report
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Image Slider */}
          <div className="w-full lg:w-1/2 mt-4">
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
                    <div className={`${thumbnailBgColor} rounded-lg p-2 h-20 flex items-center justify-center cursor-pointer hover:opacity-80 transition`}>
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
            
            {/* Selected Product Indicator */}
            <div className={`mt-4 text-center ${selectedFilter !== "All" ? "text-white" : "text-green-500"} bg-zinc-800 py-2 px-4 rounded`}>
              Viewing: <span className="font-semibold text-green-500">{selectedFilter}</span> Images
            </div>
          </div>

          {/* Bundle Details */}
          <div className="w-full lg:w-1/2 bg-black p-4 rounded-lg">
            <h1 className="text-xl font-semibold mb-2 text-white">
              CHRISTMAS BUNDLE
            </h1>

            <div className="flex justify-between text-sm text-gray-400 mb-4">
              <div>
                <span>No Ratings Yet</span> · <span>0 Sold</span>
              </div>
            </div>

            <div className="text-3xl font-bold text-green-500 mb-4">
              ₱29,495.00 - ₱39,920.00
            </div>

            <div className="mb-4">
              <span className="text-white font-semibold">
                Available: <span className="text-green-500">In Stock</span>
              </span>
            </div>

            {/* Products in the Bundle */}
            <div className="mb-6">
              <label className="block font-medium mb-3 text-white">
                Products in the Bundle
              </label>
              <div className="flex gap-2 flex-wrap">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedFilter(option)}
                    className={`border px-4 py-2 rounded text-sm transition cursor-pointer ${
                      selectedFilter === option
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                    }`}
                  >
                    {option}
                  </button>
                ))}
                <button
                  onClick={handleViewSelectedProduct}
                  className="flex gap-1 border border-white px-4 py-2 rounded text-sm transition cursor-pointer text-white hover:bg-white hover:text-gray-800"
                >
                  View Selected Product <FaArrowRight className="h-full" />
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block font-medium mb-3 text-white">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-2 border border-green-500 rounded text-green-500 hover:bg-green-500 hover:text-white transition cursor-pointer"
                  disabled={stock === 0}
                >
                  −
                </button>
                <input
                  type="text"
                  readOnly
                  value={quantity}
                  className="w-16 text-center border border-green-500 rounded py-2 bg-transparent text-white"
                />
                <button
                  onClick={() =>
                    setQuantity((prev) => Math.min(prev + 1, stock))
                  }
                  className="px-3 py-2 border border-green-500 rounded text-green-500 hover:bg-green-500 hover:text-white transition cursor-pointer"
                  disabled={stock === 0}
                >
                  +
                </button>
                <span className="text-sm text-gray-400">
                  1404 pieces available
                </span>
              </div>
            </div>

            {/* View More Details */}
            <div className="text-center mb-6">
              <Link
                to={`/products/details?type=bundle&id=${product?.id || 'bundle-1'}`}
                className="text-blue-400 hover:underline text-sm cursor-pointer"
              >
                VIEW MORE DETAILS
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  toast.success("Added to cart!", {
                    description: "Your product has been successfully added.",
                  });
                }}
                className="flex-1 bg-green-500 text-white font-medium py-3 rounded hover:bg-green-600 transition text-center cursor-pointer"
              >
                Add To Cart
              </button>

              <Link
                to="/cart"
                className="flex-1 bg-green-500 text-white font-medium py-3 rounded hover:bg-green-600 transition text-center cursor-pointer"
              >
                Buy Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleModal;