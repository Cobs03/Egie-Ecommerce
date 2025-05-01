import { Link } from "react-router-dom";
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

const ProductModal = ({ product, onClose }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    "image1.jpg",
    "image2.jpg",
    "image3.jpg",
    "image4.jpg",
    "image5.jpg",
    "image6.jpg",
    "image7.jpg",
  ];

  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  let sliderRef1 = useRef(null);
  let sliderRef2 = useRef(null);

  useEffect(() => {
    setNav1(sliderRef1.current);
    setNav2(sliderRef2.current);
  }, []);

  const CustomNextArrow = ({ onClick }) => (
    <div
      className="absolute top-1/2 right-[-20px] transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-200 transition"
      onClick={onClick}
    >
      <FaArrowRight />
    </div>
  );

  const CustomPrevArrow = ({ onClick }) => (
    <div
      className="absolute top-1/2 left-[-20px] transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-200 transition"
      onClick={onClick}
    >
      <FaArrowLeft />
    </div>
  );

  const stock = 1404;
  const [quantity, setQuantity] = useState(1);

  return (
    <div
      className="fixed inset-0 bg-black/40 bg-opacity-40 flex items-center justify-center z-[999]"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-[80%] max-h-[85vh] overflow-y-auto shadow-lg relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-3xl text-gray-600 hover:text-gray-800 transition mt-10"
          onClick={onClose}
        >
          <IoCloseCircleOutline />
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Image Slider */}
          <div className="w-full md:w-1/3 mt-15">
            <Slider
              asNavFor={nav2}
              ref={(slider) => (sliderRef1.current = slider)}
            >
              {images.map((image, index) => (
                <div
                  key={index}
                  className="border-2 h-[300px] flex items-center justify-center"
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index}`}
                    className="object-contain max-h-full cursor-pointer"
                    onClick={() => setCurrentImage(index)}
                  />
                </div>
              ))}
            </Slider>

            <Slider
              asNavFor={nav1}
              ref={(slider) => (sliderRef2.current = slider)}
              slidesToShow={4}
              swipeToSlide
              focusOnSelect
              arrows
              nextArrow={<CustomNextArrow />}
              prevArrow={<CustomPrevArrow />}
            >
              {images.map((image, index) => (
                <div key={index} className="border-2 p-1">
                  <img
                    src={image}
                    alt={`Thumbnail ${index}`}
                    className="object-contain max-h-20 cursor-pointer"
                    onClick={() => setCurrentImage(index)}
                  />
                </div>
              ))}
            </Slider>
          </div>

          {/* Product Details */}
          <div className="w-full md:w-2/3 bg-white p-4 rounded-lg">
            <h1 className="text-2xl font-semibold mb-2">
              Intel Core i9-13900KS Special Edition 13th Gen 24-Core 32-Thread
              Unlocked Desktop Processor
            </h1>

            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <div>
                <span>No Ratings Yet</span> · <span>0 Sold</span>
              </div>
              <span className="cursor-pointer hover:underline">Report</span>
            </div>

            <div className="flex flex-row gap-7">
              <div className="text-2xl font-bold text-green-700 mb-4">
                ₱15,009 - ₱21,741
              </div>

              <div className="flex items-center mb-4 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Share:</span>
                  <FaFacebookMessenger className="text-xl hover:text-green-500 cursor-pointer" />
                  <FaFacebook className="text-xl hover:text-green-500 cursor-pointer" />
                  <AiFillInstagram className="text-2xl hover:text-green-500 cursor-pointer" />
                  <FaXTwitter className="text-2xl hover:text-green-500 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Variations */}
            <div className="mb-4">
              <label className="block font-medium mb-2">Variation</label>
              <div className="flex gap-2 flex-wrap">
                <button className="border px-3 py-1 rounded hover:border-black">
                  a8 7680 8G/120ssd
                </button>
                <button className="border px-3 py-1 rounded hover:border-black">
                  a8 7680 8G/256ssd
                </button>
              </div>
            </div>

            {/* Monitor Size */}
            <div className="mb-4">
              <label className="block font-medium mb-2">Monitor</label>
              <div className="flex gap-2 flex-wrap">
                <button className="border px-3 py-1 rounded hover:border-black">
                  18.5 inches
                </button>
                <button className="border px-3 py-1 rounded hover:border-black">
                  23.8 inches
                </button>
                <button className="border px-3 py-1 rounded hover:border-black">
                  21.5 inches
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-2 flex flex-row gap-2">
              <label className="block font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-1 border rounded hover:bg-gray-100 bg-green-400"
                >
                  −
                </button>
                <input
                  type="text"
                  readOnly
                  value={quantity}
                  className="w-12 text-center border rounded py-1"
                />
                <button
                  onClick={() =>
                    setQuantity((prev) => Math.min(prev + 1, stock))
                  }
                  className="px-3 py-1 border rounded hover:bg-gray-100 bg-green-400"
                >
                  +
                </button>
                <span className="text-gray-500">{stock} pieces available</span>
              </div>
            </div>

            {/* Buttons */}
            <Link
              to={`/products/details/${product?.id}`}
              className="block text-center text-blue-500 hover:underline mb-4"
            >
              View More Details
            </Link>

            <div className="flex gap-3">
              <Link
                to="/wishlist"
                onClick={(e) => {
                  e.preventDefault();
                  toast.success("Added to cart!", {
                    description: "Your product has been successfully added.",
                  });
                }}
                className="flex-1 border bg-green-400 text-black font-medium py-2 rounded hover:bg-green-900 hover:text-white transition text-center"
              >
                Add To Cart
              </Link>
              <Link
                to="/cart"
                className="flex-1 bg-green-400 text-black font-medium py-2 rounded hover:bg-green-900 hover:text-white transition text-center"
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

export default ProductModal;
