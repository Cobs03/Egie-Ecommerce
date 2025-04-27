import React from "react";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Feature = () => {
  const products = [
    { name: "Cooling System", imageUrl: "/cooling-system.png" },
    { name: "Processor", imageUrl: "/processor.png" },
    { name: "Mother Board", imageUrl: "/mother-board.png" },
    { name: "Memory (RAM)", imageUrl: "/memory.png" },
    { name: "Storage (SSD)", imageUrl: "/storage.png" },
    { name: "Graphics Card", imageUrl: "/graphics-card.png" },
    { name: "Power Supply", imageUrl: "/power-supply.png" },
    { name: "Cabinet (Case)", imageUrl: "/cabinet.png" },
  ];

  
  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <p className="text-left mb-6 text-3xl">Featured Products</p>
      <Carousel>
        <CarouselContent>
          {products.map((product, index) => (
            <CarouselItem
              key={index}
              className="flex justify-center basis-1/6.5 width-1/6.5"
            >
              <div className="bg-white border border-gray-300 rounded-lg text-center p-1 transition-shadow duration-300 hover:shadow-lg flex flex-row">
                <div className="h-20 w-20 bg-red-500">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="max-w-full h-auto"
                  />
                </div>
                <div className="mt-4 mx-4 font-bold">
                  <p className="text-sm mb-2 select-none">{product.name}</p>
                  <Link
                    to="/products"
                    className="text-blue-500 text-sm select-none"
                  >
                    View More
                  </Link>
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

export default Feature;
