import React from "react";

const Description = () => {

    return (
      <>
        <h1 className="text-2xl font-bold mb-4 mt-4">
          Coolermaster MWE850 V2 ATX 3.1 FM MPE-8501-AFAG-3E12 850watts Fully
          Modular 80+ Gold Power Supply
        </h1>
        <div className="flex flex-row mb-4">
          <h2 className="text-xl font-semibold">Brand: </h2>
          <span className="mb-4 ml-1">Coolermaster</span>
        </div>

        {/* Product Description */}
        <div className="desc">
          <h2 className="text-lg font-semibold mb-2">Product Description</h2>
          <p className="mb-4">
            Power your rig with the Cooler Master MWE850 V2 ATX 1 FM Power
            Supply. Offering 850W of reliable energy with 80+ Gold efficiency,
            it ensures optimal performance and low heat output...
          </p>
        </div>

        {/* Product Specifications */}
        <div className="specs">
          <h2 className="text-lg font-semibold mb-2">Product Specifications</h2>
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
        </div>

        <hr className="border-t-2 border-black my-4" />
      </>
    );
}

export default Description;