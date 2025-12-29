import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoCloseCircleOutline } from "react-icons/io5";
import { ShoppingCart } from "lucide-react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { toast } from "sonner";
import { supabase } from "../../../../lib/supabase";
import BundleService from "../../../../services/BundleService";
import { useCart } from "../../../../context/CartContext";

const BundleModal = ({ bundle, onClose }) => {
  const navigate = useNavigate();
  const [bundleData, setBundleData] = useState(null);
  const [bundleProducts, setBundleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { loadCart } = useCart();

  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  let sliderRef1 = useRef(null);
  let sliderRef2 = useRef(null);

  useEffect(() => {
    setNav1(sliderRef1.current);
    setNav2(sliderRef2.current);
  }, []);

  useEffect(() => {
    fetchBundleDetails();
  }, [bundle.id]);

  const fetchBundleDetails = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching bundle details for:', bundle.id);

      // Get bundle details
      const { data: bundleInfo, error: bundleError} = await supabase
        .from('bundles')
        .select('*')
        .eq('id', bundle.id)
        .single();

      if (bundleError) throw bundleError;

      // Get bundle products
      const { data: products, error: productsError } = await supabase
        .from('bundle_products')
        .select('*')
        .eq('bundle_id', bundle.id)
        .order('sort_order');

      if (productsError) throw productsError;

      setBundleData(bundleInfo);
      setBundleProducts(products || []);
      console.log('✅ Bundle loaded:', bundleInfo);
      console.log('✅ Products:', products);
    } catch (error) {
      console.error('❌ Error loading bundle:', error);
      toast.error('Failed to load bundle details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      console.log('🛒 Adding bundle to cart...');

      const result = await BundleService.addBundleToCart(bundle.id);

      if (result.success) {
        toast.success(`✅ Added ${result.itemsAdded} products from bundle to cart!`);
        await loadCart();
        onClose();
      } else {
        toast.error(result.error || 'Failed to add bundle to cart');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to add bundle to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleViewMoreDetails = () => {
    onClose();
    // Navigate to bundle details page
    navigate(`/products/bundle-details/${bundle.id}`);
  };

  // Get unique categories from products
  const categories = bundleProducts.length > 0
    ? ['All', ...new Set(bundleProducts.map(p => p.product_category || 'Other').filter(Boolean))]
    : ['All'];

  // Filter products by category
  const filteredProducts = selectedFilter === 'All'
    ? bundleProducts
    : bundleProducts.filter(p => p.product_category === selectedFilter);

  // Get images for carousel
  const getCarouselImages = () => {
    if (selectedFilter === 'All') {
      // Show bundle images or default
      const bundleImages = bundleData?.images || [];
      return bundleImages.length > 0 ? bundleImages : ['/images/bundle.png'];
    } else {
      // Show images of filtered products
      const productImages = filteredProducts
        .map(p => p.product_image)
        .filter(Boolean);
      return productImages.length > 0 ? productImages : ['/images/bundle.png'];
    }
  };

  const carouselImages = getCarouselImages();

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

  if (loading) {
    return (
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999]"
        onClick={onClose}
      >
        <div className="bg-black text-white p-8 rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p>Loading bundle details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!bundleData) {
    return null;
  }

  const bundleName = bundleData.bundle_name || bundle.name;
  const bundlePrice = bundleData.official_price || bundleData.total_price || bundle.price || 0;
  const bundleDescription = bundleData.description || 'Complete PC Bundle Package';

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
                {carouselImages.map((image, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 h-[400px] flex items-center justify-center"
                  >
                    <img
                      src={image}
                      alt={`Bundle ${index + 1}`}
                      className="object-contain max-h-full max-w-full m-auto"
                      onError={(e) => {
                        e.target.src = '/images/bundle.png';
                      }}
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
                {carouselImages.map((image, index) => (
                  <div key={index} className="px-1">
                    <div className="bg-white rounded-lg p-2 h-20 cursor-pointer hover:opacity-80 transition flex items-center justify-center">
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="object-contain h-full w-full m-auto"
                        onError={(e) => {
                          e.target.src = '/images/bundle.png';
                        }}
                      />
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>

          {/* Bundle Details */}
          <div className="w-full lg:w-1/2 bg-black p-4 rounded-lg">
            <h1 className="text-xl font-semibold mb-2 text-white">
              {bundleName}
            </h1>

            <div className="flex justify-between text-sm text-gray-400 mb-4">
              <div>
                <span>No Ratings Yet</span> · <span>0 Sold</span>
              </div>
            </div>

            <div className="text-3xl font-bold text-green-500 mb-4">
              ₱{parseFloat(bundlePrice).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>

            {bundleData.initial_price && bundleData.initial_price > bundlePrice && (
              <div className="text-lg text-gray-400 line-through mb-2">
                ₱{parseFloat(bundleData.initial_price).toLocaleString()}
              </div>
            )}

            <div className="mb-4">
              <span className="text-green-500 font-semibold">
                Available: In Stock
              </span>
              <span className="text-gray-400 text-sm ml-2">
                ({bundleProducts.length} Products Included)
              </span>
            </div>

            {/* Category Filter */}
            {categories.length > 1 && (
              <div className="mb-6">
                <label className="block font-medium mb-3 text-white">
                  View Products by Category
                </label>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedFilter(category)}
                      className={`border px-4 py-2 rounded text-sm transition-all cursor-pointer active:scale-95 ${
                        selectedFilter === category
                          ? "border-green-500 bg-green-500 text-white active:shadow-inner"
                          : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block font-medium mb-3 text-white">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                  className="border border-green-500 text-green-500 px-4 py-2 rounded hover:bg-green-500 hover:text-white transition-all active:scale-95"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border border-gray-600 bg-gray-800 text-white rounded py-2"
                  min="1"
                />
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="border border-green-500 text-green-500 px-4 py-2 rounded hover:bg-green-500 hover:text-white transition-all active:scale-95"
                >
                  +
                </button>
                <span className="text-sm text-gray-400">pieces available</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 active:shadow-inner"
              >
                <ShoppingCart size={20} />
                {addingToCart ? 'Adding...' : 'Add Entire Bundle'}
              </button>
            </div>

            {/* View More Details Button */}
            <button
              onClick={handleViewMoreDetails}
              className="w-full border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white py-3 rounded-lg font-semibold transition-all active:scale-95"
            >
              VIEW MORE DETAILS
            </button>

            {/* Bundle Description */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="font-semibold mb-2 text-white">Bundle Description</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {bundleDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleModal;
