import React, { useState } from "react";
import ProductModal from "../../Products/ProductGrid/ProductModal/ProductModal";

const NewArrivals = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = [
    { id: 1, name: "Neon Light Wired Mouse", price: 60 },
    {
      id: 2,
      name: "Strix GL720 Compact Gaming Laptop With Latest Processor",
      price: 700,
    },
    { id: 3, name: "MSI Powerful Graphics Card", price: 120 },
    { id: 4, name: "Gaming Light Wired Keyboard", price: 100 },
    { id: 5, name: "Fury HyperX 8 GB RAM", price: 120 },
  ];

  return (
    <div className="text-center my-8">
      <h2 className="text-2xl font-semibold mb-6">New Arrivals</h2>
      <div
        className="
          grid 
          grid-cols-3 
          grid-rows-2 
          gap-5 
          w-4/5 
          mx-auto 
          relative 
          -translate-x-[3%]
        "
      >
        {products.map((product, index) => {
          const gridPosition = [
            "col-start-1 row-start-1 flex-row",
            "col-start-1 row-start-2 flex-row",
            "col-start-2 row-start-1 row-span-2 flex-col items-center justify-center",
            "col-start-3 row-start-1 flex-row",
            "col-start-3 row-start-2 flex-row",
          ];

          return (
            <div
              key={index}
              onClick={() => setSelectedProduct(product)}
              className={`
                border border-gray-300 rounded-lg p-4 shadow-md cursor-pointer
                flex ${gridPosition[index]}
              `}
            >
              <div className="bg-red-500 p-2 rounded">
                <img
                  src={`https://via.placeholder.com/150?text=${product.name}`}
                  alt={product.name}
                  className="w-full h-auto object-contain"
                />
              </div>

              <div className="ml-4 text-left">
                <h3 className="text-lg font-medium">{product.name}</h3>
                <p className="text-base my-2">${product.price}</p>
                <button className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600">
                  Shop Now
                </button>
              </div>
            </div>
          );
        })}
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

export default NewArrivals;
