import React from "react";
import {components} from "../../Data/components" 

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";


const Category = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <div className="categories-container mt-4 w-[98%]">
      <Carousel>
        <CarouselContent>
          {components.map((product, index) => (
            <CarouselItem
              key={index}
              className="flex justify-center basis-1/6.5 width-16.5"
            >
              <div
                onClick={() => setSelectedCategory(product.type)} // 🟢 click to filter
                className={`bg-white border rounded-lg text-center p-1 transition-shadow duration-300 hover:shadow-lg flex flex-row cursor-pointer ${
                  selectedCategory === product.type
                    ? "border-green-500"
                    : "border-gray-300"
                }`}
              >
                {" "}
                <div className="h-15 w-20 bg-gray-300">
                  <img
                    src={product.imageUrl}
                    alt={product.type}
                    className="max-w-full h-auto select-none"
                    draggable="false"
                  />
                </div>
                <div className="mt-4 mx-4 font-bold">
                  <p className="text-sm mb-2 select-none">{product.type}</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default Category;    