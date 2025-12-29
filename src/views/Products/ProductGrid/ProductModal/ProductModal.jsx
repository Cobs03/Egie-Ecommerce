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
import { useCart } from "../../../../context/CartContext";

const ProductModal = ({ product, onClose, noBackground = false }) => {
  const { addToCart, user } = useCart();
  const navigate = useNavigate();
  
  // Parse product images from database
  const productImages = product?.images || [];
  const images = productImages.length > 0 ? productImages : [
    product?.imageUrl || "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?auto=format&fit=crop&w=800&q=80"
  ];

  // Parse variants from database
  const productVariants = product?.variants || [];
  const variations = productVariants.map(v => v.sku || v.name).filter(Boolean);
  
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState(
    variations.length > 0 ? variations[0] : null
  );
  const [addingToCart, setAddingToCart] = useState(false);

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

  // Get current variant details
  const currentVariant = productVariants.find(v => 
    (v.sku || v.name) === selectedVariation
  ) || productVariants[0];

  // Calculate stock and pricing
  const stock = currentVariant?.stock || product?.stock_quantity || product?.stock || 0;
  const price = currentVariant?.price || product?.price || 0;
  const oldPrice = currentVariant?.comparePrice || product?.metadata?.officialPrice || product?.oldPrice || price;
  
  // Calculate price range if multiple variants
  const priceRange = productVariants.length > 1 ? {
    min: Math.min(...productVariants.map(v => v.price || 0)),
    max: Math.max(...productVariants.map(v => v.price || 0))
  } : null;

  // Stock status
  const getStockStatus = () => {
    if (stock === 0) return { text: "Out of Stock", color: "text-red-500" };
    if (stock <= 10) return { text: "Low Stock", color: "text-orange-500" };
    return { text: "In Stock", color: "text-green-500" };
  };
  const stockStatus = getStockStatus();

  // Helper function to get stock status color
  const getStockStatusColor = (status) => {
    return status.color;
  };

  const [quantity, setQuantity] = useState(1);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-[999] ${!noBackground ? 'bg-black/80' : ''}`}
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
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 h-[400px] flex items-center justify-center"
                  >
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="object-contain max-h-full max-w-full m-auto"
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
                {images.map((image, index) => (
                  <div key={index} className="px-1">
                    <div className="bg-white rounded-lg p-2 h-20 cursor-pointer hover:opacity-80 transition flex items-center justify-center">
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="object-contain h-full w-full m-auto"
                      />
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full lg:w-1/2 bg-black p-4 rounded-lg">
            <h1 className="text-2xl font-normal mb-2 text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {product?.name || product?.title || "Product Name"}
            </h1>

            <div className="flex justify-between text-sm text-gray-400 mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <div>
                <span>No Ratings Yet</span> · <span>0 Sold</span>
              </div>
            </div>

            <div className="text-3xl font-normal text-green-500 mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {priceRange && priceRange.min !== priceRange.max ? (
                `₱${priceRange.min.toLocaleString()} - ₱${priceRange.max.toLocaleString()}`
              ) : (
                `₱${price.toLocaleString()}`
              )}
            </div>

            {oldPrice > price && (
              <div className="text-base text-gray-500 line-through mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                ₱{oldPrice.toLocaleString()}
              </div>
            )}

            <div className="mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <span className={`${stockStatus.color} font-normal text-base`}>
                Available: {stockStatus.text}
              </span>
              {stock > 0 && stock <= 10 && (
                <span className="text-orange-500 text-sm ml-2">
                  (Only {stock} left!)
                </span>
              )}
            </div>

            {/* Variations */}
            {variations.length > 0 && (
              <div className="mb-4">
                <label className="block font-normal mb-2 text-white text-base" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Variation
                </label>
                <div className="flex gap-3 flex-wrap">
                  {variations.map((variation) => (
                    <button
                      key={variation}
                      onClick={() => setSelectedVariation(variation)}
                      className={`border px-4 py-2.5 rounded text-sm transition-all cursor-pointer font-normal active:scale-95 ${
                        selectedVariation === variation
                          ? "border-green-500 bg-green-500 text-white active:shadow-inner"
                          : "border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-500"
                      }`}
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    >
                      {variation}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-4">
              <label className="block font-normal mb-2 text-white text-base" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:border-green-500 hover:text-green-500 transition-all cursor-pointer font-normal active:scale-95"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  disabled={stock === 0}
                >
                  −
                </button>
                <input
                  type="text"
                  readOnly
                  value={quantity}
                  className="w-20 text-center border border-gray-600 rounded py-2 bg-black text-white font-normal"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                />
                <button
                  onClick={() =>
                    setQuantity((prev) => Math.min(prev + 1, stock))
                  }
                  className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:border-green-500 hover:text-green-500 transition-all cursor-pointer font-normal active:scale-95"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  disabled={stock === 0}
                >
                  +
                </button>
                <span className="text-sm text-gray-400 font-normal" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {stock} pieces available
                </span>
              </div>
            </div>

            {/* View More Details */}
            <Link
              to={`/products/details?type=product&id=${product?.id || ''}`}
              className="block text-blue-400 hover:underline mb-4 text-sm cursor-pointer text-center font-normal"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              VIEW MORE DETAILS
            </Link>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!user) {
                    toast.error('Please login to add items to cart');
                    return;
                  }

                  if (variations.length > 0 && !selectedVariation) {
                    toast.error('Please select a variant');
                    return;
                  }

                  setAddingToCart(true);
                  await addToCart({
                    product_id: product.id,
                    product_name: product.title,
                    variant_name: selectedVariation,
                    price: price,
                    quantity: quantity
                  });
                  setAddingToCart(false);
                }}
                disabled={addingToCart}
                className="flex-1 bg-green-500 text-white font-normal py-3 rounded hover:bg-green-600 transition-all text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 active:shadow-inner"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {addingToCart ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Adding...
                  </>
                ) : (
                  'Add To Cart'
                )}
              </button>

              <button
                onClick={() => {
                  toast.success("Added to compare!", {
                    description: "Product added to comparison list.",
                  });
                }}
                className="flex-1 bg-gray-600 text-white font-normal py-3 rounded hover:bg-gray-700 transition-all text-center cursor-pointer active:scale-95 active:shadow-inner"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                Compare
              </button>

              <button
                onClick={async () => {
                  if (!user) {
                    toast.error('Please login to purchase');
                    return;
                  }

                  if (variations.length > 0 && !selectedVariation) {
                    toast.error('Please select a variant');
                    return;
                  }

                  setAddingToCart(true);
                  await addToCart({
                    product_id: product.id,
                    product_name: product.title,
                    variant_name: selectedVariation,
                    price: price,
                    quantity: quantity
                  });
                  setAddingToCart(false);
                  onClose();
                  navigate('/checkout');
                }}
                disabled={addingToCart}
                className="flex-1 bg-blue-500 text-white font-normal py-3 rounded hover:bg-blue-600 transition-all text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:shadow-inner"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
