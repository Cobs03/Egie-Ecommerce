import React, { useState, useEffect } from "react";
import ProductModal from "../../ProductModal/ProductModal";
import { supabase } from "../../../../../lib/supabase";
import { useScrollAnimation } from "../../../../../hooks/useScrollAnimation";

const pageSize = 6;

const CompComponents = ({ product }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [compatibleProducts, setCompatibleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompatibleProducts = async () => {
      // Check if product has compatibility tags
      if (!product?.compatibility_tags || product.compatibility_tags.length === 0) {
        console.log('❌ No compatibility_tags found for product:', product?.name);
        console.log('Product data:', product);
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('🔍 Searching for compatible products with tags:', product.compatibility_tags);
      
      try {
        // Query products with matching tags
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .overlaps('compatibility_tags', product.compatibility_tags) // Find products with ANY matching tags
          .neq('id', product.id) // Exclude current product
          .eq('status', 'active') // Only show active products
          .limit(12); // Fetch more for pagination

        if (error) {
          console.error('❌ Error fetching compatible products:', error);
          setCompatibleProducts([]);
        } else {
          console.log(`✅ Found ${data.length} compatible products for tags:`, product.compatibility_tags);
          setCompatibleProducts(data || []);
        }
      } catch (err) {
        console.error('❌ Error:', err);
        setCompatibleProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompatibleProducts();
  }, [product]);

  // If no compatible products found, don't render this section
  if (loading) {
    return (
      <div className="py-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Compatible Components</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent"></div>
          <span className="ml-4 text-gray-600 text-lg">Loading compatible products...</span>
        </div>
      </div>
    );
  }

  // Show debug info when no compatibility tags exist
  if (!product?.compatibility_tags || product.compatibility_tags.length === 0) {
    return (
      <div className="py-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Compatible Components</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">🔧</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No Compatible Products Yet
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We're working on adding compatibility information for this product. Check back soon to see what works well with it!
          </p>
        </div>
      </div>
    );
  }

  // Show message when no matching products found
  if (compatibleProducts.length === 0) {
    return (
      <div className="py-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Compatible Components</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No Matching Products Found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We couldn't find any compatible products at the moment. Our inventory is constantly being updated, so please check back later!
          </p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(compatibleProducts.length / pageSize);

  const handleOpenModal = (component) => {
    setSelectedComponent(component);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedComponent(null);
  };

  const paginatedData = compatibleProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="py-8 border-t">
      <h2 className="text-2xl font-bold mb-6">Compatible Components</h2>
      <p className="text-sm text-gray-600 mb-6">
        Products that work well with this item based on compatibility tags
      </p>

      {/* Compatible Products List */}
      <div className="space-y-4">
        {paginatedData.map((comp) => {
          // Get first image or use placeholder
          const imageUrl = comp.images && comp.images.length > 0 
            ? comp.images[0] 
            : "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?auto=format&fit=crop&w=400&q=80";

          return (
            <div
              key={comp.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleOpenModal(comp)}
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt={comp.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate" title={comp.name}>
                    {comp.name}
                  </h3>
                  
                  {/* Compatibility Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {comp.compatibility_tags && comp.compatibility_tags.slice(0, 3).map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {comp.compatibility_tags && comp.compatibility_tags.length > 3 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{comp.compatibility_tags.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Price and Stock */}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-green-600 font-bold text-xl">
                      ₱{comp.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`text-sm ${comp.stock_quantity > 0 ? 'text-gray-600' : 'text-red-500'}`}>
                      {comp.stock_quantity > 0 
                        ? `${comp.stock_quantity} in stock` 
                        : 'Out of stock'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-2">
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </button>
          
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`px-3 py-2 rounded-lg border transition-colors ${
                  currentPage === i + 1
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </button>
        </div>
      )}

      {/* Product Modal */}
      {modalOpen && selectedComponent && (
        <ProductModal product={selectedComponent} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default CompComponents;
