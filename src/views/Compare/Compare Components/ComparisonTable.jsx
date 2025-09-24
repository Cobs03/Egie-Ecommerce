import React from "react";
import { FaPlus } from "react-icons/fa";

const ComparisonTable = ({ products, onRemoveProduct, onAddProduct }) => {
  // Keep all existing detection and spec mapping functions
  const getComponentType = (product) => {
    if (!product) return "unknown";
    
    const name = (product.productName || product.name || "").toLowerCase();
    
    if (name.includes("cpu") || name.includes("processor") || name.includes("ryzen") || name.includes("intel") || name.includes("core i")) {
      return "cpu";
    } else if (name.includes("gpu") || name.includes("graphics") || name.includes("rtx") || name.includes("radeon") || name.includes("geforce")) {
      return "gpu";
    } else if (name.includes("ram") || name.includes("memory") || name.includes("ddr")) {
      return "ram";
    } else if (name.includes("motherboard") || name.includes("mobo")) {
      return "motherboard";
    } else if (name.includes("ssd") || name.includes("hdd") || name.includes("storage") || name.includes("drive")) {
      return "storage";
    } else if (name.includes("psu") || name.includes("power supply")) {
      return "psu";
    } else if (name.includes("case") || name.includes("chassis")) {
      return "case";
    } else if (name.includes("cooler") || name.includes("cooling") || name.includes("fan")) {
      return "cooling";
    }
    
    return "unknown";
  };
  
  const getSpecifications = (type) => {
    switch (type) {
      case "cpu":
        return [
          { label: "Brand", property: "brand" },
          { label: "Model", property: "model", fallback: "subCategory" },
          { label: "Cores / Threads", property: "cores", format: (value) => `${value} / ${value * 2}` },
          { label: "Base Clock", property: "baseClock", format: (value) => `${value} GHz` },
          { label: "Boost Clock", property: "boostClock", format: (value) => `${value} GHz` },
          { label: "L2 Cache", property: "l2Cache", format: (value) => `${value} MB` },
          { label: "L3 Cache", property: "l3Cache", format: (value) => `${value} MB` },
          { label: "TDP", property: "tdp", format: (value) => `${value}W` },
          { label: "Socket", property: "socket" },
          { label: "Integrated Graphics", property: "integratedGraphics", format: (value) => value ? "Yes" : "No" },
          { label: "Overclocking Support", property: "overclockingSupport", format: (value) => value ? "Yes" : "No" },
          { label: "Price", property: "price", format: (value) => `$${value}` },
          { label: "Rating", property: "rating", format: (value) => `${value || "N/A"}/5` },
          { label: "Availability", property: "inStock", format: (value) => value ? "In Stock" : "Out of Stock", styleClass: (value) => value ? "text-green-600" : "text-red-600" }
        ];
      case "gpu":
        return [
          { label: "Brand", property: "brand" },
          { label: "Model", property: "model", fallback: "subCategory" },
          { label: "VRAM", property: "vram", format: (value) => `${value} GB` },
          { label: "Memory Type", property: "memoryType" },
          { label: "Core Clock", property: "coreClock", format: (value) => `${value} MHz` },
          { label: "Boost Clock", property: "boostClock", format: (value) => `${value} MHz` },
          { label: "CUDA/Stream Cores", property: "cores" },
          { label: "Ray Tracing", property: "rayTracing", format: (value) => value ? "Yes" : "No" },
          { label: "DLSS/FSR Support", property: "dlssFsr", format: (value) => value ? "Yes" : "No" },
          { label: "Power Draw", property: "powerDraw", format: (value) => `${value}W` },
          { label: "Length", property: "length", format: (value) => `${value} mm` },
          { label: "DisplayPort", property: "displayPort" },
          { label: "HDMI", property: "hdmi" },
          { label: "Price", property: "price", format: (value) => `$${value}` },
          { label: "Rating", property: "rating", format: (value) => `${value || "N/A"}/5` },
          { label: "Availability", property: "inStock", format: (value) => value ? "In Stock" : "Out of Stock", styleClass: (value) => value ? "text-green-600" : "text-red-600" }
        ];
      case "ram":
        return [
          { label: "Brand", property: "brand" },
          { label: "Model", property: "model", fallback: "subCategory" },
          { label: "Capacity", property: "capacity", format: (value) => `${value} GB` },
          { label: "Speed", property: "speed", format: (value) => `${value} MHz` },
          { label: "Type", property: "type" },
          { label: "CAS Latency", property: "casLatency", format: (value) => `CL${value}` },
          { label: "Timings", property: "timings" },
          { label: "Voltage", property: "voltage", format: (value) => `${value}V` },
          { label: "RGB Lighting", property: "rgb", format: (value) => value ? "Yes" : "No" },
          { label: "Heat Spreader", property: "heatSpreader", format: (value) => value ? "Yes" : "No" },
          { label: "Price", property: "price", format: (value) => `$${value}` },
          { label: "Rating", property: "rating", format: (value) => `${value || "N/A"}/5` },
          { label: "Availability", property: "inStock", format: (value) => value ? "In Stock" : "Out of Stock", styleClass: (value) => value ? "text-green-600" : "text-red-600" }
        ];
      case "motherboard":
        return [
          { label: "Brand", property: "brand" },
          { label: "Model", property: "model", fallback: "subCategory" },
          { label: "Socket", property: "socket" },
          { label: "Chipset", property: "chipset" },
          { label: "Form Factor", property: "formFactor" },
          { label: "RAM Slots", property: "ramSlots" },
          { label: "Max RAM Capacity", property: "maxRam", format: (value) => `${value} GB` },
          { label: "PCIe x16 Slots", property: "pciEx16" },
          { label: "PCIe Version", property: "pcieVersion" },
          { label: "M.2 Slots", property: "m2Slots" },
          { label: "SATA Ports", property: "sataPorts" },
          { label: "USB Ports", property: "usbPorts" },
          { label: "Wi-Fi", property: "wifi", format: (value) => value ? "Yes" : "No" },
          { label: "Bluetooth", property: "bluetooth", format: (value) => value ? "Yes" : "No" },
          { label: "Price", property: "price", format: (value) => `$${value}` },
          { label: "Rating", property: "rating", format: (value) => `${value || "N/A"}/5` },
          { label: "Availability", property: "inStock", format: (value) => value ? "In Stock" : "Out of Stock", styleClass: (value) => value ? "text-green-600" : "text-red-600" }
        ];
      case "storage":
        return [
          { label: "Brand", property: "brand" },
          { label: "Model", property: "model", fallback: "subCategory" },
          { label: "Capacity", property: "capacity", format: (value) => `${value} GB` },
          { label: "Type", property: "type" },
          { label: "Form Factor", property: "formFactor" },
          { label: "Interface", property: "interface" },
          { label: "Read Speed", property: "readSpeed", format: (value) => `${value} MB/s` },
          { label: "Write Speed", property: "writeSpeed", format: (value) => `${value} MB/s` },
          { label: "TBW", property: "tbw", format: (value) => `${value} TB` },
          { label: "Price", property: "price", format: (value) => `$${value}` },
          { label: "Rating", property: "rating", format: (value) => `${value || "N/A"}/5` },
          { label: "Availability", property: "inStock", format: (value) => value ? "In Stock" : "Out of Stock", styleClass: (value) => value ? "text-green-600" : "text-red-600" }
        ];
      case "psu":
        return [
          { label: "Brand", property: "brand" },
          { label: "Model", property: "model", fallback: "subCategory" },
          { label: "Wattage", property: "wattage", format: (value) => `${value}W` },
          { label: "Efficiency Rating", property: "efficiencyRating" },
          { label: "Modularity", property: "modularity" },
          { label: "Form Factor", property: "formFactor" },
          { label: "PCIe Connectors", property: "pcieConnectors" },
          { label: "Price", property: "price", format: (value) => `$${value}` },
          { label: "Rating", property: "rating", format: (value) => `${value || "N/A"}/5` },
          { label: "Availability", property: "inStock", format: (value) => value ? "In Stock" : "Out of Stock", styleClass: (value) => value ? "text-green-600" : "text-red-600" }
        ];
      case "case":
        return [
          { label: "Brand", property: "brand" },
          { label: "Model", property: "model", fallback: "subCategory" },
          { label: "Form Factor Support", property: "formFactorSupport" },
          { label: "GPU Clearance", property: "gpuClearance", format: (value) => `${value} mm` },
          { label: "CPU Cooler Clearance", property: "coolerClearance", format: (value) => `${value} mm` },
          { label: "2.5\" Bays", property: "bays25Inch" },
          { label: "3.5\" Bays", property: "bays35Inch" },
          { label: "Fan Support", property: "fanSupport" },
          { label: "Radiator Support", property: "radiatorSupport" },
          { label: "Front I/O", property: "frontIO" },
          { label: "Side Panel", property: "sidePanel" },
          { label: "RGB", property: "rgb", format: (value) => value ? "Yes" : "No" },
          { label: "Price", property: "price", format: (value) => `$${value}` },
          { label: "Rating", property: "rating", format: (value) => `${value || "N/A"}/5` },
          { label: "Availability", property: "inStock", format: (value) => value ? "In Stock" : "Out of Stock", styleClass: (value) => value ? "text-green-600" : "text-red-600" }
        ];
      case "cooling":
        return [
          { label: "Brand", property: "brand" },
          { label: "Model", property: "model", fallback: "subCategory" },
          { label: "Type", property: "type" },
          { label: "Radiator Size", property: "radiatorSize", format: (value) => value ? `${value} mm` : "N/A" },
          { label: "Fan RPM", property: "fanRPM", format: (value) => `${value} RPM` },
          { label: "Noise Level", property: "noiseLevel", format: (value) => `${value} dBA` },
          { label: "RGB", property: "rgb", format: (value) => value ? "Yes" : "No" },
          { label: "Socket Compatibility", property: "socketCompatibility" },
          { label: "Price", property: "price", format: (value) => `$${value}` },
          { label: "Rating", property: "rating", format: (value) => `${value || "N/A"}/5` },
          { label: "Availability", property: "inStock", format: (value) => value ? "In Stock" : "Out of Stock", styleClass: (value) => value ? "text-green-600" : "text-red-600" }
        ];
      default:
        // Basic specs for unknown component types
        return [
          { label: "Brand", property: "brand" },
          { label: "Model", property: "model", fallback: "subCategory" },
          { label: "Price", property: "price", format: (value) => `$${value}` },
          { label: "Rating", property: "rating", format: (value) => `${value || "N/A"}/5` },
          { label: "Availability", property: "inStock", format: (value) => value ? "In Stock" : "Out of Stock", styleClass: (value) => value ? "text-green-600" : "text-red-600" }
        ];
    }
  };
  
  const getPropertyValue = (product, spec) => {
    if (product[spec.property] !== undefined) {
      return spec.format ? spec.format(product[spec.property]) : product[spec.property];
    } else if (spec.fallback && product[spec.fallback] !== undefined) {
      return spec.format ? spec.format(product[spec.fallback]) : product[spec.fallback];
    }
    return "N/A";
  };
  
  const getStyleClass = (product, spec) => {
    if (spec.styleClass && product[spec.property] !== undefined) {
      return spec.styleClass(product[spec.property]);
    }
    return "";
  };
  
  const componentType = getComponentType(products[0]);
  const specs = getSpecifications(componentType);
  
  // Define product colors - 3 shades of green
  const productColors = [
    "bg-[#e6f7ea] border-[#c7ead2]", // Light green
    "bg-[#c7ead2] border-[#a6debb]", // Medium green
    "bg-[#a6debb] border-[#8ad1a5]"  // Dark green
  ];
  
  // Get color class for a product based on its index
  const getProductColorClass = (index) => {
    return productColors[index % productColors.length];
  };

  return (
    <div className="bg-gray-100 p-4 md:p-6">
      
      {/* Product Cards Row - Flex on desktop, Grid on mobile */}
      <div className="hidden md:flex justify-between items-center mb-8">
        {/* Desktop view - horizontal layout */}
        {products.map((product, index) => (
          <React.Fragment key={product.id}>
            {/* Product Card */}
            <div className={`rounded-lg shadow p-4 flex-1 flex flex-col items-center border-2 ${getProductColorClass(index)}`}>
              <h3 className="text-sm font-medium mb-3 text-center">
                {product.productName || product.name}
              </h3>
              <div className="w-24 h-24 mb-2 flex items-center justify-center">
                <img
                  src={product.imageUrl || product.image}
                  alt={product.productName || product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <button
                onClick={() => onRemoveProduct(product.id)}
                className="text-xs text-red-500 hover:text-red-700 mt-2"
              >
                Remove
              </button>
            </div>
            
            {/* Separator Circle - only between products */}
            {index < products.length - 1 && (
              <div className="flex-shrink-0 mx-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <span className="text-lg">+</span>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
        
        {/* Add Product Button - only show if fewer than 3 products */}
        {products.length < 3 && (
          <>
            {/* Separator Circle before add button */}
            <div className="flex-shrink-0 mx-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                <span className="text-lg">+</span>
              </div>
            </div>
            
            {/* Add Product Card */}
            <div className="bg-white rounded-lg shadow p-4 flex-1 flex flex-col items-center justify-center min-h-[180px]">
              <button
                onClick={onAddProduct}
                className="flex flex-col items-center text-gray-500 hover:text-green-600 transition-colors"
              >
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
                  <FaPlus className="text-2xl" />
                </div>
                <span className="text-sm font-medium">Add Product</span>
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Mobile view - Products in grid */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:hidden">
        {products.map((product, index) => (
          <div 
            key={product.id}
            className={`rounded-lg shadow p-4 flex items-center border-2 ${getProductColorClass(index)}`}
          >
            <div className="w-16 h-16 mr-4 flex-shrink-0 flex items-center justify-center">
              <img
                src={product.imageUrl || product.image}
                alt={product.productName || product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">
                {product.productName || product.name}
              </h3>
              <button
                onClick={() => onRemoveProduct(product.id)}
                className="text-xs text-red-500 hover:text-red-700 mt-1"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        
        {/* Add Product Button for mobile */}
        {products.length < 3 && (
          <button
            onClick={onAddProduct}
            className="bg-white rounded-lg shadow p-4 flex items-center border border-dashed border-gray-300 hover:border-green-500 transition-colors"
          >
            <div className="w-12 h-12 mr-4 flex-shrink-0 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
              <FaPlus className="text-xl text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-500">Add another product</span>
          </button>
        )}
      </div>

      {/* Specifications - Desktop View */}
      <div className="hidden md:block">
        {specs.map((spec, index) => (
          <div key={index} className="mb-4">
            <div className="text-left mb-2 text-gray-700">
              {spec.label}
            </div>
            <div className="flex justify-between">
              {products.map((product, productIndex) => (
                <React.Fragment key={`${product.id}-${spec.property}`}>
                  {/* Spec Value Card */}
                  <div className={`rounded-lg shadow p-4 flex-1 text-center border-t-2 ${getProductColorClass(productIndex)}`}>
                    <div className={getStyleClass(product, spec)}>
                      {getPropertyValue(product, spec)}
                    </div>
                  </div>
                  
                  {/* Spacing between cards */}
                  {productIndex < products.length - 1 && <div className="w-4"></div>}
                </React.Fragment>
              ))}
              
              {/* Add empty spec slots for the "Add Product" position */}
              {products.length < 3 && (
                <>
                  <div className="w-4"></div>
                  <div className="bg-white rounded-lg shadow p-4 flex-1 text-center opacity-50">
                    <div className="text-gray-400">—</div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Mobile Specifications - Stacked View */}
      <div className="md:hidden">
        {products.map((product, productIndex) => (
          <div 
            key={`mobile-product-${product.id}`}
            className={`mb-6 rounded-lg overflow-hidden border-2 ${getProductColorClass(productIndex)}`}
          >
            {/* Product title bar */}
            <div className={`${getProductColorClass(productIndex)} p-2 font-medium text-center text-sm border-b`}>
              {product.productName || product.name}
            </div>
            
            {/* Product specs */}
            <div className="bg-white">
              {specs.map((spec, specIndex) => (
                <div 
                  key={`mobile-spec-${product.id}-${spec.property}`}
                  className="p-3 flex justify-between border-b last:border-b-0"
                >
                  <div className="text-xs text-gray-600">{spec.label}</div>
                  <div className={`text-sm font-medium ${getStyleClass(product, spec)}`}>
                    {getPropertyValue(product, spec)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Mobile Add Product Button */}
        {products.length < 3 && (
          <div className="text-center mt-6">
            <button
              onClick={onAddProduct}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md inline-flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonTable;