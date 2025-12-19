import React, { useState, useEffect } from "react";
import ProductModal from "../../ProductModal/ProductModal";
import { supabase } from "../../../../../lib/supabase";

const pageSize = 6;

const CompComponents = ({ product }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [compatibleProducts, setCompatibleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompatibleProducts = async () => {
      // Check if product has compatibility tags
      if (!product?.compatibility_tags || product.compatibility_tags.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
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
          console.error('Error fetching compatible products:', error);
          setCompatibleProducts([]);
        } else {
          console.log(`Found ${data.length} compatible products for tags:`, product.compatibility_tags);
          setCompatibleProducts(data || []);
        }
      } catch (err) {
        console.error('Error:', err);
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
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Compatible Components</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-600">Loading compatible products...</span>
        </div>
      </div>
    );
  }

  if (compatibleProducts.length === 0) {
    return null;
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
    <>
      <h2 className="text-lg font-semibold mt-6 mb-4">Compatible Components</h2>
      <p className="text-sm text-gray-600 mb-4">
        Products that work with this item based on compatibility tags
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {paginatedData.map((comp) => {
          // Get first image or use placeholder
          const imageUrl = comp.images && comp.images.length > 0 
            ? comp.images[0] 
            : "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?auto=format&fit=crop&w=400&q=80";

          return (
            <div
              key={comp.id}
              className="bg-white border p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition"
              onClick={() => handleOpenModal(comp)}
            >
              <div className="h-32 w-full mb-3 flex items-center justify-center bg-gray-50 rounded overflow-hidden">
                <img
                  src={imageUrl}
                  alt={comp.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              <h3 className="font-semibold text-gray-800 mb-1 truncate" title={comp.name}>
                {comp.name}
              </h3>
              
              {/* Show matching tags */}
              <div className="flex flex-wrap gap-1 mb-2">
                {comp.compatibility_tags && comp.compatibility_tags.slice(0, 2).map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {comp.compatibility_tags && comp.compatibility_tags.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{comp.compatibility_tags.length - 2}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-600 font-bold text-lg">
                  ₱{comp.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <p className="text-xs text-gray-500">
                Stock: {comp.stock_quantity > 0 ? `${comp.stock_quantity} available` : 'Out of stock'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 gap-2">
        <button
          className="px-3 py-1 rounded border bg-gray-100 text-gray-700 hover:bg-gray-200"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded border ${
              currentPage === i + 1
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="px-3 py-1 rounded border bg-gray-100 text-gray-700 hover:bg-gray-200"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        >
          Next
        </button>
      </div>

      {/* Product Modal */}
      {modalOpen && selectedComponent && (
        <ProductModal product={selectedComponent} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default CompComponents;
