import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import BuildService from "../../../services/BuildService";
import { useCart } from "../../../context/CartContext";
import { useScrollAnimation } from "../../../hooks/useScrollAnimation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FaDesktop, FaPlus, FaEye } from "react-icons/fa";
import { MdComputer } from "react-icons/md";

const SavedBuilds = () => {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useCart();
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  useEffect(() => {
    if (user) {
      loadBuilds();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadBuilds = async () => {
    try {
      setLoading(true);
      const userBuilds = await BuildService.getUserBuilds();
      setBuilds(userBuilds);
    } catch (error) {
      console.error('Failed to load builds:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComponentCount = (components) => {
    return Object.keys(components || {}).length;
  };

  // Get the first product's image from the build
  const getFirstProductImage = (components) => {
    if (!components) return null;
    const firstComponent = Object.values(components)[0];
    return firstComponent?.image || firstComponent?.image_url || null;
  };

  // Get stock status for the build (based on first component as example)
  const getBuildStockStatus = (components) => {
    if (!components || Object.keys(components).length === 0) return "Out of Stock";
    const firstComponent = Object.values(components)[0];
    const stock = firstComponent?.stock_quantity || 0;
    if (stock === 0) return "Out of Stock";
    if (stock <= 4) return "Low Stock";
    return "In Stock";
  };

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

  // If not logged in or no builds, show call-to-action in same card style
  if (!user || builds.length === 0) {
    return (
      <div
        ref={ref}
        className={`mb-16 transition-all duration-1000 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {/* Custom Build Card - Call to Action */}
            <CarouselItem className="pl-2 md:pl-4 basis-[280px] md:basis-[300px]">
              <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100">
                <Link to={!user ? "/signin" : "/buildpc"} className="block">
                  {/* Image Section */}
                  <div className="relative h-[280px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 text-center p-6">
                      <MdComputer className="text-white text-7xl mb-4 mx-auto opacity-90" />
                      <h3 className="text-white text-2xl font-bold mb-2">Custom Builds</h3>
                      <p className="text-white/90 text-sm">See All Products</p>
                    </div>
                  </div>
                </Link>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`mb-16 transition-all duration-1000 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10"
      }`}
    >
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {/* Custom Build Card - First */}
          <CarouselItem className="pl-2 md:pl-4 basis-[280px] md:basis-[300px]">
            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100">
              <Link to="/buildpc" className="block">
                {/* Image Section */}
                <div className="relative h-[280px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10 text-center p-6">
                    <MdComputer className="text-white text-7xl mb-4 mx-auto opacity-90" />
                    <h3 className="text-white text-2xl font-bold mb-2">Custom Builds</h3>
                    <p className="text-white/90 text-sm">See All Products</p>
                  </div>
                </div>
              </Link>
            </div>
          </CarouselItem>

          {/* Saved Builds Cards */}
          {builds.map((build) => {
            const stockStatus = getBuildStockStatus(build.components);
            const stockColor = getStockStatusColor(stockStatus);
            const productImage = getFirstProductImage(build.components);
            const componentCount = getComponentCount(build.components);

            return (
              <CarouselItem
                key={build.id}
                className="pl-2 md:pl-4 basis-[280px] md:basis-[300px]"
              >
                <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100">
                  <div
                    onClick={() => navigate('/buildpc', { state: { loadBuild: build } })}
                    className="block"
                  >
                    {/* Stock Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stockColor} bg-white shadow-md`}>
                        {stockStatus} ({componentCount})
                      </span>
                    </div>

                    {/* Image Section */}
                    <div className="relative h-[280px] bg-gray-100 flex items-center justify-center overflow-hidden">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={build.build_name}
                          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <MdComputer className="text-gray-300 text-7xl" />
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-4">
                      {/* Build Name */}
                      <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
                        {build.build_name}
                      </h3>

                      {/* Reviews - Show component count instead */}
                      <p className="text-sm text-gray-500 mb-3">
                        Components ({componentCount})
                      </p>

                      {/* Price Section */}
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">
                          ₱{parseFloat(build.total_price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

export default SavedBuilds;
