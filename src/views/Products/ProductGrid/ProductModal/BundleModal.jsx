import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
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
  const { loadCart, user } = useCart();
  
  // Rating and sold count states
  const [ratingSummary, setRatingSummary] = useState(null);
  const [soldCount, setSoldCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

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
    fetchBundleStats();
  }, [bundle.id]);

  const fetchBundleStats = async () => {
    try {
      setLoadingStats(true);
      
      // Fetch bundle rating summary
      const { data: ratingData, error: ratingError } = await supabase
        .rpc('get_bundle_rating_summary', { p_bundle_id: bundle.id });
      
      if (!ratingError && ratingData && ratingData.length > 0) {
        setRatingSummary(ratingData[0]);
      } else {
        setRatingSummary(null);
      }

      // Note: Bundles don't have sold count in order_items, would need separate tracking
      // For now, set to 0
      setSoldCount(0);
    } catch (error) {
      console.error('Error fetching bundle stats:', error);
      setRatingSummary(null);
      setSoldCount(0);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchBundleDetails = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      toast.error('Failed to load bundle details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      const result = await BundleService.addBundleToCart(bundle.id);

      if (result.success) {
        toast.success(`✅ Added ${result.itemsAdded} products from bundle to cart!`);
        await loadCart();
        onClose();
      } else {
        toast.error(result.error || 'Failed to add bundle to cart');
      }
    } catch (error) {
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
    return ReactDOM.createPortal(
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]"
        onClick={onClose}
      >
        <div className="bg-black text-white p-8 rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p>Loading bundle details...</p>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  if (!bundleData) {
    return null;
  }

  const bundleName = bundleData.bundle_name || bundle.name;
  const bundlePrice = bundleData.official_price || bundleData.total_price || bundle.price || 0;
  const bundleDescription = bundleData.description || 'Complete PC Bundle Package';

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-black text-white p-6 rounded-lg w-[95%] lg:w-[90%] max-w-7xl max-h-[95vh] overflow-y-auto shadow-lg relative animate-fadeIn modal-scrollbar-hide"
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
            <h1 className="text-2xl font-normal mb-2 text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {bundleName}
            </h1>

            <div className="flex justify-between text-sm text-gray-400 mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <div>
                {loadingStats ? (
                  <span>Loading...</span>
                ) : ratingSummary && ratingSummary.total_reviews > 0 ? (
                  <>
                    <span className="text-yellow-500">★ {ratingSummary.average_rating}</span>
                    <span className="text-gray-400"> ({ratingSummary.total_reviews} {ratingSummary.total_reviews === 1 ? 'review' : 'reviews'})</span>
                    <span> · </span>
                    <span>{soldCount.toLocaleString()} Sold</span>
                  </>
                ) : (
                  <>
                    <span>No Ratings Yet</span> · <span>{soldCount.toLocaleString()} Sold</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-3xl font-normal text-green-500 mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              ₱{parseFloat(bundlePrice).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>

            {bundleData.initial_price && bundleData.initial_price > bundlePrice && (
              <div className="text-base text-gray-500 line-through mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                ₱{parseFloat(bundleData.initial_price).toLocaleString()}
              </div>
            )}

            <div className="mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <span className="text-green-500 font-normal text-base">
                Available: In Stock
              </span>
              <span className="text-gray-400 text-sm ml-2">
                ({bundleProducts.length} Products Included)
              </span>
            </div>

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
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:border-green-500 hover:text-green-500 transition-all cursor-pointer font-normal active:scale-95"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  +
                </button>
                <span className="text-sm text-gray-400 font-normal" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  pieces available
                </span>
              </div>
            </div>

            {/* View More Details */}
            <button
              onClick={handleViewMoreDetails}
              className="block text-blue-400 hover:underline mb-4 text-sm cursor-pointer text-center font-normal w-full"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              VIEW MORE DETAILS
            </button>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!user) {
                    toast.error('Please login to add items to cart');
                    return;
                  }
                  await handleAddToCart();
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
                onClick={async () => {
                  if (!user) {
                    toast.error('Please login to purchase');
                    return;
                  }

                  setAddingToCart(true);
                  const result = await BundleService.addBundleToCart(bundle.id);
                  
                  if (result.success) {
                    await loadCart();
                    setAddingToCart(false);
                    onClose();
                    navigate('/checkout');
                  } else {
                    toast.error(result.error || 'Failed to add bundle to cart');
                    setAddingToCart(false);
                  }
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
    </div>,
    document.body
  );
};

export default BundleModal;
