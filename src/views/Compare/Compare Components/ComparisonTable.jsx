import React from "react";
import { FaPlus } from "react-icons/fa";

const ComparisonTable = ({ products, onRemoveProduct, onAddProduct }) => {
  // Detect category based on product data
  const getComponentType = (product) => {
    if (!product) return "unknown";
    
    // Use category from product if available
    if (product.category) {
      const category = product.category.toLowerCase();
      
      // Map category names to types
      if (category.includes("processor") || category.includes("cpu")) return "cpu";
      if (category.includes("graphics") || category.includes("gpu") || category.includes("video card")) return "gpu";
      if (category.includes("memory") || category.includes("ram")) return "ram";
      if (category.includes("motherboard")) return "motherboard";
      if (category.includes("storage") || category.includes("ssd") || category.includes("hdd")) return "storage";
      if (category.includes("power") || category.includes("psu")) return "psu";
      if (category.includes("case") || category.includes("chassis")) return "case";
      if (category.includes("cooling") || category.includes("cooler")) return "cooling";
    }
    
    // Fallback to name-based detection
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
    // Try direct property first
    if (product[spec.property] !== undefined && product[spec.property] !== null) {
      return spec.format ? spec.format(product[spec.property]) : product[spec.property];
    }
    
    // Try fallback property
    if (spec.fallback && product[spec.fallback] !== undefined && product[spec.fallback] !== null) {
      return spec.format ? spec.format(product[spec.fallback]) : product[spec.fallback];
    }
    
    // Try nested specifications object (for Supabase data)
    if (product.specifications && product.specifications[spec.property] !== undefined && product.specifications[spec.property] !== null) {
      const value = product.specifications[spec.property];
      
      // If it's an object, extract the actual values we want to display
      if (typeof value === 'object' && value !== null) {
        // Look for common specification fields
        const specFields = ['specifications', 'name', 'model', 'value'];
        for (const field of specFields) {
          if (value[field]) {
            return spec.format ? spec.format(value[field]) : value[field];
          }
        }
        // If no specific field found, try to format the object nicely
        return Object.entries(value)
          .filter(([key, val]) => val && val !== '')
          .map(([key, val]) => `${key}: ${val}`)
          .join(', ') || "N/A";
      }
      
      return spec.format ? spec.format(value) : value;
    }
    
    return "N/A";
  };

  // Helper function to extract and format specifications like in product details
  const extractSpecifications = (product) => {
    const specs = [];
    
    if (product.specifications && typeof product.specifications === 'object') {
      // Iterate through each component in specifications (matching product details logic)
      Object.entries(product.specifications).forEach(([componentId, specData]) => {
        if (typeof specData === 'object' && specData !== null) {
          // Extract each field from the specification object
          Object.entries(specData)
            .filter(([field, value]) => value && value !== '' && field.toLowerCase() !== 'brand') // Skip brand field
            .forEach(([field, value]) => {
              // Format field name (convert camelCase to readable format)
              const formattedField = field
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
              
              const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
              
              specs.push({
                label: formattedField,
                value: valueStr,
                isMultiLine: field === 'specifications' // Special handling for specifications field
              });
            });
        }
      });
    }
    
    return specs;
  };

  // Helper function to render a single specification value
  const renderSpecificationValue = (specItem) => {
    if (specItem.isMultiLine) {
      // Handle multi-line specifications (like in product details)
      const lines = specItem.value.split('\n');
      return (
        <span className="whitespace-pre-wrap inline">
          {lines.map((line, lineIndex) => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0 && colonIndex < line.length - 1) {
              const label = line.substring(0, colonIndex);
              const value = line.substring(colonIndex + 1);
              return (
                <span key={lineIndex}>
                  {lineIndex > 0 && <br />}
                  <span className="font-semibold">{label}:</span>
                  <span>{value}</span>
                </span>
              );
            }
            return line ? (
              <span key={lineIndex}>
                {lineIndex > 0 && <br />}
                {line}
              </span>
            ) : null;
          })}
        </span>
      );
    }
    
    // Regular single-line value
    return specItem.value;
  };
  
  const getStyleClass = (product, spec) => {
    if (spec.styleClass && product[spec.property] !== undefined) {
      return spec.styleClass(product[spec.property]);
    }
    return "";
  };

  // Generate dynamic specifications from all products' JSON specifications
  const getDynamicSpecifications = () => {
    // Collect all unique specification keys from all products
    const allSpecKeys = new Set();
    
    products.forEach(product => {
      if (product.specifications && typeof product.specifications === 'object') {
        Object.keys(product.specifications).forEach(key => allSpecKeys.add(key));
      }
      // Also check top-level properties that might be specifications
      Object.keys(product).forEach(key => {
        if (!['id', 'productName', 'name', 'imageUrl', 'image', 'images', 'category', 'categoryId', 'specifications'].includes(key)) {
          allSpecKeys.add(key);
        }
      });
    });

    // Create specification definitions
    const dynamicSpecs = [
      { label: "Brand", property: "brand" },
      { label: "Price", property: "price", format: (value) => `₱${Number(value).toLocaleString()}` },
    ];

    // Add all collected specifications
    allSpecKeys.forEach(key => {
      // Skip keys that are already added
      if (['brand', 'price', 'inStock'].includes(key)) return;
      
      // Format the label (convert camelCase to Title Case)
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, str => str.toUpperCase())
        .trim();
      
      dynamicSpecs.push({
        label,
        property: key,
        format: (value) => {
          if (typeof value === 'boolean') return value ? 'Yes' : 'No';
          if (typeof value === 'number') return value.toLocaleString();
          if (typeof value === 'object') return JSON.stringify(value);
          return value;
        }
      });
    });

    // Add availability at the end
    dynamicSpecs.push({
      label: "Availability",
      property: "inStock",
      format: (value) => value ? "In Stock" : "Out of Stock",
      styleClass: (value) => value ? "text-green-600" : "text-red-600"
    });

    return dynamicSpecs;
  };
  
  const componentType = getComponentType(products[0]);
  // Use dynamic specifications from JSON instead of hardcoded specs
  const specs = getDynamicSpecifications();
  
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
        <div className="flex justify-between gap-4">
          {products.map((product, productIndex) => (
            <div key={`specs-${product.id}`} className="flex-1">
              {/* Combined Specifications Box */}
              <div className={`rounded-xl shadow-md p-5 border-t-4 ${getProductColorClass(productIndex)}`}>
                {/* Brand & Price Section */}
                <div className="mb-5 pb-5 border-b-2 border-gray-300">
                  <div className="mb-4 bg-white/50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-medium">Brand</div>
                    <div className="text-lg font-semibold text-gray-800">{product.brand || "N/A"}</div>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-medium">Price</div>
                    <div className="text-2xl font-bold text-green-600">₱{Number(product.price).toLocaleString()}</div>
                  </div>
                </div>

                {/* Specifications Section */}
                <div className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center">
                  <span className="border-b-2 border-green-500 pb-1">Specifications</span>
                </div>
                <div className="space-y-3">
                  {extractSpecifications(product).map((specItem, specIndex) => (
                    <div 
                      key={`${product.id}-${specIndex}`} 
                      className="text-sm bg-white/30 p-3 rounded-lg hover:bg-white/50 transition-colors"
                    >
                      <div className="font-semibold text-gray-700 mb-1">{specItem.label}</div>
                      <div className="text-gray-600 pl-2 border-l-2 border-gray-300">{renderSpecificationValue(specItem)}</div>
                    </div>
                  ))}
                  {extractSpecifications(product).length === 0 && (
                    <div className="text-sm text-gray-400 italic text-center py-8 bg-white/30 rounded-lg">
                      No specifications available
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Product Placeholder */}
          {products.length < 3 && (
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-md p-5 mb-4 border-2 border-dashed border-gray-300 opacity-50 h-32 flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <FaPlus className="mx-auto mb-2 text-2xl" />
                  <div className="text-sm">Add Product</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-5 border-2 border-dashed border-gray-300 opacity-50 min-h-[200px]"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Specifications - Horizontal Scroll View */}
      <div className="md:hidden">
        <div className="overflow-x-auto -mx-4 px-4 pb-4">
          <div className="flex gap-4 min-w-max">
            {products.map((product, productIndex) => (
              <div 
                key={`mobile-product-${product.id}`}
                className="w-[85vw] flex-shrink-0"
              >
                {/* Product Title Bar */}
                <div className={`rounded-xl p-3 text-center font-semibold shadow-md border-t-4 mb-4 ${getProductColorClass(productIndex)}`}>
                  {product.productName || product.name}
                </div>

                {/* Combined Specifications Box */}
                <div className={`rounded-xl shadow-md p-5 border-t-4 ${getProductColorClass(productIndex)}`}>
                  {/* Brand & Price Section */}
                  <div className="mb-5 pb-5 border-b-2 border-gray-300">
                    <div className="mb-4 bg-white/50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-medium">Brand</div>
                      <div className="text-lg font-semibold text-gray-800">{product.brand || "N/A"}</div>
                    </div>
                    <div className="bg-white/50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-medium">Price</div>
                      <div className="text-2xl font-bold text-green-600">₱{Number(product.price).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Specifications Section */}
                  <div className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center">
                    <span className="border-b-2 border-green-500 pb-1">Specifications</span>
                  </div>
                  <div className="space-y-3">
                    {extractSpecifications(product).map((specItem, specIndex) => (
                      <div 
                        key={`mobile-spec-${product.id}-${specIndex}`} 
                        className="text-sm bg-white/30 p-3 rounded-lg hover:bg-white/50 transition-colors"
                      >
                        <div className="font-semibold text-gray-700 mb-1">{specItem.label}</div>
                        <div className="text-gray-600 pl-2 border-l-2 border-gray-300">{renderSpecificationValue(specItem)}</div>
                      </div>
                    ))}
                    {extractSpecifications(product).length === 0 && (
                      <div className="text-sm text-gray-400 italic text-center py-8 bg-white/30 rounded-lg">
                        No specifications available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll indicator hint */}
        {products.length > 1 && (
          <div className="text-center mt-4 text-xs text-gray-500 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            <span>Swipe left/right to view more</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        )}
        
        {/* Mobile Add Product Button */}
        {products.length < 3 && (
          <div className="text-center mt-6">
            <button
              onClick={onAddProduct}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-xl inline-flex items-center shadow-md transition-colors"
            >
              <FaPlus className="mr-2" />
              Add Product to Compare
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonTable;