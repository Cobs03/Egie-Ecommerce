import React, { useState } from "react";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";

const OtherCart = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);
  const products = [
    {
      image: "https://via.placeholder.com/150",
      description: "Wireless Gaming Mouse",
      price: "₱1,299",
    },
    {
      image: "https://via.placeholder.com/150",
      description: "Mechanical Keyboard RGB",
      price: "₱2,599",
    },
    {
      image: "https://via.placeholder.com/150",
      description: "1080p HD Webcam",
      price: "₱999",
    },
    {
      image: "https://via.placeholder.com/150",
      description: "Laptop Cooling Pad",
      price: "₱749",
    },
    {
      image: "https://via.placeholder.com/150",
      description: "USB-C Hub Multiport",
      price: "₱1,199",
    },
    {
      image: "https://via.placeholder.com/150",
      description: "Bluetooth Headset",
      price: "₱1,499",
    },
    {
      image: "https://via.placeholder.com/150",
      description: "External SSD 500GB",
      price: "₱3,499",
    },
    {
      image: "https://via.placeholder.com/150",
      description: "Adjustable Laptop Stand",
      price: "₱899",
    },
  ];

  return (
    <div className="bg-gray-100 p-6">
      <h2 className="text-xl font-semibold text-center mb-6">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 justify-items-center">
        {products.map((product, index) => (
          <div
            key={index}
            onClick={() => setSelectedProduct(product)}
            className="bg-white rounded-lg shadow p-3 text-center w-full max-w-[160px] hover:shadow-md cursor-pointer"
          >
            <img
              src={product.image}
              alt="Product"
              className="w-full h-[100px] object-cover rounded"
            />
            <p className="text-sm text-gray-600 mt-2">{product.description}</p>
            <p className="font-bold text-gray-800">{product.price}</p>
          </div>
        ))}
      </div>
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default OtherCart;
