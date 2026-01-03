import React from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

// Define component types matching database categories
const COMPONENT_TYPES = [
  "Case",
  "Motherboard",
  "Processor",
  "GPU",
  "RAM",
  "SSD",
  "HDD",
  "PSU",
  "Cooling",
  "Monitor",
  "Keyboard",
  "Mouse",
  "Headset",
  "Speaker",
  "Webcam"
];

const ComponentSelector = ({ selectedType, setSelectedType, selectedProducts }) => {
  const headerAnim = useScrollAnimation({ threshold: 0.1 });
  const listAnim = useScrollAnimation({ threshold: 0.1 });

  return (
    <div className="h-full bg-white p-4">
      <h3 
        ref={headerAnim.ref}
        className={`text-gray-800 text-lg font-bold mb-4 border-b border-gray-300 pb-2 transition-all duration-700 ${
          headerAnim.isVisible 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 -translate-x-4'
        }`}
      >
        Components
      </h3>
      
      <div 
        ref={listAnim.ref}
        className={`space-y-2 transition-all duration-700 delay-200 ${
          listAnim.isVisible 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 -translate-x-4'
        }`}
      >
        {COMPONENT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 border-2 border-dashed relative active:scale-95 hover:scale-105 ${
              selectedType === type
                ? 'bg-lime-500 text-white font-semibold border-lime-500'
                : selectedProducts[type]
                ? 'bg-white text-gray-800 border-lime-500'
                : 'bg-white text-gray-800 border-gray-300 hover:border-lime-400'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {selectedProducts[type] ? '✓' : '+'} {type}
              </span>
              
              {selectedProducts[type] && (
                <span className="text-xs text-lime-600 font-semibold">Selected</span>
              )}
            </div>
          </button>
        ))} 
      </div>

    </div>
  );
};

export default ComponentSelector;