import React from "react";

const Description = ({ product }) => {
  // Determine if we're displaying a product or bundle
  const isBundle = product?.category === "Bundles" || product?.id?.startsWith("bundle-");

  return (
    <>
      <h1 className="text-2xl font-bold mb-4 mt-4">
        {product?.title || "Coolermaster MWE850 V2 ATX 3.1 FM MPE-8501-AFAG-3E12 850watts Fully Modular 80+ Gold Power Supply"}
      </h1>
      <div className="flex flex-row mb-4">
        <h2 className="text-xl font-semibold">Brand: </h2>
        <span className="mb-4 ml-1">{product?.brand || "Coolermaster"}</span>
      </div>

      {/* Product Description */}
      <div className="desc">
        <h2 className="text-lg font-semibold mb-2">Product Description</h2>
        <p className="mb-4">
          {product?.description || 
            "Power your rig with the Cooler Master MWE850 V2 ATX 1 FM Power Supply. Offering 850W of reliable energy with 80+ Gold efficiency, it ensures optimal performance and low heat output..."}
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
        {product?.specs ? (
          <ul className="list-disc list-inside mb-4">
            {product.specs.map((spec, index) => (
              <li key={index}>{spec.name}: {spec.value}</li>
            ))}
          </ul>
        ) : (
          <ul className="list-disc list-inside mb-4">
            <li>Model: MPE-8501-AFAG-3E</li>
            <li>ATX Version: ATX 12V v2.4</li>
            <li>PFC: Active PFC</li>
            <li>Input Voltage: 100-240V</li>
            <li>Input Current: 13A</li>
            <li>Input Frequency: 50-60Hz</li>
            <li>Dimensions (L x W x H): 180 x 150 x 86 mm</li>
            <li>Fan Size: 120mm</li>
            <li>Fan Bearing: HDB</li>
          </ul>
        )}
      </div>

      <hr className="border-t-2 border-black my-4" />
    </>
  );
}

export default Description;