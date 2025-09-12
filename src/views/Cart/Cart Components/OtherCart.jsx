import React, { useState } from "react";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";

const OtherCart = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Updated product data to include ratings and original prices
  const products = [
    {
      image: "/images/products/keyboard1.png",
      name: "ASUS ROG Strix Gaming Keyboard",
      description: "RGB Mechanical Gaming Keyboard",
      price: 5699,
      originalPrice: 6800,
      reviews: 5,
    },
    {
      image: "/images/products/mouse1.png",
      name: "Logitech G502 Wireless",
      description: "Wireless Gaming Mouse",
      price: 1299,
      originalPrice: 1799,
      reviews: 4,
    },
    {
      image: "/images/products/laptop1.png",
      name: "Legion Pro 5 Gaming Laptop",
      description: "16\" WQXGA 240Hz, RTX 4070",
      price: 89995,
      originalPrice: 98999,
      reviews: 12,
    },
    {
      image: "/images/products/cpu1.png",
      name: "AMD Ryzen 7 7800X3D",
      description: "8-core Desktop Processor",
      price: 24990,
      originalPrice: 27990,
      reviews: 8,
    },
    {
      image: "/images/products/keyboard2.png",
      name: "Keychron Q1 Pro",
      description: "Wireless Mechanical Keyboard",
      price: 9499,
      originalPrice: 9999,
      reviews: 3,
    },
    {
      image: "/images/products/mouse2.png",
      name: "Razer DeathAdder V3 Pro",
      description: "Wireless Gaming Mouse",
      price: 7999,
      originalPrice: 8500,
      reviews: 6,
    },
    {
      image: "/images/products/laptop2.png",
      name: "ASUS ROG Zephyrus G14",
      description: "14\" QHD 165Hz, RTX 4060",
      price: 79999,
      originalPrice: 84999,
      reviews: 9,
    },
    {
      image: "/images/bundle.png",
      name: "CHRISTMAS BUNDLE",
      description: "Complete Gaming PC Setup",
      price: 29495,
      originalPrice: 39920,
      reviews: 0,
    },
  ];

  return (
    <div className="">
      <h2 className="text-xl font-semibold text-center mb-6">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-7 gap-4 justify-items-center">
        {products.map((product, index) => (
          <div
            key={index}
            onClick={() => setSelectedProduct(product)}
            className="bg-white rounded-lg border border-gray-200 p-3 text-center w-full max-w-[180px] hover:shadow-lg transition-shadow duration-200 cursor-pointer flex flex-col"
          >
            {/* Product Image */}
            <div className="mb-2 h-28 flex items-center justify-center bg-amber-200">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            
            {/* Product Name */}
            <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-1">
              {product.name}
            </h3>
            
            {/* Reviews */}
            <div className="text-xs text-gray-600 mb-1">
              Reviews ({product.reviews})
            </div>
            
            {/* Pricing */}
            <div className="mt-auto flex flex-row justify-between items-center">
              <div className="text-green-600 font-bold text-base">
                ₱{product.price.toLocaleString()}
              </div>
              {product.originalPrice > product.price && (
                <div className="text-gray-500 line-through text-xs">
                  ₱{product.originalPrice.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {selectedProduct && (
        <ProductModal
          product={{
            ...selectedProduct,
            id: `product-${selectedProduct.name}`,
            rating: selectedProduct.reviews > 0 ? 5 : 0,
            reviewCount: selectedProduct.reviews,
            stock: 10,
            stockStatus: "In Stock",
            images: [selectedProduct.image],
          }}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default OtherCart;
