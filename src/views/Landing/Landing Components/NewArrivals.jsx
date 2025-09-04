import React, { useState } from "react";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const NewArrivals = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  const products = [
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
    <div className="my-4 p-10 relative">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-2xl font-semibold">NEW ARRIVALS</h2>
        <a
          href="/products"
          className="text-green-600 hover:underline font-medium text-sm"
        >
          See all Products
        </a>
      </div>
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product, index) => (
            <CarouselItem
              key={index}
              className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/4 xl:basis-1/5"
            >
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-3 sm:p-4 cursor-pointer flex flex-col h-full"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="rounded-md mb-3 sm:mb-4 object-cover h-32 sm:h-36 md:h-40 w-full bg-green-700"
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
                    {product.name}
                  </h4>
                  <span className="text-gray-500 text-xs sm:text-sm mb-2 select-none">
                    Reviews ({product.reviews})
                  </span>
                  <div className="mt-auto">
                    <div className="flex items-center space-x-2">
                      <span className="line-through text-gray-400 text-xs sm:text-sm select-none">
                        {product.oldPrice}
                      </span>
                      <span className="text-indigo-600 font-bold text-sm sm:text-base lg:text-lg select-none">
                        {product.price}
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
