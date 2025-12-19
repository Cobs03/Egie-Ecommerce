import React from "react";
import { components } from "../../Data/components";
import { useCategories } from "../../../hooks/useCategories";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Category = ({ selectedCategory, setSelectedCategory }) => {
  const { categories: dynamicCategories, loading, error } = useCategories();

  // Create category objects with images for consistency
  const getCategoryData = () => {
    // Map dynamic categories from database
    const categoryData = dynamicCategories.map(category => {
      // Handle both string and object category formats
      const categoryName = typeof category === 'string' ? category : category.name;
      const categoryId = typeof category === 'string' ? category : category.id;
      
      // Priority system for images:
      // 1. Use image_url from database (uploaded image)
      // 2. Use icon_url from database (legacy field)
      // 3. Try to find matching static component image
      // 4. Use default placeholder
      let imageUrl = '/images/default-category.png';
      
      if (typeof category === 'object') {
        // First priority: uploaded image_url
        if (category.image_url) {
          imageUrl = category.image_url;
        }
        // Second priority: legacy icon_url
        else if (category.icon_url) {
          imageUrl = category.icon_url;
        }
        // Third priority: static component image
        else {
          const matchingComponent = components.find(comp => 
            comp.type.toLowerCase() === categoryName.toLowerCase() ||
            comp.type.toLowerCase().includes(categoryName.toLowerCase()) ||
            categoryName.toLowerCase().includes(comp.type.toLowerCase())
          );
          if (matchingComponent?.imageUrl) {
            imageUrl = matchingComponent.imageUrl;
          }
        }
      }

      return {
        type: categoryName,
        id: categoryId,
        imageUrl: imageUrl
      };
    });

    // If we have dynamic categories, use them; otherwise fallback to static
    if (categoryData.length > 0) {
      return categoryData;
    } else {
      return components;
    }
  };

  const categoryData = getCategoryData();

  if (loading) {
    return (
      <div className="bg-white mb-6 z-40">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">All Categories</h2>
        <div className="flex gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg p-3 w-20 h-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white mb-6 z-40">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">All Categories</h2>
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 z-30">
          {categoryData.map((category, index) => (
            <CarouselItem
              key={index}
              className="pl-2 basis-1/4 md:basis-1/5 lg:basis-1/6"
            >
              <div
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.id ? null : category.id
                  )
                }
                className={`bg-white border rounded-lg text-center p-3 transition-all duration-300 hover:shadow-lg flex flex-col items-center gap-2 cursor-pointer ${
                  selectedCategory === category.id
                    ? "border-green-500 shadow-md bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-lg">
                  <img
                    src={category.imageUrl}
                    alt={category.type}
                    className="w-8 h-8 object-contain"
                    draggable="false"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium text-gray-800 select-none">
                    {category.type}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="bg-green-500 text-white hover:bg-green-600 border-green-500" />
        <CarouselNext className="bg-green-500 text-white hover:bg-green-600 border-green-500" />
      </Carousel>
    </div>
  );
};

export default Category;
