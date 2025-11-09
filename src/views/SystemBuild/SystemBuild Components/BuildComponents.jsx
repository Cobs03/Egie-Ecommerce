import React, { useState } from "react";
import { components } from "../../Data/components";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const BuildComponents = ({
  selectedType,
  setSelectedType,
  selectedProducts,
  setSelectedProducts,
}) => {
  const [quantities, setQuantities] = useState(
    components.reduce((acc, comp) => ({ ...acc, [comp.type]: 0 }), {})
  );

  const handleDecrease = (compType) => {
    if (!selectedProducts[compType]) return;
    setQuantities((prev) => ({
      ...prev,
      [compType]: Math.max(0, prev[compType] - 1),
    }));
  };

  const handleIncrease = (compType) => {
    if (!selectedProducts[compType]) return;
    setQuantities((prev) => ({
      ...prev,
      [compType]: prev[compType] + 1,
    }));
  };

  const handleDelete = (compType) => {
    setSelectedProducts((prev) => {
      const updated = { ...prev };
      delete updated[compType];
      return updated;
    });

    setQuantities((prev) => ({
      ...prev,
      [compType]: 0,
    }));
  };

  const subtotal = components.reduce((acc, comp) => {
    const selectedProduct = selectedProducts[comp.type];
    const price = selectedProduct?.price || 0;
    const total = price * (quantities[comp.type] || 0);
    return acc + total;
  }, 0);

  return (
    <div className="w-full mb-4">
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
              {components.map((comp) => {
                const selectedProduct = selectedProducts[comp.type];
                const price = selectedProduct?.price || 0;
                const quantity = quantities[comp.type] || 0;
                const total = price * quantity;

                if (!selectedProduct) {
                  return (
                    <tr key={comp.type} className="bg-white hover:bg-gray-100">
                      <td className="p-2 border font-medium text-gray-700">
                        {comp.type}
                      </td>
                      <td colSpan="5" className="p-4 border text-center">
                        <button
                          onClick={() => setSelectedType(comp.type)}
                          className="bg-transparent border-2 border-dashed border-green-500 text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 font-semibold transition-colors w-full max-w-md"
                        >
                          + Add a {comp.type} Component
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={comp.type} className="bg-white hover:bg-gray-100">
                    <td className="p-2 border font-medium text-gray-700">
                      {comp.type}
                    </td>
                    <td className="p-2 border w-68">
                      <span className="text-sm font-medium text-gray-800">
                        {selectedProduct.productName}
                      </span>
                    </td>
                    <td className="p-2 border text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <button
                          onClick={() => handleDecrease(comp.type)}
                          className="cursor-pointer bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleIncrease(comp.type)}
                          className="cursor-pointer bg-green-500 text-white p-1 rounded-full hover:bg-green-600"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="p-2 border">₱{price.toFixed(2)}</td>
                    <td className="p-2 border font-semibold">₱{total.toFixed(2)}</td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => handleDelete(comp.type)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 cursor-pointer transition-colors"
                        title="Remove component"
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
            <span className="text-lg font-semibold">
              Subtotal: ₱{subtotal.toFixed(2)}
            </span>
            <Link
              to="/cart"
              onClick={(e) => {
                const hasSelection = Object.keys(selectedProducts).length > 0;

                if (!hasSelection) {
                  e.preventDefault();
                  toast.error("No components selected", {
                    description:
                      "Please add at least one component before buying.",
                  });
                  return;
                }

                toast.success("Added to cart!", {
                  description: "Your products have been successfully added.",
                });
              }}
              className="bg-lime-400 text-black px-6 py-2 rounded hover:bg-lime-500 font-semibold transition-colors"
            >
              Buy Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildComponents;
