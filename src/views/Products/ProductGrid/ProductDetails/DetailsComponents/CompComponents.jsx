import React, { useState } from "react";
import ProductModal from "../../ProductModal/ProductModal";

const componentsData = [
  {
    id: 1,
    name: "AMD Ryzen 7 5700X 8-Core",
    img: "https://images.unsplash.com/photo-1618498082410-b4b1b7c584b7",
    reviews: 5,
    price: 15699,
    oldPrice: 18000,
    description: "High-performance CPU for gaming and productivity.",
    stock: 10,
    stockStatus: "In Stock",
  },
  {
    id: 2,
    name: "A4Tech PK-635P - Webcam – color...",
    img: "https://images.unsplash.com/photo-1580894908360-967195033f26",
    reviews: 5,
    price: 15699,
    oldPrice: 1800,
    description: "Crystal clear webcam for video calls and streaming.",
    stock: 15,
    stockStatus: "In Stock",
  },
  {
    id: 3,
    name: "Ajazz AJ120 6 Buttons Programmable USB...",
    img: "https://images.unsplash.com/photo-1584270354949-1c1c6d3d88fc",
    reviews: 5,
    price: 15699,
    oldPrice: 1800,
    description: "Ergonomic gaming mouse with customizable buttons.",
    stock: 20,
    stockStatus: "In Stock",
  },
  // Repeat for demo pagination (6 items)
  {
    id: 4,
    name: "AMD Ryzen 7 5700X 8-Core",
    img: "https://www.amd.com/system/files/2022-04/253837-amd-ryzen-7-5700x-3d-1260x709.png",
    reviews: 5,
    price: 15699,
    oldPrice: 18000,
    description: "High-performance CPU for gaming and productivity.",
    stock: 10,
    stockStatus: "In Stock",
  },
  {
    id: 5,
    name: "A4Tech PK-635P - Webcam – color...",
    img: "https://www.a4tech.com/Upload/Product/PK-635P/PK-635P.png",
    reviews: 5,
    price: 15699,
    oldPrice: 1800,
    description: "Crystal clear webcam for video calls and streaming.",
    stock: 15,
    stockStatus: "In Stock",
  },
  {
    id: 6,
    name: "Ajazz AJ120 6 Buttons Programmable USB...",
    img: "https://cdn.shopify.com/s/files/1/0558/6414/1768/products/AJAZZ-AJ120-Gaming-Mouse-6-Buttons-Programmable-USB-Wired-Mouse-4000DPI-Optical-Mice-For-PC-Laptop-Computer_1024x1024.jpg",
    reviews: 5,
    price: 15699,
    oldPrice: 1800,
    description: "Ergonomic gaming mouse with customizable buttons.",
    stock: 20,
    stockStatus: "In Stock",
  },
];

const pageSize = 6;

const CompComponents = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const totalPages = Math.ceil(componentsData.length / pageSize);

  const handleOpenModal = (component) => {
    setSelectedComponent(component);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedComponent(null);
  };

  const paginatedData = componentsData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <h2 className="text-lg font-semibold mt-3 mb-4">Compatible Components</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {paginatedData.map((comp, idx) => (
          <div
            key={comp.id}
            className="bg-white border p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition"
            onClick={() => handleOpenModal(comp)}
          >
            <div className="h-24 w-full ">
              <img
                src={comp.img}
                alt={comp.name}
                className="w-full h-full object-cover mx-auto mb-3 bg-amber-300"
              />
            </div>

            <h3 className="font-semibold text-gray-800 mb-1 truncate">
              {comp.name}
            </h3>
            <p className="text-sm text-gray-500 mb-1">
              Reviews ({comp.reviews})
            </p>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-green-600 font-bold text-lg">
                ₱
                {comp.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span className="text-gray-400 line-through text-sm">
                ₱
                {comp.oldPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 gap-2">
        <button
          className="px-3 py-1 rounded border bg-gray-100 text-gray-700 hover:bg-gray-200"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded border ${
              currentPage === i + 1
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="px-3 py-1 rounded border bg-gray-100 text-gray-700 hover:bg-gray-200"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        >
          Next
        </button>
      </div>

      {/* Product Modal */}
      {modalOpen && selectedComponent && (
        <ProductModal product={selectedComponent} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default CompComponents;
