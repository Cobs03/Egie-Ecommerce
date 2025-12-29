import React, { useState, useEffect } from "react";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";
import { supabase } from "../../../lib/supabase";
import ReviewService from "../../../services/ReviewService";
import { ProductService } from "../../../services/ProductService";
import { useScrollAnimation } from "../../../hooks/useScrollAnimation";
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
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

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

        setProducts(productsWithReviews);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
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
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-3 sm:p-4 cursor-pointer flex flex-col h-full"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="rounded-md mb-3 sm:mb-4 object-contain h-32 sm:h-36 md:h-40 w-full bg-gray-100"
                />
                <div className="flex flex-col flex-grow justify-between">
                  <span
                    className={`text-xs sm:text-sm font-semibold mb-2 select-none ${getStockStatusColor(
                      product.stockStatus
                    )}`}
                  >
                    {product.stockStatus}
                    {product.stock > 0 && ` (${product.stock})`}
                  </span>
                  <h4 className="select-none text-sm sm:text-base lg:text-lg font-medium text-gray-800 mb-1 overflow-hidden text-ellipsis line-clamp-2">
                    {product.title}
                  </h4>
                  <span className="text-gray-500 text-xs sm:text-sm mb-2 select-none">
                    Reviews ({product.reviews})
                  </span>
                  <div className="mt-auto">
                    <div className="flex items-center space-x-2">
                      {product.displayOldPrice && (
                      <span className="line-through text-gray-400 text-xs sm:text-sm select-none">
                        {product.displayOldPrice}
                      </span>
                      )}
                      <span className="text-indigo-600 font-bold text-sm sm:text-base lg:text-lg select-none">
                        {product.displayPrice}
                      </span>
                    </div>
                  </div>
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
