import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../../lib/supabase";
import { toast } from "sonner";
import BundleService from "../../../../services/BundleService";
import { useCart } from "../../../../context/CartContext";

// Import components
import TopDetailsBundle from "./DetailsComponents/TopDetailsBundle";
import Description from "./DetailsComponents/Description";
import Warranty from "./DetailsComponents/Warranty";

const BundleDetails = () => {
  const { bundleId } = useParams();
  const navigate = useNavigate();
  const [bundle, setBundle] = useState(null);
  const [bundleProducts, setBundleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Bundle Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2 transition-all active:scale-95"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Bundle Details</h1>
        </div>

        {/* Top Details Section */}
        <TopDetailsBundle 
          product={bundleData} 
          onAddToCart={handleAddToCart}
        />

        {/* Bundle Products Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-2xl font-semibold mb-4">Included Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bundleProducts.map((product, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <img
                  src={product.product_image || '/images/placeholder.png'}
                  alt={product.product_name}
                  className="w-full h-48 object-contain mb-3 bg-gray-50 rounded"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.png';
                  }}
                />
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  {product.product_name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {product.product_code || 'N/A'}
                </p>
                <p className="text-green-600 font-bold text-lg">
                  ₱{parseFloat(product.product_price || 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Description Section */}
        <Description product={bundleData} />

        {/* Warranty Section */}
        {bundle.warranty && (
          <Warranty warranty={bundle.warranty} />
        )}

        {/* Compatible Components Section (if applicable) */}
        {/* You can add this if you want to show compatible products for the bundle */}
      </div>
    </div>
  );
};

export default BundleDetails;
