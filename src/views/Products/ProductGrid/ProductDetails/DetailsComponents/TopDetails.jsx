import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5";
import { toast } from "sonner";

const ProductDetails = ({ product }) => {
  const [selectedVariation, setSelectedVariation] = useState("83A10024US");
  const [quantity, setQuantity] = useState(1);

  const images = [
    "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1526178613658-3f1622045544?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=400&q=80",
  ];

  const variations = ["83A10024US", "83A1002MMX", "83A1A021KR", "83A1A019PH"];
  const stock = product?.stock || 1404;

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

  return (
    <div className="container mx-auto py-10 px-10 text-white ">
      <div className="flex flex-col lg:flex-row gap-8 mt-2 bg-white py-8 shadow-md rounded-2xl">
        {/* Image Slider */}
        <div className="w-full lg:w-1/2">
          {/* Main Image */}
          <div className="mb-4">
            <Slider
              asNavFor={nav2}
              ref={(slider) => (sliderRef1.current = slider)}
              arrows={false}
              dots={false}
              infinite
              speed={500}
              slidesToShow={1}
              slidesToScroll={1}
            >
              {images.map((image, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 h-[400px] flex items-center justify-center"
                >
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="object-cover max-h-full max-w-full"
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
              arrows
              nextArrow={<CustomNextArrow />}
              prevArrow={<CustomPrevArrow />}
              infinite
              speed={500}
            >
              {images.map((image, index) => (
                <div key={index} className="px-1">
                  <div className="bg-white rounded-lg p-2 h-20 flex items-center justify-center cursor-pointer hover:opacity-80 transition">
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

        {/* Product Details */}
        <div className="w-full lg:w-1/2 p-4 rounded-lg">
          <h1 className="text-2xl font-semibold mb-2 text-gray-800">
            {product?.name || "Lenovo IdeaPad Slim 3i Laptop"}
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
            <span className="text-black font-semibold">
              Available: <span className="text-green-500">In Stock</span>
            </span>
          </div>

          {/* Variations */}
          <div className="mb-6">
            <label className="block font-medium mb-3 text-gray-800">
              Variation
            </label>
            <div className="flex gap-2 flex-wrap">
              {variations.map((variation) => (
                <button
                  key={variation}
                  onClick={() => setSelectedVariation(variation)}
                  className={`border px-4 py-2 rounded text-sm transition cursor-pointer ${
                    selectedVariation === variation
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                  }`}
                >
                  {variation}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="block font-medium mb-3 text-gray-800">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-2 border border-green-500 rounded text-green-500 hover:bg-green-500 hover:text-white transition cursor-pointer"
              >
                −
              </button>
              <input
                type="text"
                readOnly
                value={quantity}
                className="w-16 text-center border border-green-500 rounded py-2 bg-transparent text-gray-800"
              />
              <button
                onClick={() => setQuantity((prev) => Math.min(prev + 1, stock))}
                className="px-3 py-2 border border-green-500 rounded text-green-500 hover:bg-green-500 hover:text-white transition cursor-pointer"
              >
                +
              </button>
              <span className="text-sm text-gray-400">
                {stock} pieces available
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() =>
                toast.success("Added to cart!", {
                  description: "Your product has been successfully added.",
                })
              }
              className="flex-1 bg-green-500 text-white font-medium py-3 rounded hover:bg-green-600 transition cursor-pointer"
            >
              Add To Cart
            </button>
            <button
              onClick={() =>
                toast.success("Added to compare!", {
                  description: "Product added to comparison list.",
                })
              }
              className="flex-1 bg-blue-500 text-white font-medium py-3 rounded hover:bg-blue-600 transition cursor-pointer"
            >
              Compare
            </button>
            <Link
              to="/cart"
              className="flex-1 bg-green-500 text-white font-medium py-3 rounded hover:bg-green-600 transition text-center"
            >
              Buy Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
