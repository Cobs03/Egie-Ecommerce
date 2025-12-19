import React, { useState, useEffect } from "react";
import { supabase } from "../../../../../lib/supabase";
import BundleModal from "../../ProductModal/BundleModal";

const Bundles = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const { data, error } = await supabase
          .from('bundles')
          .select('*')
          .eq('status', 'active')
          .limit(4)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching bundles:', error);
          setBundles([]);
        } else {
          // Transform bundle data to match component format
          const transformedBundles = data.map(bundle => ({
            id: bundle.id,
            title: bundle.bundle_name,
            name: bundle.bundle_name,
            price: bundle.official_price || 0,
            oldPrice: bundle.initial_price || bundle.official_price,
            reviews: "No reviews",
            rating: 0,
            images: bundle.images || [],
            description: bundle.description,
            warranty: bundle.warranty,
            stock: 100, // Bundles don't track stock in your schema
            stockStatus: "In Stock"
          }));
          setBundles(transformedBundles);
        }
      } catch (error) {
        console.error('Error:', error);
        setBundles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  const handleBundleClick = (bundle) => {
    setSelectedProduct(bundle);
  };

  // Don't render if no bundles or still loading
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Best Bundles</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (bundles.length === 0) {
    return null; // Hide section if no bundles
  }

  return (
    <>
      {/* Best Bundles Section */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Best Bundles</h2>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-6">
          {bundles.map((bundle, index) => (
            <div
              key={bundle.id || index}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => handleBundleClick(bundle)}
            >
              <img
                src={bundle.images?.[0] || "/images/bundle.png"}
                alt={bundle.title}
                className="w-full h-40 object-contain mb-3"
              />
              <h3 className="text-lg font-semibold mb-1 text-gray-800 line-clamp-2">
                {bundle.title}
              </h3>
              <p className="text-green-600 font-bold mb-1">
                ₱{bundle.price.toLocaleString()}
              </p>
              {bundle.oldPrice > bundle.price && (
                <p className="text-sm text-gray-400 line-through mb-1">
                  ₱{bundle.oldPrice.toLocaleString()}
                </p>
              )}
              <p className="text-sm text-gray-500 mb-2">{bundle.reviews}</p>
              <div className="text-yellow-400 text-lg">
                {"⭐".repeat(bundle.rating)}
                {Array.from({ length: 5 - bundle.rating }).map((_, i) => (
                  <span key={i} className="text-gray-300">
                    ☆
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bundle Modal */}
      {selectedProduct && (
        <BundleModal
          bundle={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
};

export default Bundles;
