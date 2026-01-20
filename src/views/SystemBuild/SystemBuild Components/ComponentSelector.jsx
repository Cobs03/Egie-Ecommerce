import React from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

// Define component types matching database categories
// ⚠️ ORDER MATTERS: Motherboard first as it determines compatibility for CPU, RAM, etc.
const COMPONENT_TYPES = [
  "Motherboard", // START HERE - Foundation for CPU socket, RAM type, form factor
  "Processor",   // Must match motherboard socket
  "RAM",         // Must match motherboard DDR type
  "Case",        // Must fit motherboard form factor
  "GPU",
  "PSU",
  "SSD",
  "HDD",
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
  
  // Show helper for first-time users
  const hasNoComponents = Object.keys(selectedProducts).length === 0;
  const hasMotherboard = selectedProducts['Motherboard'];

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
      
      {/* Helpful tip for beginners */}
      {hasNoComponents && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
          <p className="font-semibold text-blue-800 mb-1">💡 Start with Motherboard</p>
          <p className="text-blue-700">
            The motherboard determines CPU socket, RAM type, and case size compatibility. Select it first!
          </p>
        </div>
      )}
      
      {hasMotherboard && !selectedProducts['Processor'] && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-xs">
          <p className="font-semibold text-green-800 mb-1">✓ Great! Now select CPU</p>
          <p className="text-green-700">
            Processor must match motherboard socket. Compatible CPUs will be highlighted.
          </p>
        </div>
      )}
      
      <div 
        ref={listAnim.ref}
        className={`space-y-2 transition-all duration-700 delay-200 ${
          listAnim.isVisible 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 -translate-x-4'
        }`}
      >
        {COMPONENT_TYPES.map((type, index) => {
          const isFirstComponent = index === 0; // Motherboard
          
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 border-2 border-dashed relative active:scale-95 hover:scale-105 ${
                selectedType === type
                  ? 'bg-lime-500 text-white font-semibold border-lime-500'
                  : selectedProducts[type]
                  ? 'bg-white text-gray-800 border-lime-500'
                  : isFirstComponent && hasNoComponents
                  ? 'bg-blue-50 text-gray-800 border-blue-400 animate-pulse'
                  : 'bg-white text-gray-800 border-gray-300 hover:border-lime-400'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {selectedProducts[type] ? '✓' : '+'} {type}
                  {isFirstComponent && hasNoComponents && (
                    <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">START HERE</span>
                  )}
                </span>
                
                {selectedProducts[type] && (
                  <span className="text-xs text-lime-600 font-semibold">Selected</span>
                )}
              </div>
            </button>
          );
        })} 
      </div>

    </div>
  );
};

export default ComponentSelector;