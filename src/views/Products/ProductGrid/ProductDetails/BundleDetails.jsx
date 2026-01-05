import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../../lib/supabase";
import { toast } from "sonner";
import { FaCube } from "react-icons/fa";
import BundleService from "../../../../services/BundleService";
import { useCart } from "../../../../context/CartContext";

// Import components
import TopDetailsBundle from "./DetailsComponents/TopDetailsBundle";
import Description from "./DetailsComponents/Description";
import Reviews from "./DetailsComponents/Reviews";
import Warranty from "./DetailsComponents/Warranty";
import Bundles from "./DetailsComponents/Bundles";
import ProductModal from "../ProductModal/ProductModal";

const BundleDetails = () => {
  const { bundleId } = useParams();
  const navigate = useNavigate();
  const [bundle, setBundle] = useState(null);
  const [bundleProducts, setBundleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const { loadCart } = useCart();

  useEffect(() => {
    if (bundleId) {
      fetchBundleDetails();
    }
  }, [bundleId]);

  const fetchBundleDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching bundle details for:', bundleId);

      // Get bundle details
      const { data: bundleInfo, error: bundleError } = await supabase
        .from('bundles')
        .select('*')
        .eq('id', bundleId)
        .single();

      if (bundleError) throw bundleError;

      // Get bundle products
      const { data: products, error: productsError } = await supabase
        .from('bundle_products')
        .select('*')
        .eq('bundle_id', bundleId)
        .order('sort_order');

      if (productsError) throw productsError;

      setBundle(bundleInfo);
      setBundleProducts(products || []);
      console.log('✅ Bundle loaded:', bundleInfo);
      console.log('✅ Products:', products);
    } catch (err) {
      console.error('❌ Error loading bundle:', err);
      setError(err.message || 'Failed to load bundle');
      toast.error('Failed to load bundle details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      const result = await BundleService.addBundleToCart(bundleId);

      if (result.success) {
        toast.success(`✅ Added ${result.itemsAdded} products from bundle to cart!`);
        await loadCart();
      } else {
        toast.error(result.error || 'Failed to add bundle to cart');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to add bundle to cart');
    }
  };

  const handleProductClick = async (bundleProduct) => {
    try {
      console.log('🔍 Bundle product clicked:', bundleProduct);
      
      // Check if we have a product_code to search for
      if (!bundleProduct.product_code) {
        console.error('❌ No product_code in bundle product:', bundleProduct);
        toast.error('Product code not found');
        return;
      }

      // Search for product using product_code (SKU)
      const { data: fullProduct, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          brands(id, name, slug, logo_url)
        `)
        .eq('sku', bundleProduct.product_code)
        .single();

      if (productError) {
        console.error('Error fetching product:', productError);
        toast.error('Product not found in store');
        return;
      }

      if (fullProduct) {
        console.log('✅ Product loaded:', fullProduct);
        setSelectedProduct(fullProduct);
        setShowProductModal(true);
      }
    } catch (error) {
      console.error('Error opening product:', error);
      toast.error('Failed to open product');
    }
  };

  const handleViewIn3D = async () => {
    try {
      toast.loading('Loading 3D Builder...');
      console.log('🎨 Preparing bundle for 3D view...');

      // Fetch full product details for all bundle products
      const componentPromises = bundleProducts.map(async (bundleProduct) => {
        if (!bundleProduct.product_code) return null;

        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('sku', bundleProduct.product_code)
          .single();

        if (error || !product) {
          console.warn(`⚠️ Could not find product: ${bundleProduct.product_name}`);
          return null;
        }

        return product;
      });

      const products = await Promise.all(componentPromises);
      const validProducts = products.filter(p => p !== null);

      if (validProducts.length === 0) {
        toast.dismiss();
        toast.error('No products found for 3D view');
        return;
      }

      // Create components object for SystemBuild
      const componentsMap = {};
      validProducts.forEach(product => {
        // Determine component type from category or name
        const category = product.category?.toLowerCase() || product.name?.toLowerCase() || '';
        
        let componentType = null;
        if (category.includes('processor') || category.includes('cpu')) componentType = 'Processor';
        else if (category.includes('motherboard')) componentType = 'Motherboard';
        else if (category.includes('gpu') || category.includes('graphics')) componentType = 'GPU';
        else if (category.includes('ram') || category.includes('memory')) componentType = 'RAM';
        else if (category.includes('ssd')) componentType = 'SSD';
        else if (category.includes('hdd') || category.includes('hard')) componentType = 'HDD';
        else if (category.includes('psu') || category.includes('power')) componentType = 'PSU';
        else if (category.includes('case') || category.includes('casing')) componentType = 'Case';
        else if (category.includes('cooling') || category.includes('cooler')) componentType = 'Cooling';
        else if (category.includes('monitor')) componentType = 'Monitor';
        else if (category.includes('keyboard')) componentType = 'Keyboard';
        else if (category.includes('mouse')) componentType = 'Mouse';
        else if (category.includes('headset') || category.includes('headphone')) componentType = 'Headset';
        else if (category.includes('speaker')) componentType = 'Speaker';
        else if (category.includes('webcam')) componentType = 'Webcam';

        if (componentType) {
          componentsMap[componentType] = product;
        }
      });

      console.log('✅ Loaded components for 3D:', Object.keys(componentsMap));
      toast.dismiss();
      toast.success(`Loaded ${Object.keys(componentsMap).length} components into 3D Builder`);

      // Navigate to buildpc with bundle components
      navigate('/buildpc', {
        state: {
          loadBundle: {
            components: componentsMap,
            bundleName: bundle.bundle_name
          }
        }
      });
    } catch (error) {
      console.error('❌ Error loading bundle in 3D:', error);
      toast.dismiss();
      toast.error('Failed to load 3D view');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bundle details...</p>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error || 'Bundle not found'}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-all active:scale-95 active:shadow-inner"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Transform bundle data to match component format
  const bundleData = {
    id: bundle.id,
    name: bundle.bundle_name,
    title: bundle.bundle_name,
    price: bundle.official_price || bundle.total_price,
    oldPrice: bundle.initial_price || bundle.official_price,
    images: bundle.images || [],
    description: bundle.description,
    warranty: bundle.warranty,
    stock: 100, // Bundles don't track stock
    stockStatus: 'In Stock',
    rating: 0,
    reviews: 'No reviews',
    // Add bundle-specific data
    products: bundleProducts,
    productCount: bundleProducts.length,
    isBundle: true
  };

  return (
    <div className="mt-10">
      {/* Top Details Section */}
      <div className="max-w-8xl mx-auto px-4">
        <TopDetailsBundle product={bundleData} onAddToCart={handleAddToCart} />
      </div>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 py-4 sm:py-6 md:py-8 w-full gap-4 sm:gap-6 md:gap-10">
        {/* Details Left - 75% width on desktop */}
        <div className="flex flex-col mb-4 bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md w-full lg:w-3/4">
          {/* Description Section */}
          <Description product={bundleData} />

          {/* Bundle Products Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Included Products
                </h2>
                <p className="text-gray-500 mt-1">
                  {bundleProducts.length} components in this bundle
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleViewIn3D}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg"
                >
                  <FaCube className="text-lg" />
                  <span className="hidden sm:inline font-semibold">View in 3D Builder</span>
                  <span className="sm:hidden font-semibold">3D View</span>
                </button>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-semibold text-green-700">
                  All Verified
                </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {bundleProducts.map((product, index) => (
                <div
                  key={index}
                  onClick={() => handleProductClick(product)}
                  className="group border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-green-500 transition-all duration-300 bg-white cursor-pointer"
                >
                  <div className="relative mb-4 bg-gray-50 rounded-lg overflow-hidden aspect-square">
                    <img
                      src={product.product_image || "/images/placeholder.png"}
                      alt={product.product_name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "/images/placeholder.png";
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full shadow-sm">
                      <span className="text-xs font-semibold text-gray-600">
                        #{index + 1}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-green-600 transition-colors">
                      {product.product_name}
                    </h3>

                    {product.product_code && (
                      <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
                        {product.product_code}
                      </p>
                    )}

                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-green-600 font-bold text-lg">
                        ₱
                        {parseFloat(product.product_price || 0).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Price Summary */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between max-w-md ml-auto bg-gray-50 p-4 rounded-xl">
                <span className="text-gray-700 font-medium">Bundle Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  ₱
                  {parseFloat(bundleData.price || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              {bundleData.oldPrice &&
                bundleData.oldPrice > bundleData.price && (
                  <div className="flex items-center justify-end gap-2 mt-2 max-w-md ml-auto">
                    <span className="text-sm text-gray-500">
                      Regular Price:
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      ₱{parseFloat(bundleData.oldPrice).toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                      Save ₱
                      {(
                        bundleData.oldPrice - bundleData.price
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
            </div>
          </div>

          <Reviews product={bundleData} />
        </div>

        {/* Details Right - 25% width on desktop */}
        <div className="w-full lg:w-1/4">
          <Warranty product={bundleData} />

          {/* Show Bundles component */}
          <Bundles />
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default BundleDetails;
