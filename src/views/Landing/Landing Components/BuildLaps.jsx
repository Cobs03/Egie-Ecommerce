import React, { useState, useEffect } from "react";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import ReviewService from "../../../services/ReviewService";
import { ProductService } from "../../../services/ProductService";
import BuildService from "../../../services/BuildService";
import { useScrollAnimation } from "../../../hooks/useScrollAnimation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { MdComputer } from "react-icons/md";
import { FaHeart, FaRegHeart, FaShoppingCart, FaEye } from "react-icons/fa";
import { toast } from "sonner";

const BuildLaps = ({ set }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedBuilds, setLikedBuilds] = useState(new Set());
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const navigate = useNavigate();

  // Helper function to determine stock status based on quantity
  const getStockStatus = (stockQuantity) => {
    if (stockQuantity === 0) return "Out of Stock";
    if (stockQuantity <= 10) return "Low Stock";
    return "In Stock";
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

  // Helper function to get first product image from a build
  const getFirstProductImage = (components) => {
    if (!components) return null;
    const firstComponent = Object.values(components)[0];
    return firstComponent?.image || firstComponent?.image_url || null;
  };

  // Helper function to get build stock status
  const getBuildStockStatus = (components) => {
    if (!components) return "Out of Stock";
    const firstComponent = Object.values(components)[0];
    const stock = firstComponent?.stock_quantity || 0;
    if (stock === 0) return "Out of Stock";
    if (stock <= 4) return "Low Stock";
    return "In Stock";
  };
  // Fetch products or builds from database based on set type
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (set === "two") {
          // For custom builds, fetch public PC builds
          const publicBuilds = await BuildService.getPublicBuilds();
          
          // Calculate popularity score and sort
          const buildsWithScore = (publicBuilds || []).map(build => {
            const likes = build.likes_count || 0;
            const purchases = build.purchase_count || 0;
            const views = build.view_count || 0;
            
            // Popularity algorithm: purchases weighted highest, then likes, then views
            const score = (purchases * 5) + (likes * 3) + (views * 1);
            
            // Add recency bonus (builds from last 7 days get +10 score)
            const daysSinceCreation = Math.floor((new Date() - new Date(build.created_at)) / (1000 * 60 * 60 * 24));
            const recencyBonus = daysSinceCreation <= 7 ? 10 : 0;
            
            return {
              ...build,
              popularityScore: score + recencyBonus
            };
          });
          
          // Sort by popularity score descending
          buildsWithScore.sort((a, b) => b.popularityScore - a.popularityScore);
          
          setBuilds(buildsWithScore);
          
          // Check which builds current user has liked
          const liked = new Set();
          for (const build of buildsWithScore) {
            const hasLiked = await BuildService.hasLiked(build.id);
            if (hasLiked) {
              liked.add(build.id);
            }
          }
          setLikedBuilds(liked);
        } else {
          // For laptops, filter by laptop category
          const { data: allProducts, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'active');

          if (error) throw error;

          let filteredProducts = [];
          const { data: categories } = await supabase
            .from('product_categories')
            .select('id, name')
            .ilike('name', '%laptop%')
            .limit(1);
          
          if (categories && categories.length > 0) {
            const laptopCategoryId = categories[0].id;
            filteredProducts = allProducts.filter(product => {
              const components = product.selected_components || [];
              return components.some(comp => comp.id === laptopCategoryId);
            });
          }

          // Fetch review counts for each product
          const productsWithReviews = await Promise.all(
            filteredProducts.map(async (product) => {
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
              };
            })
          );

          setProducts(productsWithReviews);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setProducts([]);
        setBuilds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [set]);

  // Use the same products array for both sections (now dynamically filtered)
  const handleBuildClick = (build) => {
    // Increment view count
    BuildService.incrementViews(build.id);
    navigate('/buildpc', { state: { loadBuild: build } });
  };

  const handleLike = async (e, buildId) => {
    e.stopPropagation();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please login to like builds');
        return;
      }

      const isLiked = likedBuilds.has(buildId);
      
      if (isLiked) {
        await BuildService.unlikeBuild(buildId);
        setLikedBuilds(prev => {
          const newSet = new Set(prev);
          newSet.delete(buildId);
          return newSet;
        });
        // Update local state
        setBuilds(prev => prev.map(b => 
          b.id === buildId ? { ...b, likes_count: (b.likes_count || 0) - 1 } : b
        ));
        toast.success('Build unliked');
      } else {
        await BuildService.likeBuild(buildId);
        setLikedBuilds(prev => new Set([...prev, buildId]));
        // Update local state
        setBuilds(prev => prev.map(b => 
          b.id === buildId ? { ...b, likes_count: (b.likes_count || 0) + 1 } : b
        ));
        toast.success('Build liked!');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to like build');
    }
  };

  const displayProducts = products;
  const displayBuilds = builds;

  const title = set === "two" ? "Custom Builds" : "Laptops";

  const background =
    set === "two"
      ? "https://i.ibb.co/WWcLwGxH/4257d09c69455402fc76c66a9313ee5f.jpg"
      : "https://i.ibb.co/R4YSKSL4/b310a539380948d9611d50da5dae969b.jpg";

  return (
    <div 
      ref={ref}
      className={`product-display flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8 transition-all duration-1000 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Custom Build Section */}
      <div
        className="mb-6 lg:mb-0 lg:mr-8 w-full lg:w-64 h-48 lg:h-auto mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center bg-amber-800 rounded-lg p-4 sm:p-6 bg-cover bg-center flex-shrink-0"
        style={{ backgroundImage: `url(${background})` }}
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-100 mb-2 mt-4 lg:mt-30">
          {title}
        </h2>
        <Link
          to={set === "two" ? "/buildpc" : "/products"}
          className="text-green-400 hover:underline text-base sm:text-lg transition-colors"
        >
          {set === "two" ? "Build Your PC" : "See All Products"}
        </Link>
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">
              Loading {set === "two" ? "saved builds" : "laptops"}...
            </p>
          </div>
        ) : set === "two" ? (
          // Show saved PC builds
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {/* Saved builds */}
              {displayBuilds.map((build, index) => {
                const componentCount = Object.keys(build.components || {}).length;
                const firstImage = getFirstProductImage(build.components);
                const stockStatus = getBuildStockStatus(build.components);
                const isLiked = likedBuilds.has(build.id);
                
                return (
                  <CarouselItem
                    key={index}
                    className="pl-2 md:pl-4 basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => handleBuildClick(build)}
                          className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col p-3 sm:p-4 active:scale-95 active:shadow-sm"
                        >
                          {/* Like button */}
                          <button
                            onClick={(e) => handleLike(e, build.id)}
                            className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all hover:scale-110"
                          >
                            {isLiked ? (
                              <FaHeart className="text-red-500 text-lg" />
                            ) : (
                              <FaRegHeart className="text-gray-600 text-lg" />
                            )}
                          </button>

                          {firstImage ? (
                            <img
                              src={firstImage}
                              alt={build.build_name}
                              className="rounded-md object-contain bg-gray-100 mb-3 sm:mb-4 h-32 sm:h-36 md:h-40 w-full"
                            />
                          ) : (
                            <div className="rounded-md bg-gray-100 mb-3 sm:mb-4 h-32 sm:h-36 md:h-40 w-full flex items-center justify-center">
                              <MdComputer className="text-gray-400 text-5xl" />
                            </div>
                          )}
                          <div className="flex flex-col flex-grow justify-between">
                            <span
                              className={`text-xs sm:text-sm font-semibold mb-2 select-none ${getStockStatusColor(
                                stockStatus
                              )}`}
                            >
                              {stockStatus} ({componentCount})
                            </span>
                            <h4 className="select-none font-medium text-gray-800 overflow-hidden text-ellipsis line-clamp-2 text-sm sm:text-base mb-1">
                              {build.build_name}
                            </h4>
                            
                            {/* Creator username */}
                            <p className="text-xs text-gray-500 mb-2">
                              by {build.created_by_username || 'Anonymous'}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                              <span className="flex items-center gap-1">
                                <FaHeart className="text-red-500" />
                                {build.likes_count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaShoppingCart className="text-blue-500" />
                                {build.purchase_count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaEye className="text-gray-500" />
                                {build.view_count || 0}
                              </span>
                            </div>

                            <span className="text-gray-500 select-none text-xs sm:text-sm mb-2">
                              Components ({componentCount})
                            </span>
                            <div className="mt-auto">
                              <div className="flex flex-wrap items-baseline gap-1">
                                <span className="text-indigo-600 font-bold text-sm sm:text-base select-none">
                                  ₱{build.total_price?.toLocaleString() || '0'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        sideOffset={6}
                        className="z-50 overflow-hidden rounded-md bg-gray-800 px-3 py-1 text-xs text-white shadow-md"
                      >
                        {build.build_name}
                      </TooltipContent>
                    </Tooltip>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="flex" />
            <CarouselNext className="flex" />
          </Carousel>
        ) : (
          // Show laptop products
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {displayProducts.map((product, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col p-3 sm:p-4 active:scale-95 active:shadow-sm"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="rounded-md object-contain bg-gray-100 mb-3 sm:mb-4 h-32 sm:h-36 md:h-40 w-full"
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
                          <h4 className="select-none font-medium text-gray-800 overflow-hidden text-ellipsis line-clamp-2 text-sm sm:text-base mb-1">
                            {product.title}
                          </h4>
                          <span className="text-gray-500 select-none text-xs sm:text-sm mb-2">
                            Reviews ({product.reviews})
                          </span>
                          <div className="mt-auto">
                            <div className="flex flex-wrap items-baseline gap-1">
                              <span className="text-indigo-600 font-bold text-sm sm:text-base select-none">
                                {product.displayPrice}
                              </span>
                              {product.displayOldPrice && (
                                <span className="line-through text-gray-400 text-[10px] sm:text-xs select-none">
                                  {product.displayOldPrice}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      sideOffset={6}
                      className="z-50 overflow-hidden rounded-md bg-gray-800 px-3 py-1 text-xs text-white shadow-md"
                    >
                      {product.title}
                    </TooltipContent>
                  </Tooltip>
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
    </div>
  );
};

export default BuildLaps;
