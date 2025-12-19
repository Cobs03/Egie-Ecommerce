import React from "react";

const Description = ({ product }) => {
  // Determine if we're displaying a product or bundle
  const isBundle = product?.category === "Bundles" || product?.id?.startsWith("bundle-");

  return (
    <>
      <h1 className="text-2xl font-bold mb-4 mt-4">
        {product?.name || product?.title || "Product Name"}
      </h1>
      
      <div className="mb-4">
        <span className="font-semibold">Brand:</span>{" "}
        {typeof product?.brand === 'object' ? product?.brand?.name : product?.brand || "Brand"}
      </div>

      {/* Product Description */}
      <div className="desc">
        <h2 className="text-lg font-semibold mb-2">Product Description</h2>
        <p className="mb-4 whitespace-pre-line">
          {product?.description || "No description available."}
        </p>
      </div>

      {/* Bundle Components - Only show for bundles */}
      {isBundle && (
        <div className="bundle-components mb-6">
          <h2 className="text-lg font-semibold mb-2">Components in this Bundle</h2>
          <div className="bg-gray-100 p-4 rounded">
            {product?.components ? (
              product.components.map((component, index) => (
                <div key={index} className="mb-1">
                  <span className="font-medium">{component.name}:</span>{" "}
                  {component.value}
                </div>
              ))
            ) : (
              <>
                <div className="mb-1">
                  <span className="font-medium">CPU:</span> AMD Ryzen 7 7800X3D
                </div>
                <div className="mb-1">
                  <span className="font-medium">Motherboard:</span>{" "}
                  ASUS ROG STRIX B650-A GAMING WIFI
                </div>
                <div className="mb-1">
                  <span className="font-medium">RAM:</span> G.SKILL Trident Z5
                  RGB 32GB DDR5 6000MHz
                </div>
                <div className="mb-1">
                  <span className="font-medium">GPU:</span> NVIDIA GeForce RTX
                  4070 12GB
                </div>
                <div className="mb-1">
                  <span className="font-medium">Storage:</span> 2TB Samsung 990
                  Pro NVMe SSD
                </div>
                <div className="mb-1">
                  <span className="font-medium">Case:</span> Lian Li O11 Dynamic
                  EVO
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bundle Features - Only show for bundles */}
      {isBundle && (
        <div className="bundle-features mb-6">
          <h2 className="text-lg font-semibold mb-2">Bundle Features</h2>
          <ul className="list-disc pl-5">
            {product?.features ? (
              product.features.map((feature, index) => (
                <li key={index} className="mb-1">
                  {feature}
                </li>
              ))
            ) : (
              <>
                <li className="mb-1">Complete high-end gaming setup</li>
                <li className="mb-1">Premium components from trusted brands</li>
                <li className="mb-1">Pre-tested for stability and performance</li>
                <li className="mb-1">Easy setup with included guides</li>
                <li className="mb-1">Special holiday pricing</li>
              </>
            )}
          </ul>
        </div>
      )}

      {/* Product Specifications - Show for non-bundles or both */}
      <div className="specs">
        <h2 className="text-lg font-semibold mb-2">
          {isBundle ? "Additional Specifications" : "Product Specifications"}
        </h2>
        {product?.specifications && Object.keys(product.specifications).length > 0 ? (
          <div className="mb-4">
            {Object.entries(product.specifications).map(([componentId, specs], compIndex) => {
              // Handle if specs is an object with nested specifications
              if (typeof specs === 'object' && specs !== null) {
                return (
                  <div key={componentId} className="mb-4">
                    {Object.entries(specs)
                      .filter(([field, value]) => value && value !== '')
                      .map(([field, value], index) => {
                        // Format field name (convert camelCase to readable format)
                        const formattedField = field
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())
                          .trim();
                        
                        const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
                        
                        // Special handling for 'specifications' field - it's pre-formatted with line breaks
                        if (field === 'specifications') {
                          // Split the specifications by line and make labels bold
                          const lines = valueStr.split('\n');
                          return (
                            <div key={`${componentId}-${field}-${index}`} className="mb-2">
                              <div className="font-semibold mb-1">{formattedField}:</div>
                              <div className="whitespace-pre-wrap">
                                {lines.map((line, lineIndex) => {
                                  // Check if line has a colon (label: value format)
                                  const colonIndex = line.indexOf(':');
                                  if (colonIndex > 0) {
                                    const label = line.substring(0, colonIndex);
                                    const value = line.substring(colonIndex + 1);
                                    return (
                                      <div key={lineIndex}>
                                        <span className="font-bold">{label}:</span>{value}
                                      </div>
                                    );
                                  }
                                  // Line without colon, just display as-is
                                  return <div key={lineIndex}>{line}</div>;
                                })}
                              </div>
                            </div>
                          );
                        }
                        
                        // Regular fields display inline
                        return (
                          <div key={`${componentId}-${field}-${index}`} className="mb-1">
                            <span className="font-semibold">{formattedField}:</span> {valueStr}
                          </div>
                        );
                      })}
                  </div>
                );
              }
              
              // Handle simple string values (fallback)
              if (specs) {
                return (
                  <div key={componentId} className="mb-1 whitespace-pre-wrap">
                    <span className="font-semibold">{componentId}:</span> {String(specs)}
                  </div>
                );
              }
              
              return null;
            })}
          </div>
        ) : (
          <p className="text-gray-500 italic mb-4">No specifications available for this product.</p>
        )}
      </div>

      <hr className="border-t-2 border-black my-4" />
    </>
  );
}

export default Description;