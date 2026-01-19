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
              
              // Handle different value types
              if (typeof value === 'object' && value !== null) {
                // If it's an object, extract each property as a separate specification row
                Object.entries(value)
                  .filter(([k, v]) => v && v !== '')
                  .forEach(([key, val]) => {
                    const subLabel = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase())
                      .trim();
                    
                    specs.push({
                      label: subLabel,
                      value: String(val),
                      originalField: field,
                      isMultiLine: false
                    });
                  });
              } else if (typeof value === 'string' && field === 'specifications') {
                // Parse "Label: Value" format from specifications text
                const lines = value.split('\n').filter(line => line.trim());
                lines.forEach(line => {
                  const colonIndex = line.indexOf(':');
                  if (colonIndex > 0 && colonIndex < line.length - 1) {
                    const label = line.substring(0, colonIndex).trim();
                    const val = line.substring(colonIndex + 1).trim();
                    if (label && val) {
                      specs.push({
                        label: label,
                        value: val,
                        originalField: field,
                        isMultiLine: false
                      });
                    }
                  }
                });
              } else {
                // Regular string or other value
                specs.push({
                  label: formattedField,
                  value: String(value),
                  originalField: field,
                  isMultiLine: false
                });
              }
            });
        }
      });
    }
    
    return specs;
  };

  // Get all unique specification labels from all products
  const getAllUniqueSpecLabels = () => {
    const labelSet = new Set();
    products.forEach(product => {
      const specs = extractSpecifications(product);
      specs.forEach(spec => labelSet.add(spec.label));
    });
    return Array.from(labelSet);
  };

  // Helper function to render a single specification value
  const renderSpecificationValue = (specItem) => {
    // All values are now simple strings, no multi-line handling needed
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
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 rounded-2xl shadow-2xl mb-8">
      
      {/* Product Headers - Desktop Only */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-full">
          {/* Product Images and Names Row */}
          <div className="flex mb-6 gap-4">
            {/* Empty cell for spec labels */}
            <div className="w-48 flex-shrink-0"></div>
            
            {/* Product columns */}
            {products.map((product, index) => (
              <div 
                key={product.id}
                className={`flex-1 min-w-[200px] max-w-[300px] rounded-xl shadow-lg p-4 border-t-4 relative ${getProductColorClass(index)}`}
              >
                {/* Remove button */}
                <button
                  onClick={() => onRemoveProduct(product.id)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-all hover:scale-110 z-10"
                  title="Remove product"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {/* Product Image */}
                <div className="w-32 h-32 mx-auto mb-3 flex items-center justify-center bg-white rounded-lg p-2">
                  <img
                    src={product.imageUrl || product.image}
                    alt={product.productName || product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                
                {/* Product Name */}
                <h3 className="text-sm font-bold text-center text-gray-800 mb-1 line-clamp-2 min-h-[40px]">
                  {product.productName || product.name}
                </h3>
                
                {/* Product Brand */}
                <div className="text-xs text-center text-gray-600 font-medium">
                  {product.brand || "N/A"}
                </div>
              </div>
            ))}
            
            {/* Add Product Button */}
            {products.length < 3 && (
              <div className="flex-1 min-w-[200px] max-w-[300px] rounded-xl shadow-lg p-4 bg-white border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[220px]">
                <button
                  onClick={onAddProduct}
                  className="flex flex-col items-center text-gray-400 hover:text-green-600 transition-colors group"
                >
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 group-hover:border-green-500 flex items-center justify-center mb-3 transition-all group-hover:scale-110">
                    <FaPlus className="text-3xl" />
                  </div>
                  <span className="text-sm font-semibold">Add Product</span>
                </button>
              </div>
            )}
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Price Row - Highlighted */}
            <div className="flex border-b-2 border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="w-48 flex-shrink-0 p-4 font-bold text-gray-800 bg-green-100 flex items-center border-r-2 border-green-200">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                PRICE
              </div>
              {products.map((product, index) => (
                <div 
                  key={`price-${product.id}`}
                  className="flex-1 min-w-[200px] max-w-[300px] p-4 flex items-center justify-center"
                >
                  <div className="text-2xl font-bold text-green-600">
                    ₱{Number(product.price).toLocaleString()}
                  </div>
                </div>
              ))}
              {products.length < 3 && (
                <div className="flex-1 min-w-[200px] max-w-[300px] p-4 bg-gray-50"></div>
              )}
            </div>

            {/* Specifications Rows */}
            {getAllUniqueSpecLabels().map((label, specIndex) => {
              // Get values for all products for this spec label
              const values = products.map(product => {
                const specs = extractSpecifications(product);
                const matchingSpec = specs.find(s => s.label === label);
                return matchingSpec ? matchingSpec.value : 'N/A';
              });
              
              // Check if all values are the same (no difference)
              const allSame = values.every(v => v === values[0]);
              const rowBg = specIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white';
              
              return (
                <div 
                  key={`spec-row-${specIndex}-${label}`}
                  className={`flex border-b border-gray-200 hover:bg-blue-50 transition-colors ${rowBg}`}
                >
                  {/* Specification Label */}
                  <div className="w-48 flex-shrink-0 p-4 font-semibold text-gray-700 bg-gray-100 flex items-center border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      {!allSame && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="Different values"></div>
                      )}
                      <span className="text-sm">{label}</span>
                    </div>
                  </div>
                  
                  {/* Values for each product */}
                  {products.map((product, productIndex) => {
                    const specs = extractSpecifications(product);
                    const matchingSpec = specs.find(s => s.label === label);
                    const value = matchingSpec ? matchingSpec.value : 'N/A';
                    const isNA = value === 'N/A';
                    
                    return (
                      <div 
                        key={`value-${product.id}-${specIndex}-${label}`}
                        className={`flex-1 min-w-[200px] max-w-[300px] p-4 text-sm text-gray-700 ${
                          !allSame && !isNA ? 'font-medium' : ''
                        } ${isNA ? 'text-gray-400 italic' : ''}`}
                      >
                        <div className="break-words">
                          {matchingSpec ? renderSpecificationValue(matchingSpec) : value}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Empty cell for add button column */}
                  {products.length < 3 && (
                    <div className="flex-1 min-w-[200px] max-w-[300px] p-4 bg-gray-50"></div>
                  )}
                </div>
              );
            })}

            {/* Availability Row - Highlighted */}
            <div className="flex bg-gradient-to-r from-gray-50 to-slate-50">
              <div className="w-48 flex-shrink-0 p-4 font-bold text-gray-800 bg-gray-100 flex items-center border-r border-gray-200">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                AVAILABILITY
              </div>
              {products.map((product) => {
                const inStock = product.inStock !== undefined ? product.inStock : true;
                return (
                  <div 
                    key={`stock-${product.id}`}
                    className="flex-1 min-w-[200px] max-w-[300px] p-4 flex items-center justify-center"
                  >
                    <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                      inStock 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-red-100 text-red-700 border border-red-300'
                    }`}>
                      {inStock ? '✓ In Stock' : '✗ Out of Stock'}
                    </span>
                  </div>
                );
              })}
              {products.length < 3 && (
                <div className="flex-1 min-w-[200px] max-w-[300px] p-4 bg-gray-50"></div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-600 bg-white p-3 rounded-lg shadow">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Indicates different specifications</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Hover rows to highlight</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile view - Swipeable Cards */}
      <div className="md:hidden">
        {/* Mobile Products Carousel */}
        <div className="mb-4">
          <div className="overflow-x-auto -mx-4 px-4 pb-4 scrollbar-hide">
            <div className="flex gap-4">
              {products.map((product, index) => (
                <div 
                  key={product.id}
                  className={`flex-shrink-0 w-[80vw] rounded-xl shadow-lg p-4 border-t-4 relative ${getProductColorClass(index)}`}
                >
                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveProduct(product.id)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  {/* Product Image */}
                  <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center bg-white rounded-lg p-2">
                    <img
                      src={product.imageUrl || product.image}
                      alt={product.productName || product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  
                  {/* Product Name */}
                  <h3 className="text-sm font-bold text-center text-gray-800 mb-2">
                    {product.productName || product.name}
                  </h3>
                  
                  {/* Brand & Price */}
                  <div className="bg-white/50 rounded-lg p-3 mb-3">
                    <div className="text-xs text-gray-600 mb-1">{product.brand || "N/A"}</div>
                    <div className="text-xl font-bold text-green-600">₱{Number(product.price).toLocaleString()}</div>
                  </div>
                </div>
              ))}
              
              {/* Add Product Card */}
              {products.length < 3 && (
                <div className="flex-shrink-0 w-[80vw] rounded-xl shadow-lg p-4 bg-white border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[200px]">
                  <button
                    onClick={onAddProduct}
                    className="flex flex-col items-center text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-3">
                      <FaPlus className="text-3xl" />
                    </div>
                    <span className="text-sm font-semibold">Add Product</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Scroll Indicator */}
          {products.length > 1 && (
            <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-2 mt-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span>Swipe to view products</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          )}
        </div>

        {/* Mobile Comparison Table - Scrollable */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-gray-200">
                  <th className="sticky left-0 z-10 bg-green-100 p-3 text-left text-xs font-bold text-gray-800 min-w-[120px] border-r border-green-200">
                    SPECIFICATION
                  </th>
                  {products.map((product, index) => (
                    <th 
                      key={`header-${product.id}`}
                      className={`p-3 text-center text-xs font-bold min-w-[150px] ${getProductColorClass(index).split(' ')[0]}`}
                    >
                      <div className="truncate">{(product.productName || product.name).substring(0, 20)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price Row */}
                <tr className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                  <td className="sticky left-0 z-10 bg-green-100 p-3 font-semibold text-xs text-gray-800 border-r border-green-200">
                    💰 PRICE
                  </td>
                  {products.map((product) => (
                    <td 
                      key={`mobile-price-${product.id}`}
                      className="p-3 text-center"
                    >
                      <div className="text-lg font-bold text-green-600">
                        ₱{Number(product.price).toLocaleString()}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Specification Rows */}
                {getAllUniqueSpecLabels().map((label, specIndex) => {
                  const values = products.map(product => {
                    const specs = extractSpecifications(product);
                    const matchingSpec = specs.find(s => s.label === label);
                    return matchingSpec ? matchingSpec.value : 'N/A';
                  });
                  
                  const allSame = values.every(v => v === values[0]);
                  const rowBg = specIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white';
                  
                  return (
                    <tr 
                      key={`mobile-row-${specIndex}-${label}`}
                      className={`border-b border-gray-200 ${rowBg}`}
                    >
                      <td className={`sticky left-0 z-10 ${rowBg} p-3 font-semibold text-xs text-gray-700 border-r border-gray-200`}>
                        <div className="flex items-center gap-1">
                          {!allSame && (
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                          )}
                          <span className="line-clamp-2">{label}</span>
                        </div>
                      </td>
                      {products.map((product) => {
                        const specs = extractSpecifications(product);
                        const matchingSpec = specs.find(s => s.label === label);
                        const value = matchingSpec ? matchingSpec.value : 'N/A';
                        const isNA = value === 'N/A';
                        
                        return (
                          <td 
                            key={`mobile-value-${product.id}-${specIndex}-${label}`}
                            className={`p-3 text-xs ${
                              !allSame && !isNA ? 'font-medium text-gray-800' : 'text-gray-600'
                            } ${isNA ? 'text-gray-400 italic' : ''}`}
                          >
                            <div className="line-clamp-3 break-words">
                              {matchingSpec ? renderSpecificationValue(matchingSpec) : value}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Availability Row */}
                <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                  <td className="sticky left-0 z-10 bg-gray-100 p-3 font-semibold text-xs text-gray-800 border-r border-gray-200">
                    ✓ AVAILABILITY
                  </td>
                  {products.map((product) => {
                    const inStock = product.inStock !== undefined ? product.inStock : true;
                    return (
                      <td 
                        key={`mobile-stock-${product.id}`}
                        className="p-3 text-center"
                      >
                        <span className={`px-2 py-1 rounded-full font-semibold text-xs ${
                          inStock 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {inStock ? '✓ In Stock' : '✗ Out'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Scroll hint */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
            <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span>Scroll table horizontally to compare</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Mobile Legend */}
        <div className="mt-4 p-3 bg-white rounded-lg shadow text-xs text-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Different specifications highlighted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;