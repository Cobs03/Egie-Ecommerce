import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const TopSeller = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = [
    {
      id: 1,
      price: "P 5,999",
      description:
        "Razer DeathAdder V2 Wired Gaming Mouse - Ergonomic design, 20,000 DPI sensor",
      rating: "⭐ 4.8 Star",
    },
    {
      id: 2,
      price: "P 15,499",
      description:
        "MSI GeForce RTX 3060 GAMING X 12GB Graphics Card - High-performance GPU for gaming",
      rating: "⭐ 5 Star",
    },
    {
      id: 3,
      price: "P 8,999",
      description:
        "Corsair Vengeance LPX 16GB (2 x 8GB) DDR4 3200MHz RAM - Speed and reliability for multitasking",
      rating: "⭐ 4.7 Star",
    },
    {
      id: 4,
      price: "P 12,499",
      description:
        "Samsung 970 EVO Plus 1TB M.2 NVMe SSD - Fast read/write speeds for your system",
      rating: "⭐ 4.9 Star",
    },
    {
      id: 5,
      price: "P 5,799",
      description:
        "Cooler Master Hyper 212 RGB CPU Cooler - Efficient cooling for high-performance CPUs",
      rating: "⭐ 4.6 Star",
    },
    {
      id: 6,
      price: "P 25,999",
      description:
        "Asus ROG Strix Z590-E Gaming Motherboard - Robust performance and connectivity options",
      rating: "⭐ 5 Star",
    },
    {
      id: 7,
      price: "P 18,499",
      description:
        "Corsair RM750x 750W Fully Modular Power Supply - High efficiency and silent operation",
      rating: "⭐ 4.8 Star",
    },
    {
      id: 8,
      price: "P 3,499",
      description:
        "Logitech G Pro X Wireless Gaming Headset - Crystal clear audio and comfort for long gaming sessions",
      rating: "⭐ 4.9 Star",
    },
  ];

  return (
    <div className="top-sellers bg-gray-100 py-6 px-4 flex flex-col">
      <h2 className="text-2xl text-center mb-6">TOP SELLERS</h2>
      <Carousel>
        <CarouselContent>
          {products.map((product, index) => (
            <CarouselItem key={index} className="flex justify-center basis-1/6">
              <div
                className="bg-white rounded-lg shadow-lg p-4 m-2 flex flex-col items-center w-48 h-80 cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="w-full h-27 bg-gray-200 mb-4"></div>{" "}
                {/* Image placeholder */}
                <p className="text-sm text-gray-700">
                  {product.description.length > 30
                    ? `${product.description.slice(0, 30)}...`
                    : product.description}
                </p>
                <p className="text-yellow-500 mt-2">{product.rating}</p>
                <h3 className="text-lg font-bold mt-2">{product.price}</h3>
                <div className="mt-auto flex justify-between w-full">
                  <button className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600">
                    Buy Now
                  </button>
                  <button className="bg-gray-300 text-gray-700 rounded-full p-2 hover:bg-gray-400">
                    🛒
                  </button>
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

      <Link
        to="/products"
        className="bg-black text-white rounded px-6 py-2 text-center mt-6 block w-full hover:bg-gray-900"
      >
        SEE ALL
      </Link>
    </div>
  );
};

export default TopSeller;
