import React from "react";
import { components } from "../../Data/components";

const ComponentSelector = ({ selectedType, setSelectedType, selectedProducts }) => {
  return (
    <div className="h-full bg-white p-4">
      <h3 className="text-gray-800 text-lg font-bold mb-4 border-b border-gray-300 pb-2">
        Components
      </h3>
      
      <div className="space-y-2">
        {components.map((component) => (
          <button
            key={component.type}
            onClick={() => setSelectedType(component.type)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all border-2 border-dashed relative ${
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