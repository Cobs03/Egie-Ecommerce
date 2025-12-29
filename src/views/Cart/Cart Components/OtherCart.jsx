import React, { useState, useEffect } from "react";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";
import { useCart } from "../../../context/CartContext";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { ProductService } from "../../../services/ProductService";
import ReviewService from "../../../services/ReviewService";
import StarRating from "../../../components/StarRating";

const OtherCart = ({ noBackground = false }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);
  const [productRatings, setProductRatings] = useState({});
  
  const { addToCart, user } = useCart();

  // Load random products from database
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Fetch products with stock only
      const result = await ProductService.getFilteredProducts({
        inStock: true
      });

      if (!result.success) {
        console.error('Error loading products:', result.error);
        return;
      }

      // Shuffle and take 8 random products
      const shuffled = (result.data || []).sort(() => Math.random() - 0.5);
      const selectedProducts = shuffled.slice(0, 8);
      setProducts(selectedProducts);
      
      // Load ratings for these products
      const ratings = {};
      for (const product of selectedProducts) {
        const { data } = await ReviewService.getProductRatingSummary(product.id);
        if (data) {
          ratings[product.id] = data;
        }
      }
      setProductRatings(ratings);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add to Cart from grid
  const handleAddToCart = async (e, product) => {
    e.stopPropagation(); // Prevent opening the modal
    
    // Check if user is logged in
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    // Auto-select first variant if product has variants
    let selectedVariant = null;
    if (product.variants && product.variants.length > 0) {
      selectedVariant = product.variants[0].sku || product.variants[0].name || null;
    }

    // Add to cart with first variant (or null if no variants)
    setAddingToCart(product.id);
    await addToCart({
      product_id: product.id,
      product_name: product.title || product.name,
      variant_name: selectedVariant,
      price: product.price,
      quantity: 1
    });
    setAddingToCart(null);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="">
        <h2 className="text-xl font-semibold text-center mb-6">
          You May Also Like
        </h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <h2 className="text-xl font-semibold text-center mb-6">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-7 gap-4 justify-items-center">
        {products.map((product) => {
          // Get first image
          const imageUrl = product.images && product.images.length > 0 
            ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url || '/placeholder.png')
            : '/placeholder.png';

          return (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="bg-white rounded-lg border border-gray-200 p-3 text-center w-full max-w-[180px] hover:shadow-lg transition-shadow duration-200 cursor-pointer flex flex-col relative group"
            >
              {/* Cart Icon - Shows on hover */}
              <button
                onClick={(e) => handleAddToCart(e, product)}
                disabled={addingToCart === product.id}
                className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-600 transition-all opacity-0 group-hover:opacity-100 z-10 disabled:opacity-50"
              >
                {addingToCart === product.id ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <ShoppingCart size={16} />
                )}
              </button>

              {/* Product Image */}
              <div className="mb-2 h-28 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt={product.name || product.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              
              {/* Product Name */}
              <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-1">
                {product.title || product.name}
              </h3>
              
              {/* Reviews - Real ratings from database */}
              <div className="flex items-center justify-center gap-1 mb-1">
                <StarRating 
                  rating={productRatings[product.id]?.average_rating || 0} 
                  size={12} 
                />
                <span className="text-xs text-gray-600">
                  ({productRatings[product.id]?.total_reviews || 0})
                </span>
              </div>
              
              {/* Pricing */}
              <div className="mt-auto flex flex-row justify-between items-center">
                <div className="text-green-600 font-bold text-base">
                  ₱{product.price.toLocaleString()}
                </div>
                {product.metadata?.officialPrice && product.metadata.officialPrice > product.price && (
                  <div className="text-gray-500 line-through text-xs">
                    ₱{product.metadata.officialPrice.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          noBackground={noBackground}
        />
      )}
    </div>
  );
};

export default OtherCart;
