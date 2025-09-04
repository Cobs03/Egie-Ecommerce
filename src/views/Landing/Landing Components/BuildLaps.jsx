import React from "react";

import { useState } from "react";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const BuildLaps = ({ set }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  const productsSetOne = [
    {
      id: 1,
      title: 'MSI Pro 16 Flex-036AU 15.6" Touch All-In-One',
      price: "$499.00",
      oldPrice: "$599.00",
      reviews: 4,
      stock: 25,
      stockStatus: "In Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      title: 'HP ProOne 440 G6 23.8" Touch All-In-One',
      price: "$699.00",
      oldPrice: "$749.00",
      reviews: 5,
      stock: 8,
      stockStatus: "Low Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      title: 'Dell OptiPlex 3280 21.5" All-In-One',
      price: "$599.00",
      oldPrice: "$699.00",
      reviews: 3,
      stock: 0,
      stockStatus: "Out of Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop",
    },
    {
      id: 4,
      title: "Lenovo ThinkCentre M90a AIO Gen 3",
      price: "$899.00",
      oldPrice: "$999.00",
      reviews: 5,
      stock: 15,
      stockStatus: "In Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop",
    },
    {
      id: 5,
      title: 'Acer Aspire C24-1700 23.8" All-In-One',
      price: "$499.00",
      oldPrice: "$599.00",
      reviews: 4,
      stock: 3,
      stockStatus: "Low Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
    },
    {
      id: 6,
      title: 'Apple iMac 24" M1 Chip 2021',
      price: "$1,299.00",
      oldPrice: "$1,499.00",
      reviews: 5,
      stock: 12,
      stockStatus: "In Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=300&fit=crop",
    },
  ];

  const productsSetTwo = [
    {
      id: 7,
      title: 'Asus V222FAK-BA037T 22" All-In-One',
      price: "$549.00",
      oldPrice: "$649.00",
      reviews: 4,
      stock: 20,
      stockStatus: "In Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=400&h=300&fit=crop",
    },
    {
      id: 8,
      title: "Lenovo IdeaCentre AIO 3 24ADA6",
      price: "$649.00",
      oldPrice: "$749.00",
      reviews: 4,
      stock: 7,
      stockStatus: "Low Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=400&h=300&fit=crop",
    },
    {
      id: 9,
      title: "HP All-in-One 22-df0130z",
      price: "$499.00",
      oldPrice: "$599.00",
      reviews: 3,
      stock: 0,
      stockStatus: "Out of Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop",
    },
    {
      id: 10,
      title: "Dell Inspiron 24 5410 All-In-One",
      price: "$799.00",
      oldPrice: "$899.00",
      reviews: 5,
      stock: 18,
      stockStatus: "In Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop",
    },
    {
      id: 11,
      title: 'MSI Modern AM242TP 23.8" Touch',
      price: "$899.00",
      oldPrice: "$999.00",
      reviews: 4,
      stock: 2,
      stockStatus: "Low Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
    },
    {
      id: 12,
      title: 'Apple iMac 27" Retina 5K Display',
      price: "$1,799.00",
      oldPrice: "$1,999.00",
      reviews: 5,
      stock: 30,
      stockStatus: "In Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=300&fit=crop",
    },
  ];

  // Conditional loading of products
  const products = set === "two" ? productsSetTwo : productsSetOne;

  const title = set === "two" ? "Custom   Builds" : "Laptops";

  const background =
    set === "two"
      ? "https://i.ibb.co/WWcLwGxH/4257d09c69455402fc76c66a9313ee5f.jpg"
      : "https://i.ibb.co/R4YSKSL4/b310a539380948d9611d50da5dae969b.jpg";

  return (
    <div className="product-display flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8">
      {/* Custom Build Section */}
      <div
        className="mb-6 lg:mb-0 lg:mr-8 w-full lg:w-auto mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center bg-amber-800 rounded-lg p-4 sm:p-6 bg-cover bg-center"
        style={{ backgroundImage: `url(${background})` }}
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-100 mb-2 mt-4 lg:mt-30">
          {title}
        </h2>
        <Link
          to="/products"
          className="text-green-400 hover:underline text-base sm:text-lg transition-colors"
        >
          See All Products
        </Link>
      </div>

      <div className="flex-1">
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
                    src={product.imageUrl}
                    alt={product.title}
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
                      {product.title}
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
    </div>
  );
};

export default BuildLaps;
