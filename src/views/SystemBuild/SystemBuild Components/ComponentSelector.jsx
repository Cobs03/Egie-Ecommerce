import React from "react";
import { components } from "../../Data/components";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

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
        {components.map((component) => (
          <button
            key={component.type}
            onClick={() => setSelectedType(component.type)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 border-2 border-dashed relative active:scale-95 hover:scale-105 ${
              selectedType === component.type
                ? 'bg-lime-500 text-white font-semibold border-lime-500'
                : selectedProducts[component.type]
                ? 'bg-white text-gray-800 border-lime-500'
                : 'bg-white text-gray-800 border-gray-300 hover:border-lime-400'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {selectedProducts[component.type] ? '✓' : '+'} {component.type}
              </span>
              
              {selectedProducts[component.type] && (
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