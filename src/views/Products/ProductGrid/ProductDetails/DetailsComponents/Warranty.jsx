import React from "react";
import { useScrollAnimation } from "../../../../../hooks/useScrollAnimation";

const Warranty = ({ product }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  // Get warranty info from product data
  const warrantyInfo = product?.warranty || "1 Year Warranty";
  
  // Parse warranty if it's a string with multiple warranties separated by comma or newline
  const warranties = typeof warrantyInfo === 'string' 
    ? warrantyInfo.split(/[,\n]/).map(w => w.trim()).filter(Boolean)
    : [warrantyInfo];

  return (
    <div ref={ref} className={`transition-all duration-1000 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      {/* Warranty Section */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Warranty</h2>
        <ul className="space-y-2">
          {warranties.map((warranty, index) => (
            <li key={index} className="flex items-center text-gray-700">
              <span className="mr-2 text-lg">🛡️</span> {warranty}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Warranty;
