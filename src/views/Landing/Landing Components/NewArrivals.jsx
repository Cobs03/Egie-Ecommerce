import React, { useState, useEffect } from "react";
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

const NewArrivals = () => {
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

  // Fetch new arrivals from database
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        
        // Fetch newest products (recently added)
        const { data: productsData, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        // Fetch review counts for each product
        const productsWithReviews = await Promise.all(
          productsData.map(async (product) => {
            // Transform product data using ProductService
            const transformedProduct = ProductService.transformProductData(product);
            
            // Get review summary
            const { data: summary } = await ReviewService.getProductRatingSummary(product.id);
            
            // Use officialPrice (discounted) as main price, initialPrice (original) as old price
            const mainPrice = transformedProduct.metadata?.officialPrice || transformedProduct.price || 0;
            const originalPrice = transformedProduct.metadata?.initialPrice || 0;
            
            return {
              ...transformedProduct,
              reviews: summary?.total_reviews || 0,
              averageRating: summary?.average_rating || 0,
              price: mainPrice, // Update price to discounted price for cart
              displayPrice: `₱${parseFloat(mainPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              displayOldPrice: (originalPrice && originalPrice > mainPrice) ? `₱${parseFloat(originalPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null,
              image: transformedProduct.imageUrl,
            };
          })
        );

        setProducts(productsWithReviews);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  const hardcodedProducts = [
    {
      id: 1,
      name: 'HP Pro One 440 G6 23.8" Touch All-in-One',
      price: "$699.00",
      oldPrice: "$749.00",
      reviews: 5,
      stock: 15,
      stockStatus: "In Stock",
      image:
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      name: "Lenovo Loq 15.6 i5-12450h/16gb/512gb ...",
      price: "$699.00",
      oldPrice: "$749.00",
      reviews: 5,
      stock: 8,
      stockStatus: "Low Stock",
      image:
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      name: "MOD 007B HE PC Magnetic Keyboard, Santorini...",
      price: "$699.00",
      oldPrice: "$749.00",
      reviews: 5,
      stock: 25,
      stockStatus: "In Stock",
      image:
        "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop",
    },
    {
      id: 4,
      name: "Ajazz AJ120 6 Buttons Programmable USB...",
      price: "$699.00",
      oldPrice: "$749.00",
      reviews: 5,
      stock: 12,
      stockStatus: "In Stock",
      image:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
    },
    {
      id: 5,
      name: "Gaming Headset with Microphone",
      price: "$699.00",
      oldPrice: "$749.00",
      reviews: 5,
      stock: 20,
      stockStatus: "In Stock",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    },
  ];

  return (
    <div 
      ref={ref}
      className={`my-4 p-10 relative transition-all duration-1000 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-2xl font-semibold">NEW ARRIVALS</h2>
        <a
          href="/products"
          className="text-green-600 hover:underline font-medium text-sm"
        >
          See all Products
        </a>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading new arrivals...</p>
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

export default NewArrivals;
