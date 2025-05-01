import React from "react";

import { useState } from "react";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";
import {Link} from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const BuildLaps = ({set}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const productsSetOne = [
    {
      id: 1,
      title: "MSI Pro 16 Flex-036AU 15.6” Touch All-In-One",
      price: "$499.00",
      oldPrice: "$599.00",
      reviews: 4,
      inStock: true,
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: 2,
      title: "HP ProOne 440 G6 23.8” Touch All-In-One",
      price: "$699.00",
      oldPrice: "$749.00",
      reviews: 5,
      inStock: true,
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: 3,
      title: "Dell OptiPlex 3280 21.5” All-In-One",
      price: "$599.00",
      oldPrice: "$699.00",
      reviews: 3,
      inStock: false,
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: 4,
      title: "Lenovo ThinkCentre M90a AIO Gen 3",
      price: "$899.00",
      oldPrice: "$999.00",
      reviews: 5,
      inStock: true,
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: 5,
      title: "Acer Aspire C24-1700 23.8” All-In-One",
      price: "$499.00",
      oldPrice: "$599.00",
      reviews: 4,
      inStock: true,
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: 6,
      title: "Apple iMac 24” M1 Chip 2021",
      price: "$1,299.00",
      oldPrice: "$1,499.00",
      reviews: 5,
      inStock: true,
      imageUrl: "https://via.placeholder.com/150",
    },
  ];

  const productsSetTwo = [
    {
      id: 7,
      title: "Asus V222FAK-BA037T 22” All-In-One",
      price: "$549.00",
      oldPrice: "$649.00",
      reviews: 4,
      inStock: true,
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: 8,
      title: "Lenovo IdeaCentre AIO 3 24ADA6",
      price: "$649.00",
      oldPrice: "$749.00",
      reviews: 4,
      inStock: true,
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: 9,
      title: "HP All-in-One 22-df0130z",
      price: "$499.00",
      oldPrice: "$599.00",
      reviews: 3,
      inStock: true,
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: 10,
      title: "Dell Inspiron 24 5410 All-In-One",
      price: "$799.00",
      oldPrice: "$899.00",
      reviews: 5,
      inStock: false,
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: 11,
      title: "MSI Modern AM242TP 23.8” Touch",
      price: "$899.00",
      oldPrice: "$999.00",
      reviews: 4,
      inStock: true,
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: 12,
      title: "Apple iMac 27” Retina 5K Display",
      price: "$1,799.00",
      oldPrice: "$1,999.00",
      reviews: 5,
      inStock: true,
      imageUrl: "https://via.placeholder.com/150",
    },
  ];

  // Conditional loading of products
  const products = set === "two" ? productsSetTwo : productsSetOne;

  const title = set === "two" ? "Custom Builds" : "Laptops";

  return (
    <div className="product-display flex flex-row p-6">
      {/* Custom Build Section */}
      <div className=" mr-12 w-full mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center bg-amber-800">
        <h2 className="text-4xl font-bold text-gray-800 mb-2 mt-30">{title}</h2>
        <Link
          to="/products"
          className="text-indigo-600 hover:underline text-lg"
        >
          See All Products
        </Link>
      </div>

      <div>
        <Carousel>
          <CarouselContent>
            {products.map((product, index) => (
              <CarouselItem
                key={index}
                className="flex justify-center basis-1/4"
              >
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 cursor-pointer flex flex-col"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="rounded-md mb-4 object-cover h-40 w-full bg-green-700"
                  />
                  <div className="flex flex-col flex-grow justify-between">
                    {product.inStock && (
                      <span className="text-green-500 text-sm font-semibold mb-2 select-none">
                        In Stock
                      </span>
                    )}
                    <h4 className="select-none text-lg font-medium text-gray-800 mb-1 overflow-hidden text-ellipsis">
                      {product.title}
                    </h4>
                    <span className="text-gray-500 text-sm mb-2 select-none">
                      Reviews ({product.reviews})
                    </span>
                    <div className="mt-auto">
                      <div className="flex items-center space-x-2">
                        <span className="line-through text-gray-400 text-sm select-none">
                          {product.oldPrice}
                        </span>
                        <span className="text-indigo-600 font-bold text-lg select-none">
                          {product.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
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
}

export default BuildLaps;