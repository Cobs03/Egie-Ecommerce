import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { useScrollAnimation } from "../../../hooks/useScrollAnimation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Feature = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('product_categories')
          .select('id, name, image_url')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Error fetching categories:', error);
          // Fallback to default products if fetch fails
          setProducts(getDefaultProducts());
        } else {
          // Map categories to match the component structure
          const mappedProducts = data.map(category => ({
            id: category.id,
            name: category.name,
            imageUrl: category.image_url || getDefaultImage(category.name),
          }));
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error('Error:', error);
        setProducts(getDefaultProducts());
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Default fallback products
  const getDefaultProducts = () => [
    {
      name: "Cooling System",
      imageUrl: "https://i.ibb.co/DHY3sTyn/image-1.png",
    },
    { name: "Processor", imageUrl: "https://i.ibb.co/8LxBvBSt/image.png" },
    { name: "Mother Board", imageUrl: "https://i.ibb.co/8gw91RG8/image-2.png" },
    { name: "Memory (RAM)", imageUrl: "https://i.ibb.co/ksRSZgRM/image-3.png" },
    {
      name: "Storage (SSD)",
      imageUrl: "https://i.ibb.co/DDtGVv68/image-4.png",
    },
    {
      name: "Graphics Card",
      imageUrl: "https://i.ibb.co/V0LDbkPw/image-5.png",
    },
    { name: "Power Supply", imageUrl: "https://i.ibb.co/kpGzwFx/image-6.png" },
    {
      name: "Cabinet (Case)",
      imageUrl: "https://i.ibb.co/996JNrzP/image-7.png",
    },
  ];

  // Get default image based on category name
  const getDefaultImage = (name) => {
    const imageMap = {
      "Cooling System": "https://i.ibb.co/DHY3sTyn/image-1.png",
      "Processor": "https://i.ibb.co/8LxBvBSt/image.png",
      "Mother Board": "https://i.ibb.co/8gw91RG8/image-2.png",
      "Memory (RAM)": "https://i.ibb.co/ksRSZgRM/image-3.png",
      "Storage (SSD)": "https://i.ibb.co/DDtGVv68/image-4.png",
      "Graphics Card": "https://i.ibb.co/V0LDbkPw/image-5.png",
      "Power Supply": "https://i.ibb.co/kpGzwFx/image-6.png",
      "Cabinet (Case)": "https://i.ibb.co/996JNrzP/image-7.png",
    };
    return imageMap[name] || "https://via.placeholder.com/150";
  };

  return (
    <div 
      ref={ref}
      className={`bg-gray-100 p-4 sm:p-6 md:p-8 rounded-lg transition-all duration-1000 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
    >
      <p className="text-left mb-4 sm:mb-6 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">
        Featured Products
      </p>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product, index) => (
              <CarouselItem
                key={product.id || index}
                className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
              >
                <div className="bg-white border border-gray-300 rounded-lg text-center p-2 sm:p-3 transition-shadow duration-300 hover:shadow-lg flex flex-row sm:flex-row items-center gap-2 sm:gap-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white flex items-center justify-center">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1 sm:gap-2 max-md:truncate w-full">
                    <p className="text-xs sm:text-sm md:text-base font-bold select-none text-center max-md:truncate w-full">
                      {product.name}
                    </p>
                    <Link
                      to="/products"
                      className="text-blue-500 text-xs sm:text-sm select-none hover:text-blue-700 transition-colors"
                    >
                      View More
                    </Link>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="flex" />
          <CarouselNext className="flex" />
        </Carousel>
      )}
    </div>
  );
};

export default Feature;
