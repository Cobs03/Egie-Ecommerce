import React from "react";
import { components } from "../../Data/components";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Category = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <div className="bg-white mb-6 z-40">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">All Categories</h2>
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 z-30">
          {components.map((product, index) => (
            <CarouselItem
              key={index}
              className="pl-2 basis-1/4 md:basis-1/5 lg:basis-1/6"
            >
              <div
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === product.type ? null : product.type
                  )
                }
                className={`bg-white border rounded-lg text-center p-3 transition-all duration-300 hover:shadow-lg flex flex-col items-center gap-2 cursor-pointer ${
                  selectedCategory === product.type
                    ? "border-green-500 shadow-md bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-lg">
                  <img
                    src={product.imageUrl}
                    alt={product.type}
                    className="w-8 h-8 object-contain"
                    draggable="false"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium text-gray-800 select-none">
                    {product.type}
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
