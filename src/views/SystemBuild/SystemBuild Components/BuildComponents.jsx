import React, { useState } from "react";
import { components } from "../../Data/components";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";

import { Link } from "react-router-dom";
import { toast } from "sonner";

const BuildComponents = ({
  selectedType,
  setSelectedType,
  selectedProducts,
  setSelectedProducts, // <-- Add this prop to allow modification
}) => {
  const [quantities, setQuantities] = useState(components.map(() => 0));

  const handleDecrease = (index, compType) => {
    if (!selectedProducts[compType]) return;
    setQuantities((prev) =>
      prev.map((qty, i) => (i === index && qty > 0 ? qty - 1 : qty))
    );
  };

  const handleIncrease = (index, compType) => {
    if (!selectedProducts[compType]) return;
    setQuantities((prev) =>
      prev.map((qty, i) => (i === index ? qty + 1 : qty))
    );
  };

  const handleDelete = (index, compType) => {
    // Remove product
    setSelectedProducts((prev) => {
      const updated = { ...prev };
      delete updated[compType];
      return updated;
    });

    // Reset quantity
    setQuantities((prev) => prev.map((qty, i) => (i === index ? 0 : qty)));
  };

  const subtotal = components.reduce((acc, comp, index) => {
    const selectedProduct = selectedProducts[comp.type];
    const price = selectedProduct?.price || 0;
    const total = price * quantities[index];
    return acc + total;
  }, 0);

  return (
    <div className="w-[800px] mb-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 border rounded shadow-sm bg-gray-50 p-4">
          <table className="min-w-full text-sm border border-gray-300 mb-4">
            <thead className="bg-blue-100 text-gray-700 text-left">
              <tr>
                <th className="p-2 border">Components</th>
                <th className="p-2 border">Product</th>
                <th className="p-2 border text-center">Quantity</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {components.map((comp, index) => {
                const selectedProduct = selectedProducts[comp.type];
                const price = selectedProduct?.price || 0;
                const total = price * quantities[index];

                return (
                  <tr key={index} className="bg-white hover:bg-gray-100">
                    <td className="p-2 border">{comp.type}</td>
                    <td className="p-2 border w68">
                      {selectedProduct ? (
                        <span className="text-sm font-medium text-gray-800">
                          {selectedProduct.productName}
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedType(comp.type)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 cursor-pointer"
                        >
                          Add a component
                        </button>
                      )}
                    </td>
                    <td className="p-2 border text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <button
                          onClick={() => handleDecrease(index, comp.type)}
                          className={`cursor-pointer bg-red-500 text-white p-1 rounded-full hover:bg-red-600 ${
                            !selectedProduct
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={!selectedProduct}
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="w-5 text-center">
                          {quantities[index]}
                        </span>
                        <button
                          onClick={() => handleIncrease(index, comp.type)}
                          className={`cursor-pointer bg-green-500 text-white p-1 rounded-full hover:bg-green-600 ${
                            !selectedProduct
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={!selectedProduct}
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="p-2 border">₱{price.toFixed(2)}</td>
                    <td className="p-2 border">₱{total.toFixed(2)}</td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => handleDelete(index, comp.type)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 cursor-pointer"
                      >
                        <FaTrash size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="bg-gray-700 text-white flex justify-between items-center p-4 rounded-md">
            <span className="text-sm font-medium">
              Subtotal: ₱{subtotal.toFixed(2)}
            </span>
            <Link
              to="/cart"
              onClick={(e) => {
                const hasSelection = Object.keys(selectedProducts).length > 0;

                if (!hasSelection) {
                  e.preventDefault(); // ✅ Prevent navigation only when there's an error
                  toast.error("No components selected", {
                    description:
                      "Please add at least one component before buying.",
                  });
                  return;
                }

                toast.success("Added to cart!", {
                  description: "Your products have been successfully added.",
                });
                // ✅ Do not prevent default if everything is okay — allow navigation
              }}
              className="bg-lime-400 text-black px-6 py-2 rounded hover:bg-lime-500 font-semibold"
            >
              Add to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildComponents;
