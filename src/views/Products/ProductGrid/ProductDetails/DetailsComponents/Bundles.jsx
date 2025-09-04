import React, { useState } from "react";
import BundleModal from "../../ProductModal/BundleModal";

const bundles = [
  {
    title: "ASROCK BUILD AMD RYZEN 5 5600G / ASROCK B450 STEEL...",
    price: 11795.0,
    reviews: "No reviews",
    rating: 5,
  },
  {
    title: "Onikuma TZ5006 5 in 1 Combo Gaming Set --",
    price: 1050.0,
    reviews: "No reviews",
    rating: 0,
  },
  {
    title: "ASROCK BUILD AMD RYZEN 5 4600G / ASROCK B450 STEEL...",
    price: 11380.0,
    reviews: "No reviews",
    rating: 0,
  },
  {
    title: "GIGABYTE BUILD Intel Core I3-10100 / GIGABYTE H510M-K...",
    price: 9750.0,
    reviews: "No reviews",
    rating: 0,
  },
];

const Bundles = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleBundleClick = (bundle) => {
    setSelectedProduct({
      ...bundle,
      id: `bundle-${bundle.title}`,
      images: ["/images/bundle.png"],
      stock: 100, // You can set default stock or add it to bundle data
      stockStatus: "In Stock",
    });
  };

  return (
    <>
      {/* Best Bundles Section */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Best Bundles</h2>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-6">
          {bundles.map((bundle, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => handleBundleClick(bundle)}
            >
              <img
                src="/images/bundle.png"
                alt={bundle.title}
                className="w-full h-40 object-contain mb-3"
              />
              <h3 className="text-lg font-semibold mb-1 text-gray-800">
                {bundle.title}
              </h3>
              <p className="text-green-600 font-bold mb-1">
                ₱{bundle.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mb-2">{bundle.reviews}</p>
              <div className="text-yellow-400 text-lg">
                {"⭐".repeat(bundle.rating)}
                {Array.from({ length: 5 - bundle.rating }).map((_, i) => (
                  <span key={i} className="text-gray-300">
                    ☆
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bundle  Modal */}
      {selectedProduct && (
        <BundleModal
          bundle={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
};

export default Bundles;
