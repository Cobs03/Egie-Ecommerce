import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";
import { supabase } from "../../../lib/supabase";
import ReviewService from "../../../services/ReviewService";
import { ProductService } from "../../../services/ProductService";
import { useScrollAnimation } from "../../../hooks/useScrollAnimation";
import { useCart } from "../../../context/CartContext";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const TopSeller = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const { addToCart, user } = useCart();

  // Handle Add to Cart from carousel
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

    // Add to cart
    setAddingToCart(product.id);
    await addToCart({
      product_id: product.id,
      product_name: product.title,
      variant_name: selectedVariant,
      price: product.price,
      quantity: 1
    });
    setAddingToCart(null);
  };

  // Helper function to get stock status color
  const getStockStatusColor = (stockStatus) => {
    switch (stockStatus) {
      case "In Stock":
        return "text-green-500";
      case "Low Stock":
        return "text-orange-500";
      case "Out of Stock":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  // Fetch top sellers from database based on order counts (same algorithm as admin dashboard)
  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        setLoading(true);
        
        // Use database function to get top sellers (bypasses RLS)
        const { data: topSellersData, error: sellersError } = await supabase
          .rpc('get_top_selling_products', { limit_count: 5 });

        if (sellersError) {
          console.error('Error fetching top sellers:', sellersError);
          throw sellersError;
        }
        
        console.log('Top Sellers data:', topSellersData);
        
        const topProductIds = (topSellersData || []).map(item => item.product_id);
        
        if (topProductIds.length === 0) {
          console.log('No order data found. Using fallback: newest products');
          // Fallback to newest products if no orders
          const { data: fallbackProducts, error: fallbackError } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(5);

          if (fallbackError) throw fallbackError;
          
          const transformed = await Promise.all(
            fallbackProducts.map(async (product) => {
              // Transform product data using ProductService
              const transformedProduct = ProductService.transformProductData(product);
              
              // Get review summary
              const { data: summary } = await ReviewService.getProductRatingSummary(product.id);
              
              return {
                ...transformedProduct,
                reviews: summary?.total_reviews || 0,
                averageRating: summary?.average_rating || 0,
                displayPrice: `₱${transformedProduct.price.toLocaleString()}`,
                displayOldPrice: transformedProduct.oldPrice ? `₱${transformedProduct.oldPrice.toLocaleString()}` : null,
                image: transformedProduct.imageUrl,
              };
            })
          );
          setProducts(transformed);
          setLoading(false);
          return;
        }

        // Fetch product details for top sellers
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', topProductIds)
          .eq('status', 'active');

        if (productsError) throw productsError;

        // IMPORTANT: Maintain the sort order from topProductIds
        // Map products in the exact order they were ranked
        const sortedProducts = await Promise.all(
          topProductIds
            .map(id => productsData.find(p => p.id === id))
            .filter(Boolean)
            .map(async (product) => {
              // Transform product data using ProductService
              const transformedProduct = ProductService.transformProductData(product);
              
              // Get review summary
              const { data: summary } = await ReviewService.getProductRatingSummary(product.id);
              
              return {
                ...transformedProduct,
                reviews: summary?.total_reviews || 0,
                averageRating: summary?.average_rating || 0,
                displayPrice: `₱${transformedProduct.price.toLocaleString()}`,
                displayOldPrice: transformedProduct.oldPrice ? `₱${transformedProduct.oldPrice.toLocaleString()}` : null,
                image: transformedProduct.imageUrl,
              };
            })
        );

        setProducts(sortedProducts);
      } catch (error) {
        console.error('Error fetching top sellers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSellers();
  }, []);

  return (
    <div 
      ref={ref}
      className={`mb-4 p-10 relative transition-all duration-1000 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-2xl font-semibold">TOP SELLERS</h2>
        <Link
          to="/products"
          className="text-green-600 hover:underline font-medium text-sm"
        >
          See all Products
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading top sellers...</p>
        </div>
      ) : (
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product, index) => (
            <CarouselItem
              key={index}
              className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/4 xl:basis-1/5"
            >
              <div
                onClick={() => setSelectedProduct(product)}
                className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-500 cursor-pointer overflow-hidden group active:scale-95 h-full flex flex-col"
              >
                <div className="w-full h-32 sm:h-36 md:h-40 bg-gray-50 relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                    draggable="false"
                  />
                  {/* Add to Cart Icon Button - Shows on hover */}
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={addingToCart === product.id}
                    className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-green-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Add to Cart"
                  >
                    {addingToCart === product.id ? (
                      <div className="animate-spin h-[18px] w-[18px] border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <ShoppingCart size={18} />
                    )}
                  </button>
                </div>
                <div className="p-3 flex flex-col flex-grow">
                  <h4 className="select-none text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                    {product.title}
                  </h4>
                  <span className="text-gray-500 text-xs mb-2 select-none">
                    Reviews ({product.reviews})
                  </span>
                  <div className="flex items-center gap-2 mb-2 mt-auto">
                    <span className="text-lg font-bold text-green-600 select-none">
                      {product.displayPrice}
                    </span>
                    {product.displayOldPrice && (
                      <span className="text-sm line-through text-gray-400 select-none">
                        {product.displayOldPrice}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold select-none ${getStockStatusColor(
                      product.stockStatus
                    )}`}
                  >
                    {product.stockStatus}
                  </span>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="flex" />
        <CarouselNext className="flex" />
      </Carousel>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default TopSeller;
